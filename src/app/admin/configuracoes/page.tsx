import { selectSupabaseRows } from "@/lib/supabase-admin";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import { Settings } from "lucide-react";
import { SettingsForm } from "./settings-form";
import { StatusMessage } from "../status-message";
import { AdminPageHeader } from "../admin-ui";
import { headers } from "next/headers";

type CmsSetting = {
  chave: string;
  valor: unknown;
};

const settingFields = [
  {
    group: "Integrações",
    description: "Eventos e Área do Ministro continuam em sistemas externos. Aqui guardamos apenas os links usados pelo portal.",
    fields: [
      { name: "url_eventos", label: "Sistema oficial de eventos", placeholder: "https://eventos.siscomieadepa.org/eventos-publicos" },
      { name: "url_area_ministro", label: "Área do Ministro", placeholder: "Cole aqui quando o sistema de gestão liberar o link" },
    ],
  },
  {
    group: "Contato",
    description: "Informações exibidas no rodapé e em pontos institucionais do site.",
    fields: [
      { name: "contato_endereco", label: "Endereço", placeholder: "Rodovia Mário Covas, 2500" },
      { name: "contato_telefone", label: "Telefone", placeholder: "55 (91) 0000-0000" },
      { name: "contato_email", label: "E-mail", placeholder: "secretaria@comieadepa.com.br" },
      { name: "contato_horario", label: "Horário de atendimento", placeholder: "9h às 17h - Segunda a Sexta" },
    ],
  },
  {
    group: "Redes sociais",
    description: "Links oficiais usados no rodapé e nas chamadas públicas.",
    fields: [
      { name: "youtube_channel_url", label: "YouTube", placeholder: "https://www.youtube.com/@comieadepa" },
      { name: "facebook_url", label: "Facebook", placeholder: "https://facebook.com/..." },
      { name: "instagram_url", label: "Instagram", placeholder: "https://instagram.com/..." },
    ],
  },
  {
    group: "Home - primeira dobra",
    description: "Textos mais visíveis da abertura do portal. Ajuste com cuidado, pois esta área define a primeira impressão do site.",
    fields: [
      { name: "home_hero_selo", label: "Selo superior", placeholder: "Berço do pentecostes no Brasil" },
      { name: "home_hero_titulo", label: "Título principal", placeholder: "COMIEADEPA" },
      { name: "home_hero_subtitulo", label: "Chamada principal", placeholder: "A primeira convenção assembleiana do Brasil..." },
      { name: "home_hero_texto", label: "Texto de apoio", placeholder: "Mais de cem anos proclamando o Evangelho..." },
      { name: "home_hero_botao_primario", label: "Botão primário", placeholder: "Conheça a história" },
      { name: "home_hero_link_primario", label: "Link do botão primário", placeholder: "#a-comieadepa" },
      { name: "home_hero_botao_secundario", label: "Botão secundário", placeholder: "Eventos oficiais" },
      { name: "home_ago_selo", label: "Selo da AGO", placeholder: "Próxima AGO" },
      { name: "home_ago_titulo", label: "Título da chamada da AGO", placeholder: "125ª Assembleia Geral Ordinária" },
    ],
  },
  {
    group: "Home - A COMIEADEPA",
    description: "Conteúdo institucional da seção de apresentação da convenção.",
    fields: [
      { name: "home_sobre_selo", label: "Selo da seção", placeholder: "A COMIEADEPA" },
      { name: "home_sobre_titulo", label: "Título", placeholder: "A primeira convenção assembleiana do Brasil." },
      { name: "home_sobre_texto", label: "Texto institucional", placeholder: "Fundada em 18 de agosto de 1921..." },
      { name: "home_sobre_imagem_url", label: "Imagem principal", placeholder: "/assets/sede-aerea-comieadepa.jpg" },
      { name: "home_sobre_selo_url", label: "Selo visual", placeholder: "/assets/selo-comieadepa-dourado.png" },
      { name: "home_sobre_data", label: "Data destacada", placeholder: "18.08.1921" },
      { name: "home_sobre_legenda", label: "Legenda da data", placeholder: "Berço do pentecostes no Brasil" },
      { name: "home_sobre_pilar_1", label: "Pilar 1", placeholder: "Evangelismo" },
      { name: "home_sobre_pilar_2", label: "Pilar 2", placeholder: "Missões" },
      { name: "home_sobre_pilar_3", label: "Pilar 3", placeholder: "Ação Social" },
    ],
  },
  {
    group: "Home - Presidência",
    description: "Texto, assinatura e imagem da palavra institucional da Presidência.",
    fields: [
      { name: "home_presidencia_imagem_url", label: "Imagem", placeholder: "/assets/presidente-comieadepa.png" },
      { name: "home_presidencia_nome", label: "Nome", placeholder: "Pr. Océlio Nauar" },
      { name: "home_presidencia_cargo", label: "Cargo", placeholder: "Presidente COMIEADEPA" },
      { name: "home_presidencia_iniciais", label: "Iniciais", placeholder: "ON" },
      { name: "home_presidencia_selo", label: "Selo da seção", placeholder: "Palavra do Presidente" },
      { name: "home_presidencia_titulo_linha_1", label: "Título - linha 1", placeholder: "Servindo com" },
      { name: "home_presidencia_titulo_destaque", label: "Título - destaque", placeholder: "Integridade" },
      { name: "home_presidencia_titulo_linha_2", label: "Título - linha 2", placeholder: "e Fidelidade" },
      { name: "home_presidencia_texto_1", label: "Parágrafo 1", placeholder: "A COMIEADEPA segue firme..." },
      { name: "home_presidencia_texto_2", label: "Parágrafo 2", placeholder: "A cada pastor, líder e membro..." },
      { name: "home_presidencia_texto_3", label: "Parágrafo 3", placeholder: "Sigamos em oração..." },
    ],
  },
  {
    group: "Home - Eventos",
    description: "Narrativa da área de eventos. Os cards continuam vindo automaticamente do sistema oficial de eventos.",
    fields: [
      { name: "home_eventos_selo", label: "Selo da seção", placeholder: "Eventos oficiais" },
      { name: "home_eventos_titulo", label: "Título", placeholder: "Eventos que edificam a história pentecostal do Pará." },
      { name: "home_eventos_texto", label: "Texto de apoio", placeholder: "A agenda convencional reúne assembleias..." },
    ],
  },
  {
    group: "Home - Conteúdos",
    description: "Textos das áreas de notícias, vídeos, departamentos e transmissões.",
    fields: [
      { name: "home_noticias_selo", label: "Notícias - selo", placeholder: "Notícias" },
      { name: "home_noticias_titulo", label: "Notícias - título", placeholder: "A voz oficial da COMIEADEPA." },
      { name: "home_videos_selo", label: "Vídeos - selo", placeholder: "Vídeos" },
      { name: "home_videos_titulo", label: "Vídeos - título", placeholder: "A convenção em movimento." },
      { name: "home_videos_texto", label: "Vídeos - texto", placeholder: "Registros oficiais de congressos..." },
      { name: "home_videos_botao", label: "Vídeos - botão", placeholder: "Ver todos os vídeos" },
      { name: "home_departamentos_selo", label: "Departamentos - selo", placeholder: "Departamentos" },
      { name: "home_departamentos_titulo", label: "Departamentos - título", placeholder: "Conselhos, comissões e departamentos da convenção." },
      { name: "home_departamentos_texto", label: "Departamentos - texto", placeholder: "Uma rede de trabalho que sustenta..." },
      { name: "home_eventos_video_selo", label: "YouTube eventos - selo", placeholder: "YouTube" },
      { name: "home_eventos_video_titulo", label: "YouTube eventos - título", placeholder: "Assista Nossos Eventos" },
      { name: "home_eventos_video_texto", label: "YouTube eventos - texto", placeholder: "Confira transmissões..." },
      { name: "home_eventos_video_botao", label: "YouTube eventos - botão", placeholder: "Inscreva-se no Canal" },
      { name: "home_eventos_video_inscritos", label: "YouTube eventos - inscritos", placeholder: "15.3K inscritos" },
    ],
  },
  {
    group: "SEO padrão",
    description: "Base usada para metadados gerais do portal. Páginas específicas ainda podem sobrescrever esses textos.",
    fields: [
      { name: "seo_titulo_padrao", label: "Título padrão", placeholder: "COMIEADEPA | Portal Institucional" },
      { name: "seo_descricao_padrao", label: "Descrição padrão", placeholder: "Portal institucional da COMIEADEPA..." },
    ],
  },
];

