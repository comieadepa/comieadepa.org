import {
  createAuditLog,
  hasSupabaseAdminConfig,
  insertSupabaseRow,
  missingSupabaseAdminResponse,
  redirectWithStatus,
  requiredString,
  updateSupabaseRows,
} from "@/lib/supabase-admin";

const editableSettings = [
  "url_area_ministro",
  "url_eventos",
  "youtube_channel_url",
  "facebook_url",
  "instagram_url",
  "contato_endereco",
  "contato_telefone",
  "contato_email",
  "contato_horario",
  "home_hero_selo",
  "home_hero_titulo",
  "home_hero_subtitulo",
  "home_hero_texto",
  "home_hero_botao_primario",
  "home_hero_link_primario",
  "home_hero_botao_secundario",
  "home_ago_selo",
  "home_ago_titulo",
  "home_sobre_selo",
  "home_sobre_titulo",
  "home_sobre_texto",
  "home_sobre_imagem_url",
  "home_sobre_selo_url",
  "home_sobre_data",
  "home_sobre_legenda",
  "home_sobre_pilar_1",
  "home_sobre_pilar_2",
  "home_sobre_pilar_3",
  "home_presidencia_imagem_url",
  "home_presidencia_nome",
  "home_presidencia_cargo",
  "home_presidencia_iniciais",
  "home_presidencia_selo",
  "home_presidencia_titulo_linha_1",
  "home_presidencia_titulo_destaque",
  "home_presidencia_titulo_linha_2",
  "home_presidencia_texto_1",
  "home_presidencia_texto_2",
  "home_presidencia_texto_3",
  "home_eventos_selo",
  "home_eventos_titulo",
  "home_eventos_texto",
  "home_noticias_selo",
  "home_noticias_titulo",
  "home_videos_selo",
  "home_videos_titulo",
  "home_videos_texto",
  "home_videos_botao",
  "home_departamentos_selo",
  "home_departamentos_titulo",
  "home_departamentos_texto",
  "home_eventos_video_selo",
  "home_eventos_video_titulo",
  "home_eventos_video_texto",
  "home_eventos_video_botao",
  "home_eventos_video_inscritos",
  "seo_titulo_padrao",
  "seo_descricao_padrao",
] as const;

const settingGroups: Record<(typeof editableSettings)[number], string> = {
  url_area_ministro: "links",
  url_eventos: "links",
  youtube_channel_url: "redes",
  facebook_url: "redes",
  instagram_url: "redes",
  contato_endereco: "contato",
  contato_telefone: "contato",
  contato_email: "contato",
  contato_horario: "contato",
  home_hero_selo: "home",
  home_hero_titulo: "home",
  home_hero_subtitulo: "home",
  home_hero_texto: "home",
  home_hero_botao_primario: "home",
  home_hero_link_primario: "home",
  home_hero_botao_secundario: "home",
  home_ago_selo: "home",
  home_ago_titulo: "home",
  home_sobre_selo: "home",
  home_sobre_titulo: "home",
  home_sobre_texto: "home",
  home_sobre_imagem_url: "home",
  home_sobre_selo_url: "home",
  home_sobre_data: "home",
  home_sobre_legenda: "home",
  home_sobre_pilar_1: "home",
  home_sobre_pilar_2: "home",
  home_sobre_pilar_3: "home",
  home_presidencia_imagem_url: "home",
  home_presidencia_nome: "home",
  home_presidencia_cargo: "home",
  home_presidencia_iniciais: "home",
  home_presidencia_selo: "home",
  home_presidencia_titulo_linha_1: "home",
  home_presidencia_titulo_destaque: "home",
  home_presidencia_titulo_linha_2: "home",
  home_presidencia_texto_1: "home",
  home_presidencia_texto_2: "home",
  home_presidencia_texto_3: "home",
  home_eventos_selo: "home",
  home_eventos_titulo: "home",
  home_eventos_texto: "home",
  home_noticias_selo: "home",
  home_noticias_titulo: "home",
  home_videos_selo: "home",
  home_videos_titulo: "home",
  home_videos_texto: "home",
  home_videos_botao: "home",
  home_departamentos_selo: "home",
  home_departamentos_titulo: "home",
  home_departamentos_texto: "home",
  home_eventos_video_selo: "home",
  home_eventos_video_titulo: "home",
  home_eventos_video_texto: "home",
  home_eventos_video_botao: "home",
  home_eventos_video_inscritos: "home",
  seo_titulo_padrao: "seo",
  seo_descricao_padrao: "seo",
};

export async function POST(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const formData = await request.formData();

  try {
    await Promise.all(
      editableSettings.map(async (key) => {
        const value = requiredString(formData, key);
        const payload = {
          chave: key,
          valor: value,
          grupo: settingGroups[key],
          publico: true,
          updated_at: new Date().toISOString(),
        };
        const updated = (await updateSupabaseRows("cms_configuracoes", `chave=eq.${encodeURIComponent(key)}`, payload)) as unknown[];

        if (updated.length === 0) {
          await insertSupabaseRow("cms_configuracoes", payload);
        }
      }),
    );

    await createAuditLog({
      request,
      action: "update",
      entity: "configuracoes",
      entityTitle: "Configurações do portal",
      metadata: { keys: editableSettings },
    });

    return redirectWithStatus(request.url, "/admin/configuracoes", "success");
  } catch (error) {
    return redirectWithStatus(request.url, "/admin/configuracoes", "error", error instanceof Error ? error.message : "Erro ao salvar configurações.");
  }
}
