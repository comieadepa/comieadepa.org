import { HomePageClient } from "./home-page-client";
import { CmsHomeSlide } from "@/lib/home-slides";
import { selectPublicRows } from "@/lib/supabase-public";

export default async function HomePage() {
  const slides = await selectPublicRows<CmsHomeSlide>(
    "cms_home_slides",
    "select=id,titulo,subtitulo,descricao,data_label,imagem_url,botao_texto,botao_url,ordem,status,abrir_nova_aba,created_at,updated_at,created_by&status=eq.publicado&order=ordem.asc,updated_at.desc&limit=10",
  );

  return <HomePageClient initialSlides={slides} />;
}
