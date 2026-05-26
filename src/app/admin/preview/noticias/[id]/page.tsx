import { notFound } from "next/navigation";
import { NewsArticleView } from "@/app/noticias/news-article-view";
import { selectSupabaseRows } from "@/lib/supabase-admin";

type CmsPost = {
  id: string;
  titulo: string;
  resumo: string | null;
  conteudo: string | null;
  capa_url: string | null;
  autor_nome: string | null;
  publicado_em: string | null;
  created_at: string;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminNewsPreviewPage({ params }: PageProps) {
  const { id } = await params;
  const posts = await selectSupabaseRows<CmsPost>(
    "cms_posts",
    `select=id,titulo,resumo,conteudo,capa_url,autor_nome,publicado_em,created_at&id=eq.${encodeURIComponent(id)}&limit=1`,
  );
  const post = posts[0];

  if (!post) {
    notFound();
  }

  return <NewsArticleView post={post} backHref="/admin/noticias" backLabel="Voltar ao painel" preview />;
}