const fallbackSettings: Record<string, string> = {
  url_eventos: "https://eventos.siscomieadepa.org/eventos-publicos",
  url_area_ministro: "https://www.siscomieadepa.org/login",
  youtube_channel_url: "https://www.youtube.com/@comieadepa",
  facebook_url: "",
  instagram_url: "",
  contato_endereco: "Rodovia Mário Covas, 2500",
  contato_telefone: "55 (91) 0000-0000",
  contato_email: "secretaria@comieadepa.com.br",
  contato_horario: "9h às 17h - Segunda a Sexta",
  home_hero_selo: "Berço do pentecostes no Brasil",
  home_hero_titulo: "COMIEADEPA",
  home_hero_subtitulo: "A primeira convenção assembleiana do Brasil, fundada em 18 de agosto de 1921, no estado do Pará.",
  home_hero_texto:
    "Mais de cem anos proclamando o Evangelho, reunindo ministros, igrejas e congregações em todo o Pará. Uma convenção edificada sobre fé, missão e fidelidade inabalável à Palavra de Deus.",
  home_hero_botao_primario: "Conheça a história",
  home_hero_link_primario: "#a-comieadepa",
  home_hero_botao_secundario: "Eventos oficiais",
  home_ago_selo: "Próxima AGO",
  home_ago_titulo: "125ª Assembleia Geral Ordinária",
  home_sobre_selo: "A COMIEADEPA",
  home_sobre_titulo: "A primeira convenção assembleiana do Brasil.",
  home_sobre_texto:
    "Fundada em 18 de agosto de 1921, a COMIEADEPA é reconhecida como a primeira convenção das Assembleias de Deus no Brasil. Nascida no solo paraense, onde o pentecostalismo clássico floresceu, a convenção reúne milhares de ministros, igrejas e congregações em centenas de campos eclesiásticos por todo o Pará — reconhecida como Patrimônio Cultural Material e Imaterial do Estado.",
  home_sobre_imagem_url: "/assets/sede-aerea-comieadepa.jpg",
  home_sobre_selo_url: "/assets/selo-comieadepa-dourado.png",
  home_sobre_data: "18.08.1921",
  home_sobre_legenda: "Berço do pentecostes no Brasil",
  home_sobre_pilar_1: "Evangelismo",
  home_sobre_pilar_2: "Missões",
  home_sobre_pilar_3: "Ação Social",
  home_presidencia_imagem_url: "/assets/presidente-comieadepa.png",
  home_presidencia_nome: "Pr. Océlio Nauar",
  home_presidencia_cargo: "Presidente COMIEADEPA",
  home_presidencia_iniciais: "ON",
  home_presidencia_selo: "Palavra do Presidente",
  home_presidencia_titulo_linha_1: "Servindo com",
  home_presidencia_titulo_destaque: "Integridade",
  home_presidencia_titulo_linha_2: "e Fidelidade",
  home_presidencia_texto_1: "A COMIEADEPA segue firme no propósito de servir a Deus com integridade, unidade e compromisso com a Palavra.",
  home_presidencia_texto_2:
    "A cada pastor, líder e membro, reafirmamos: sua dedicação não é em vão. Mesmo diante dos desafios, Deus sustenta e honra os que O servem com fidelidade.",
  home_presidencia_texto_3: "Sigamos em oração, com visão espiritual e amor pelas almas. O Senhor é conosco e maiores ainda são as obras que Ele realizará!",
  home_eventos_selo: "Eventos oficiais",
  home_eventos_titulo: "Eventos que edificam a história pentecostal do Pará.",
  home_eventos_texto:
    "A agenda convencional reúne assembleias, congressos, capacitações e encontros ministeriais que organizam a comunhão da obra, fortalecem departamentos e conectam ministros, igrejas e regiões em torno da missão da COMIEADEPA.",
  home_noticias_selo: "Notícias",
  home_noticias_titulo: "A voz oficial da COMIEADEPA.",
  home_videos_selo: "Vídeos",
  home_videos_titulo: "A convenção em movimento.",
  home_videos_texto: "Registros oficiais de congressos, assembleias e momentos marcantes da maior e mais histórica convenção assembleiana do Brasil.",
  home_videos_botao: "Ver todos os vídeos",
  home_departamentos_selo: "Departamentos",
  home_departamentos_titulo: "Conselhos, comissões e departamentos da convenção.",
  home_departamentos_texto:
    "Uma rede de trabalho que sustenta a vida convencional: formação, cuidado, juventude, ensino e serviço caminhando juntos para fortalecer igrejas, famílias ministeriais e a missão em todo o Pará.",
  home_eventos_video_selo: "YouTube",
  home_eventos_video_titulo: "Assista Nossos Eventos",
  home_eventos_video_texto: "Confira transmissões, gravações e registros oficiais dos congressos, assembleias e reuniões ministeriais.",
  home_eventos_video_botao: "Inscreva-se no Canal",
  home_eventos_video_inscritos: "15.3K inscritos",
  seo_titulo_padrao: "COMIEADEPA | Portal Institucional",
  seo_descricao_padrao: "Portal institucional da COMIEADEPA, a primeira convenção assembleiana do Brasil.",
};

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const headerList = await headers();
  const role = normalizeAdminRole(headerList.get("x-admin-role"));
  const canEdit = canPerformAdminAction(role, "configuracoes", "manage_settings");
  const settings = await selectSupabaseRows<CmsSetting>("cms_configuracoes", "select=chave,valor&order=grupo.asc,chave.asc");
  const settingMap = new Map(settings.map((setting) => [setting.chave, stringifySettingValue(setting.valor)]));
  const settingValues = Object.fromEntries(Object.keys(fallbackSettings).map((key) => [key, settingMap.get(key) ?? fallbackSettings[key] ?? ""]));

  return (
    <div className="mx-auto max-w-7xl">
      <StatusMessage success={params?.success} error={params?.message ?? params?.error} />

      <AdminPageHeader
        icon={Settings}
        eyebrow="Sistema e Parâmetros"
        title="Configurações Gerais do Portal"
        description="Mantenha os links oficiais, contatos, integrações externas (Eventos e Área do Ministro) e padrões de SEO sincronizados."
      />

      <section className="border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
        <SettingsForm groups={settingFields} values={settingValues} canEdit={canEdit} />
      </section>
    </div>
  );
}

function stringifySettingValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}
