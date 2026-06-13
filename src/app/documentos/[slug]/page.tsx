import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicLayout } from "@/components/site/PublicLayout";
import { DocumentDetailView } from "../document-detail-view";
import { absoluteUrl, buildSeoMetadata } from "@/lib/seo";
import { buildDocumentDownloadPath, CmsDocument, stripDocumentText } from "@/lib/documentos";
import { selectPublicRows } from "@/lib/supabase-public";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const documents = await selectPublicRows<CmsDocument>(
    "cms_documentos",
    `select=id,titulo,slug,descricao,categoria,arquivo_url,thumbnail_url,tipo_arquivo,tamanho,ordem,downloads,destaque,status,created_at,updated_at,created_by&status=eq.publicado&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  );
  const document = documents[0];

  if (!document) {
    return buildSeoMetadata({
      title: "Documento nao encontrado | COMIEADEPA",
      description: "O documento solicitado nao esta disponivel no portal institucional da COMIEADEPA.",
      path: `/documentos/${slug}`,
    });
  }

  return buildSeoMetadata({
    title: `${document.titulo} | COMIEADEPA`,
    description: stripDocumentText(document.descricao) || "Documento oficial da COMIEADEPA.",
    path: `/documentos/${document.slug}`,
    image: document.thumbnail_url,
    type: "article",
  });
}

export default async function DocumentPage({ params }: PageProps) {
  const { slug } = await params;
  const documents = await selectPublicRows<CmsDocument>(
    "cms_documentos",
    `select=id,titulo,slug,descricao,categoria,arquivo_url,thumbnail_url,tipo_arquivo,tamanho,ordem,downloads,destaque,status,created_at,updated_at,created_by&status=eq.publicado&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  );
  const document = documents[0];

  if (!document) {
    notFound();
  }

  const relatedDocuments = await selectRelatedDocuments(document);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DigitalDocument",
    name: document.titulo,
    description: document.descricao || "Documento oficial da COMIEADEPA.",
    url: absoluteUrl(`/documentos/${document.slug}`),
    thumbnailUrl: document.thumbnail_url ? absoluteUrl(document.thumbnail_url) : undefined,
    contentUrl: absoluteUrl(buildDocumentDownloadPath(document.slug)),
    fileFormat: document.tipo_arquivo || undefined,
  };

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DocumentDetailView document={document} relatedDocuments={relatedDocuments} />
    </PublicLayout>
  );
}

async function selectRelatedDocuments(document: CmsDocument) {
  const categoryQuery = document.categoria
    ? `&categoria=eq.${encodeURIComponent(document.categoria)}`
    : "";
  const related = await selectPublicRows<CmsDocument>(
    "cms_documentos",
    `select=id,titulo,slug,descricao,categoria,arquivo_url,thumbnail_url,tipo_arquivo,tamanho,ordem,downloads,destaque,status,created_at,updated_at,created_by&status=eq.publicado&id=neq.${encodeURIComponent(document.id)}${categoryQuery}&order=destaque.desc,downloads.desc,updated_at.desc&limit=3`,
  );

  if (related.length > 0 || !document.categoria) {
    return related;
  }

  return selectPublicRows<CmsDocument>(
    "cms_documentos",
    `select=id,titulo,slug,descricao,categoria,arquivo_url,thumbnail_url,tipo_arquivo,tamanho,ordem,downloads,destaque,status,created_at,updated_at,created_by&status=eq.publicado&id=neq.${encodeURIComponent(document.id)}&order=destaque.desc,downloads.desc,updated_at.desc&limit=3`,
  );
}
