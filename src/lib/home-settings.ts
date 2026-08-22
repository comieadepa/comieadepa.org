import type { AdminRole } from "./admin-permissions";

export type HomeSettingFieldType = "text" | "textarea" | "image" | "number";

export type HomeSettingKey =
  | "home_hero_selo"
  | "home_hero_titulo"
  | "home_hero_subtitulo"
  | "home_hero_texto"
  | "home_hero_botao_primario"
  | "home_hero_link_primario"
  | "home_hero_botao_secundario"
  | "home_hero_imagem_direita_url"
  | "home_hero_intervalo_segundos"
  | "home_ago_selo"
  | "home_ago_titulo"
  | "home_sobre_selo"
  | "home_sobre_titulo"
  | "home_sobre_texto"
  | "home_sobre_imagem_url"
  | "home_sobre_selo_url"
  | "home_sobre_data"
  | "home_sobre_legenda"
  | "home_sobre_pilar_1"
  | "home_sobre_pilar_2"
  | "home_sobre_pilar_3"
  | "home_presidencia_imagem_url"
  | "home_presidencia_nome"
  | "home_presidencia_cargo"
  | "home_presidencia_iniciais"
  | "home_presidencia_selo"
  | "home_presidencia_titulo_linha_1"
  | "home_presidencia_titulo_destaque"
  | "home_presidencia_titulo_linha_2"
  | "home_presidencia_texto_1"
  | "home_presidencia_texto_2"
  | "home_presidencia_texto_3"
  | "home_eventos_selo"
  | "home_eventos_titulo"
  | "home_eventos_texto"
  | "home_noticias_selo"
  | "home_noticias_titulo"
  | "home_videos_selo"
  | "home_videos_titulo"
  | "home_videos_texto"
  | "home_videos_botao"
  | "home_departamentos_selo"
  | "home_departamentos_titulo"
  | "home_departamentos_texto"
  | "home_eventos_video_selo"
  | "home_eventos_video_titulo"
  | "home_eventos_video_texto"
  | "home_eventos_video_botao"
  | "home_eventos_video_inscritos";

export type HomeSettingField = {
  name: HomeSettingKey;
  label: string;
  placeholder: string;
  type?: HomeSettingFieldType;
  helper?: string;
};

export type HomeSettingSection = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  fields: HomeSettingField[];
};

