import { HomePageClient } from "./home-page-client";
import { CmsHomeSlide } from "@/lib/home-slides";
import { selectPublicRows } from "@/lib/supabase-public";

export type CmsPublicPost = {
  id: string;
  slug: string | null;
  titulo: string | null;
  resumo: string | null;
  capa_url: string | null;
  categoria_id: string | null;
  departamento_id: string | null;
  publicado_em: string | null;
  created_at: string | null;
};

export default async function HomePage() {
  const [slides, posts] = await Promise.all([
    selectPublicRows<CmsHomeSlide>(
      "cms_home_slides",
      "select=id,titulo,subtitulo,descricao,data_label,imagem_url,botao_texto,botao_url,ordem,status,abrir_nova_aba,created_at,updated_at,created_by&status=eq.publicado&order=ordem.asc,updated_at.desc&limit=10",
    ),
    selectPublicRows<CmsPublicPost>(
      "cms_posts",
      "select=id,slug,titulo,resumo,categoria_id,departamento_id,capa_url,destaque_home,publicado_em,status,created_at&status=eq.publicado&order=destaque_home.desc,publicado_em.desc,created_at.desc&limit=4",
    ),
  ]);

  return <HomePageClient initialSlides={slides} initialPosts={posts} />;
}

