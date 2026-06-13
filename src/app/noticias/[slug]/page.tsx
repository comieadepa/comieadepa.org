import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildSeoMetadata } from "@/lib/seo";
import { selectPublicRows } from "@/lib/supabase-public";
import { NewsArticleView } from "../news-article-view";
import { PublicLayout } from "@/components/site/PublicLayout";

type CmsPost = {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  conteudo: string | null;
  capa_url: string | null;
  autor_nome: string | null;
  categoria_id: string | null;
  departamento_id: string | null;
  publicado_em: string | null;
  created_at: string;
};

type CmsLookup = {
  id: string;
  nome: string | null;
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const posts = await selectPublicRows<CmsPost>(
    "cms_posts",
    `select=id,titulo,slug,resumo,conteudo,capa_url,autor_nome,categoria_id,departamento_id,publicado_em,created_at&status=eq.publicado&slug=eq.${encodeURIComponent(slug)}${getPublishedPostsPublicFilter()}&limit=1`,
  );
  const post = posts[0];

  if (!post) {
    return buildSeoMetadata({
      title: "Notícia não encontrada | COMIEADEPA",
      description: "A notícia solicitada não está disponível no portal institucional da COMIEADEPA.",
      path: `/noticias/${slug}`,
    });
  }

  return buildSeoMetadata({
    title: `${post.titulo} | COMIEADEPA`,
    description: post.resumo || stripContent(post.conteudo) || "Notícia oficial da COMIEADEPA.",
    path: `/noticias/${post.slug}`,
    image: post.capa_url,
    type: "article",
  });
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const [posts, categories, departments] = await Promise.all([
    selectPublicRows<CmsPost>(
      "cms_posts",
      `select=id,titulo,slug,resumo,conteudo,capa_url,autor_nome,categoria_id,departamento_id,publicado_em,created_at&status=eq.publicado&slug=eq.${encodeURIComponent(slug)}${getPublishedPostsPublicFilter()}&limit=1`,
    ),
    selectPublicRows<CmsLookup>("cms_categorias", "select=id,nome&order=nome.asc"),
    selectPublicRows<CmsLookup>("cms_departamentos", "select=id,nome&ativo=eq.true&order=ordem.asc,nome.asc"),
  ]);
  const post = posts[0];

  if (!post) {
    notFound();
  }

  const categoryMap = buildLookupMap(categories);
  const departmentMap = buildLookupMap(departments);

  return (
    <PublicLayout>
      <NewsArticleView post={{ ...post, label: resolvePostLabel(post, categoryMap, departmentMap) }} />
    </PublicLayout>
  );
}

function buildLookupMap(rows: CmsLookup[]) {
  return new Map(rows.map((row) => [row.id, row.nome?.trim() ?? ""]));
}

function resolvePostLabel(post: CmsPost, categoryMap: Map<string, string>, departmentMap: Map<string, string>) {
  return categoryMap.get(post.categoria_id ?? "") || departmentMap.get(post.departamento_id ?? "") || "Notícia";
}

function getPublishedPostsPublicFilter() {
  return `&or=(publicado_em.is.null,publicado_em.lte.${encodeURIComponent(new Date().toISOString())})`;
}

function stripContent(value: string | null) {
  return value
    ?.replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[#>*_`-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}