export const homeSettingSections: HomeSettingSection[] = [
  {
    id: "hero",
    title: "Primeira dobra",
    eyebrow: "Abertura",
    description: "Ajustes complementares do hero, incluindo imagem lateral, ritmo da troca de slides e destaque da AGO.",
    fields: [
      { name: "home_hero_botao_secundario", label: "Botão secundário", placeholder: "Eventos oficiais" },
      {
        name: "home_hero_imagem_direita_url",
        label: "Imagem lateral do hero",
        placeholder: "/img/presidente.png",
        type: "image",
        helper: "Imagem exibida no lado direito da abertura em telas maiores.",
      },
      {
        name: "home_hero_intervalo_segundos",
        label: "Alternância dos slides (segundos)",
        placeholder: "7",
        type: "number",
        helper: "Tempo de exibição de cada slide antes da próxima transição.",
      },
      { name: "home_ago_selo", label: "Selo da AGO", placeholder: "Próxima AGO" },
      { name: "home_ago_titulo", label: "Título da chamada da AGO", placeholder: "125ª Assembleia Geral Ordinária" },
    ],
  },
  {
    id: "sobre",
    title: "A COMIEADEPA",
    eyebrow: "Institucional",
    description: "Texto, imagem e pilares da seção institucional da home.",
    fields: [
      { name: "home_sobre_selo", label: "Selo da seção", placeholder: "A COMIEADEPA" },
      { name: "home_sobre_titulo", label: "Título", placeholder: "A primeira convenção assembleiana do Brasil." },
      { name: "home_sobre_texto", label: "Texto institucional", placeholder: "Fundada em 18 de agosto de 1921...", type: "textarea" },
      {
        name: "home_sobre_imagem_url",
        label: "Imagem principal",
        placeholder: "/assets/sede-aerea-comieadepa.jpg",
        type: "image",
        helper: "Prefira imagem horizontal, em boa resolução.",
      },
      { name: "home_sobre_selo_url", label: "Selo visual", placeholder: "/assets/selo-comieadepa-dourado.png", type: "image" },
      { name: "home_sobre_data", label: "Data destacada", placeholder: "18.08.1921" },
      { name: "home_sobre_legenda", label: "Legenda da data", placeholder: "Berço do pentecostes no Brasil" },
      { name: "home_sobre_pilar_1", label: "Pilar 1", placeholder: "Evangelismo" },
      { name: "home_sobre_pilar_2", label: "Pilar 2", placeholder: "Missões" },
      { name: "home_sobre_pilar_3", label: "Pilar 3", placeholder: "Ação Social" },
    ],
  },
  {
    id: "presidencia",
    title: "Presidência",
    eyebrow: "Palavra institucional",
    description: "Imagem, assinatura e texto da mensagem da presidência.",
    fields: [
      { name: "home_presidencia_imagem_url", label: "Imagem", placeholder: "/assets/presidente-comieadepa.png", type: "image" },
      { name: "home_presidencia_nome", label: "Nome", placeholder: "Pr. Océlio Nauar" },
      { name: "home_presidencia_cargo", label: "Cargo", placeholder: "Presidente COMIEADEPA" },
      { name: "home_presidencia_iniciais", label: "Iniciais", placeholder: "ON" },
      { name: "home_presidencia_selo", label: "Selo da seção", placeholder: "Palavra do Presidente" },
      { name: "home_presidencia_titulo_linha_1", label: "Título - linha 1", placeholder: "Servindo com" },
      { name: "home_presidencia_titulo_destaque", label: "Título - destaque", placeholder: "Integridade" },
      { name: "home_presidencia_titulo_linha_2", label: "Título - linha 2", placeholder: "e Fidelidade" },
      { name: "home_presidencia_texto_1", label: "Parágrafo 1", placeholder: "A COMIEADEPA segue firme...", type: "textarea" },
      { name: "home_presidencia_texto_2", label: "Parágrafo 2", placeholder: "A cada pastor, líder e membro...", type: "textarea" },
      { name: "home_presidencia_texto_3", label: "Parágrafo 3", placeholder: "Sigamos em oração...", type: "textarea" },
    ],
  },
  {
    id: "eventos",
    title: "Eventos",
    eyebrow: "Agenda",
    description: "Narrativa da área de eventos. Os cards continuam vindo do sistema de eventos.",
    fields: [
      { name: "home_eventos_selo", label: "Selo da seção", placeholder: "Eventos oficiais" },
      { name: "home_eventos_titulo", label: "Título", placeholder: "Eventos que edificam a história pentecostal do Pará." },
      { name: "home_eventos_texto", label: "Texto de apoio", placeholder: "A agenda convencional reúne assembleias...", type: "textarea" },
    ],
  },
  {
    id: "conteudos",
    title: "Conteúdos",
    eyebrow: "Notícias, vídeos e departamentos",
    description: "Chamadas das áreas dinâmicas da home.",
    fields: [
      { name: "home_noticias_selo", label: "Notícias - selo", placeholder: "Notícias" },
      { name: "home_noticias_titulo", label: "Notícias - título", placeholder: "A voz oficial da COMIEADEPA." },
      { name: "home_videos_selo", label: "Vídeos - selo", placeholder: "Vídeos" },
      { name: "home_videos_titulo", label: "Vídeos - título", placeholder: "A convenção em movimento." },
      { name: "home_videos_texto", label: "Vídeos - texto", placeholder: "Registros oficiais de congressos...", type: "textarea" },
      { name: "home_videos_botao", label: "Vídeos - botão", placeholder: "Ver todos os vídeos" },
      { name: "home_departamentos_selo", label: "Departamentos - selo", placeholder: "Departamentos" },
      { name: "home_departamentos_titulo", label: "Departamentos - título", placeholder: "Conselhos, comissões e departamentos da convenção." },
      { name: "home_departamentos_texto", label: "Departamentos - texto", placeholder: "Uma rede de trabalho que sustenta...", type: "textarea" },
      { name: "home_eventos_video_selo", label: "YouTube eventos - selo", placeholder: "YouTube" },
      { name: "home_eventos_video_titulo", label: "YouTube eventos - título", placeholder: "Assista Nossos Eventos" },
      { name: "home_eventos_video_texto", label: "YouTube eventos - texto", placeholder: "Confira transmissões...", type: "textarea" },
      { name: "home_eventos_video_botao", label: "YouTube eventos - botão", placeholder: "Inscreva-se no Canal" },
      { name: "home_eventos_video_inscritos", label: "YouTube eventos - inscritos", placeholder: "15.3K inscritos" },
    ],
  },
];

