import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildSeoMetadata } from "@/lib/seo";
import { selectPublicRows } from "@/lib/supabase-public";
import { PublicLayout } from "@/components/site/PublicLayout";
import { InstitutionalHero } from "@/components/site/InstitutionalHero";
import { InstitutionalContent } from "@/components/site/InstitutionalContent";
import { CmsInstitucional } from "@/lib/institucional";
import { CmsInstitucionalSecao } from "@/app/api/admin/institucional/secoes/route";
import { CmsInstitucionalCard } from "@/app/api/admin/institucional/cards/route";
import { CmsInstitucionalDocumento } from "@/app/api/admin/institucional/documentos/route";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const items = await selectPublicRows<CmsInstitucional>(
    "cms_institucional",
    `select=titulo,slug,descricao,hero_image_url,seo_title,seo_description&status=eq.publicado&slug=eq.${encodeURIComponent(slug)}&limit=1`
  );
  const page = items[0];

  if (!page) {
    return buildSeoMetadata({
      title: "Página não encontrada | COMIEADEPA",
      description: "A página solicitada não está disponível no portal institucional da COMIEADEPA.",
      path: `/institucional/${slug}`,
    });
  }

  return buildSeoMetadata({
    title: page.seo_title?.trim() || `${page.titulo} | COMIEADEPA`,
    description: page.seo_description || page.descricao || "Página institucional da COMIEADEPA.",
    path: `/institucional/${page.slug}`,
    image: page.hero_image_url,
    type: "article",
  });
}

export default async function InstitucionalPage({ params }: PageProps) {
  const { slug } = await params;

  // Page data
  const items = await selectPublicRows<CmsInstitucional>(
    "cms_institucional",
    `select=id,titulo,slug,subtitulo,descricao,conteudo,hero_image_url,hero_badge,hero_overlay_opacity,hero_alignment&status=eq.publicado&slug=eq.${encodeURIComponent(slug)}&limit=1`
  );
  const page = items[0];

  if (!page) {
    notFound();
  }

  // Active sections
  const secoes = await selectPublicRows<CmsInstitucionalSecao>(
    "cms_institucional_secoes",
    `select=id,tipo,titulo,subtitulo,conteudo,imagem_url,ordem&ativo=eq.true&institucional_id=eq.${encodeURIComponent(page.id)}&order=ordem.asc,created_at.asc&limit=100`
  );

  const secaoIds = secoes.map((s) => s.id);

  // Cards for card-type sections
  const cards =
    secaoIds.length > 0
      ? await selectPublicRows<CmsInstitucionalCard>(
          "cms_institucional_cards",
          `select=id,secao_id,titulo,subtitulo,descricao,imagem_url,icone,link_url,link_texto,ordem&ativo=eq.true&secao_id=in.(${secaoIds.join(",")})`+
          `&order=ordem.asc,created_at.asc&limit=200`
        )
      : [];

  // Documents for documentos-type sections
  const linkedDocs =
    secaoIds.length > 0
      ? await selectPublicRows<CmsInstitucionalDocumento>(
          "cms_institucional_documentos",
          `select=id,secao_id,documento_id,ordem,cms_documentos(id,titulo,slug,categoria,arquivo_url,tamanho,tipo_arquivo)&ativo=eq.true&secao_id=in.(${secaoIds.join(",")})`+
          `&order=ordem.asc,created_at.asc&limit=100`
        )
      : [];

  return (
    <PublicLayout>
      <main className="min-h-screen bg-white text-[#1F2937]">
        <article>
          <InstitutionalHero
            title={page.titulo}
            subtitle={page.subtitulo}
            backgroundImage={page.hero_image_url}
            overlayOpacity={page.hero_overlay_opacity}
            badge={page.hero_badge}
            alignment={page.hero_alignment}
          />

          <InstitutionalContent
            descricao={page.descricao}
            conteudo={page.conteudo}
            secoes={secoes}
            cards={cards}
            linkedDocs={linkedDocs}
          />
        </article>
      </main>
    </PublicLayout>
  );
}