export const homeSettingKeys = homeSettingSections.flatMap((section) => section.fields.map((field) => field.name));

export const homeFallbackSettings: Record<HomeSettingKey, string> = {
  home_hero_selo: "Berço do pentecostes no Brasil",
  home_hero_titulo: "COMIEADEPA",
  home_hero_subtitulo: "A primeira convenção assembleiana do Brasil, fundada em 18 de agosto de 1921, no estado do Pará.",
  home_hero_texto:
    "Mais de cem anos proclamando o Evangelho, reunindo ministros, igrejas e congregações em todo o Pará. Uma convenção edificada sobre fé, missão e fidelidade inabalável à Palavra de Deus.",
  home_hero_botao_primario: "Conheça a história",
  home_hero_link_primario: "#a-comieadepa",
  home_hero_botao_secundario: "Eventos oficiais",
  home_hero_imagem_direita_url: "/img/presidente.png",
  home_hero_intervalo_segundos: "7",
  home_ago_selo: "Próxima AGO",
  home_ago_titulo: "125ª Assembleia Geral Ordinária",
  home_sobre_selo: "A COMIEADEPA",
  home_sobre_titulo: "A primeira convenção assembleiana do Brasil.",
  home_sobre_texto:
    "Fundada em 18 de agosto de 1921, a COMIEADEPA é reconhecida como a primeira convenção das Assembleias de Deus no Brasil. Nascida no solo paraense, onde o pentecostalismo clássico floresceu, a convenção reúne milhares de ministros, igrejas e congregações em centenas de campos eclesiásticos por todo o Pará.",
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
  home_presidencia_texto_2: "A cada pastor, líder e membro, reafirmamos: sua dedicação não é em vão. Deus sustenta e honra os que O servem com fidelidade.",
  home_presidencia_texto_3: "Sigamos em oração, com visão espiritual e amor pelas almas. O Senhor é conosco e maiores ainda são as obras que Ele realizará!",
  home_eventos_selo: "Eventos oficiais",
  home_eventos_titulo: "Eventos que edificam a história pentecostal do Pará.",
  home_eventos_texto:
    "A agenda convencional reúne assembleias, congressos, capacitações e encontros ministeriais que organizam a comunhão da obra, fortalecem departamentos e conectam ministros, igrejas e regiões.",
  home_noticias_selo: "Notícias",
  home_noticias_titulo: "A voz oficial da COMIEADEPA.",
  home_videos_selo: "Vídeos",
  home_videos_titulo: "A convenção em movimento.",
  home_videos_texto: "Registros oficiais de congressos, assembleias e momentos marcantes da maior e mais histórica convenção assembleiana do Brasil.",
  home_videos_botao: "Ver todos os vídeos",
  home_departamentos_selo: "Departamentos",
  home_departamentos_titulo: "Conselhos, comissões e departamentos da convenção.",
  home_departamentos_texto: "Uma rede de trabalho que sustenta a vida convencional: formação, cuidado, juventude, ensino e serviço caminhando juntos.",
  home_eventos_video_selo: "YouTube",
  home_eventos_video_titulo: "Assista Nossos Eventos",
  home_eventos_video_texto: "Confira transmissões, gravações e registros oficiais dos congressos, assembleias e reuniões ministeriais.",
  home_eventos_video_botao: "Inscreva-se no Canal",
  home_eventos_video_inscritos: "15.3K inscritos",
};

export function canEditHomeField(role: AdminRole, fieldName: HomeSettingKey): boolean {
  if (role === "admin") {
    return true;
  }
  if (role === "viewer") {
    return false;
  }

  // Parâmetros técnicos / estruturais: somente admin
  if (fieldName === "home_hero_intervalo_segundos") {
    return false;
  }

  // Seções e campos estritamente institucionais: admin e editor
  const institutionalFields: HomeSettingKey[] = [
    "home_hero_botao_secundario",
    "home_hero_imagem_direita_url",
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
    "home_departamentos_selo",
    "home_departamentos_titulo",
    "home_departamentos_texto",
  ];

  if (institutionalFields.includes(fieldName)) {
    return role === "editor";
  }

  // Chamadas editoriais e dinâmicas: admin, editor, midia
  return role === "editor" || role === "midia";
}

export function canEditHomeSection(role: AdminRole, sectionId: string): boolean {
  if (role === "admin") {
    return true;
  }
  if (role === "viewer") {
    return false;
  }
  if (sectionId === "sobre" || sectionId === "presidencia") {
    return role === "editor";
  }
  return true;
}

