export type HomeSettingFieldType = "text" | "textarea" | "image";

export type HomeSettingKey =
  | "home_hero_selo"
  | "home_hero_titulo"
  | "home_hero_subtitulo"
  | "home_hero_texto"
  | "home_hero_botao_primario"
  | "home_hero_link_primario"
  | "home_hero_botao_secundario"
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
    description: "Ajustes complementares do hero: botao secundario e destaque institucional da AGO. As imagens e slides principais sao editados no bloco especifico logo abaixo.",
    fields: [
      { name: "home_hero_botao_secundario", label: "Botao secundario", placeholder: "Eventos oficiais" },
      { name: "home_ago_selo", label: "Selo da AGO", placeholder: "Proxima AGO" },
      { name: "home_ago_titulo", label: "Titulo da chamada da AGO", placeholder: "125a Assembleia Geral Ordinaria" },
    ],
  },
  {
    id: "sobre",
    title: "A COMIEADEPA",
    eyebrow: "Institucional",
    description: "Texto, imagem e pilares da secao institucional da home.",
    fields: [
      { name: "home_sobre_selo", label: "Selo da secao", placeholder: "A COMIEADEPA" },
      { name: "home_sobre_titulo", label: "Titulo", placeholder: "A primeira convencao assembleiana do Brasil." },
      { name: "home_sobre_texto", label: "Texto institucional", placeholder: "Fundada em 18 de agosto de 1921...", type: "textarea" },
      { name: "home_sobre_imagem_url", label: "Imagem principal", placeholder: "/assets/sede-aerea-comieadepa.jpg", type: "image", helper: "Prefira imagem horizontal, em boa resolucao." },
      { name: "home_sobre_selo_url", label: "Selo visual", placeholder: "/assets/selo-comieadepa-dourado.png", type: "image" },
      { name: "home_sobre_data", label: "Data destacada", placeholder: "18.08.1921" },
      { name: "home_sobre_legenda", label: "Legenda da data", placeholder: "Berco do pentecostes no Brasil" },
      { name: "home_sobre_pilar_1", label: "Pilar 1", placeholder: "Evangelismo" },
      { name: "home_sobre_pilar_2", label: "Pilar 2", placeholder: "Missoes" },
      { name: "home_sobre_pilar_3", label: "Pilar 3", placeholder: "Acao Social" },
    ],
  },
  {
    id: "presidencia",
    title: "Presidencia",
    eyebrow: "Palavra institucional",
    description: "Imagem, assinatura e texto da mensagem da presidencia.",
    fields: [
      { name: "home_presidencia_imagem_url", label: "Imagem", placeholder: "/assets/presidente-comieadepa.png", type: "image" },
      { name: "home_presidencia_nome", label: "Nome", placeholder: "Pr. Ocelio Nauar" },
      { name: "home_presidencia_cargo", label: "Cargo", placeholder: "Presidente COMIEADEPA" },
      { name: "home_presidencia_iniciais", label: "Iniciais", placeholder: "ON" },
      { name: "home_presidencia_selo", label: "Selo da secao", placeholder: "Palavra do Presidente" },
      { name: "home_presidencia_titulo_linha_1", label: "Titulo - linha 1", placeholder: "Servindo com" },
      { name: "home_presidencia_titulo_destaque", label: "Titulo - destaque", placeholder: "Integridade" },
      { name: "home_presidencia_titulo_linha_2", label: "Titulo - linha 2", placeholder: "e Fidelidade" },
      { name: "home_presidencia_texto_1", label: "Paragrafo 1", placeholder: "A COMIEADEPA segue firme...", type: "textarea" },
      { name: "home_presidencia_texto_2", label: "Paragrafo 2", placeholder: "A cada pastor, lider e membro...", type: "textarea" },
      { name: "home_presidencia_texto_3", label: "Paragrafo 3", placeholder: "Sigamos em oracao...", type: "textarea" },
    ],
  },
  {
    id: "eventos",
    title: "Eventos",
    eyebrow: "Agenda",
    description: "Narrativa da area de eventos. Os cards continuam vindo do sistema de eventos.",
    fields: [
      { name: "home_eventos_selo", label: "Selo da secao", placeholder: "Eventos oficiais" },
      { name: "home_eventos_titulo", label: "Titulo", placeholder: "Eventos que edificam a historia pentecostal do Para." },
      { name: "home_eventos_texto", label: "Texto de apoio", placeholder: "A agenda convencional reune assembleias...", type: "textarea" },
    ],
  },
  {
    id: "conteudos",
    title: "Conteudos",
    eyebrow: "Noticias, videos e departamentos",
    description: "Chamadas das areas dinamicas da home.",
    fields: [
      { name: "home_noticias_selo", label: "Noticias - selo", placeholder: "Noticias" },
      { name: "home_noticias_titulo", label: "Noticias - titulo", placeholder: "A voz oficial da COMIEADEPA." },
      { name: "home_videos_selo", label: "Videos - selo", placeholder: "Videos" },
      { name: "home_videos_titulo", label: "Videos - titulo", placeholder: "A convencao em movimento." },
      { name: "home_videos_texto", label: "Videos - texto", placeholder: "Registros oficiais de congressos...", type: "textarea" },
      { name: "home_videos_botao", label: "Videos - botao", placeholder: "Ver todos os videos" },
      { name: "home_departamentos_selo", label: "Departamentos - selo", placeholder: "Departamentos" },
      { name: "home_departamentos_titulo", label: "Departamentos - titulo", placeholder: "Conselhos, comissoes e departamentos da convencao." },
      { name: "home_departamentos_texto", label: "Departamentos - texto", placeholder: "Uma rede de trabalho que sustenta...", type: "textarea" },
      { name: "home_eventos_video_selo", label: "YouTube eventos - selo", placeholder: "YouTube" },
      { name: "home_eventos_video_titulo", label: "YouTube eventos - titulo", placeholder: "Assista Nossos Eventos" },
      { name: "home_eventos_video_texto", label: "YouTube eventos - texto", placeholder: "Confira transmissoes...", type: "textarea" },
      { name: "home_eventos_video_botao", label: "YouTube eventos - botao", placeholder: "Inscreva-se no Canal" },
      { name: "home_eventos_video_inscritos", label: "YouTube eventos - inscritos", placeholder: "15.3K inscritos" },
    ],
  },
] satisfies HomeSettingSection[];

export const homeSettingKeys = homeSettingSections.flatMap((section) => section.fields.map((field) => field.name));

export const homeFallbackSettings: Record<HomeSettingKey, string> = {
  home_hero_selo: "Berco do pentecostes no Brasil",
  home_hero_titulo: "COMIEADEPA",
  home_hero_subtitulo: "A primeira convencao assembleiana do Brasil, fundada em 18 de agosto de 1921, no estado do Para.",
  home_hero_texto:
    "Mais de cem anos proclamando o Evangelho, reunindo ministros, igrejas e congregacoes em todo o Para. Uma convencao edificada sobre fe, missao e fidelidade inabalavel a Palavra de Deus.",
  home_hero_botao_primario: "Conheca a historia",
  home_hero_link_primario: "#a-comieadepa",
  home_hero_botao_secundario: "Eventos oficiais",
  home_ago_selo: "Proxima AGO",
  home_ago_titulo: "125a Assembleia Geral Ordinaria",
  home_sobre_selo: "A COMIEADEPA",
  home_sobre_titulo: "A primeira convencao assembleiana do Brasil.",
  home_sobre_texto:
    "Fundada em 18 de agosto de 1921, a COMIEADEPA e reconhecida como a primeira convencao das Assembleias de Deus no Brasil. Nascida no solo paraense, onde o pentecostalismo classico floresceu, a convencao reune milhares de ministros, igrejas e congregacoes em centenas de campos eclesiasticos por todo o Para.",
  home_sobre_imagem_url: "/assets/sede-aerea-comieadepa.jpg",
  home_sobre_selo_url: "/assets/selo-comieadepa-dourado.png",
  home_sobre_data: "18.08.1921",
  home_sobre_legenda: "Berco do pentecostes no Brasil",
  home_sobre_pilar_1: "Evangelismo",
  home_sobre_pilar_2: "Missoes",
  home_sobre_pilar_3: "Acao Social",
  home_presidencia_imagem_url: "/assets/presidente-comieadepa.png",
  home_presidencia_nome: "Pr. Ocelio Nauar",
  home_presidencia_cargo: "Presidente COMIEADEPA",
  home_presidencia_iniciais: "ON",
  home_presidencia_selo: "Palavra do Presidente",
  home_presidencia_titulo_linha_1: "Servindo com",
  home_presidencia_titulo_destaque: "Integridade",
  home_presidencia_titulo_linha_2: "e Fidelidade",
  home_presidencia_texto_1: "A COMIEADEPA segue firme no proposito de servir a Deus com integridade, unidade e compromisso com a Palavra.",
  home_presidencia_texto_2: "A cada pastor, lider e membro, reafirmamos: sua dedicacao nao e em vao. Deus sustenta e honra os que O servem com fidelidade.",
  home_presidencia_texto_3: "Sigamos em oracao, com visao espiritual e amor pelas almas. O Senhor e conosco e maiores ainda sao as obras que Ele realizara!",
  home_eventos_selo: "Eventos oficiais",
  home_eventos_titulo: "Eventos que edificam a historia pentecostal do Para.",
  home_eventos_texto:
    "A agenda convencional reune assembleias, congressos, capacitacoes e encontros ministeriais que organizam a comunhao da obra, fortalecem departamentos e conectam ministros, igrejas e regioes.",
  home_noticias_selo: "Noticias",
  home_noticias_titulo: "A voz oficial da COMIEADEPA.",
  home_videos_selo: "Videos",
  home_videos_titulo: "A convencao em movimento.",
  home_videos_texto: "Registros oficiais de congressos, assembleias e momentos marcantes da maior e mais historica convencao assembleiana do Brasil.",
  home_videos_botao: "Ver todos os videos",
  home_departamentos_selo: "Departamentos",
  home_departamentos_titulo: "Conselhos, comissoes e departamentos da convencao.",
  home_departamentos_texto: "Uma rede de trabalho que sustenta a vida convencional: formacao, cuidado, juventude, ensino e servico caminhando juntos.",
  home_eventos_video_selo: "YouTube",
  home_eventos_video_titulo: "Assista Nossos Eventos",
  home_eventos_video_texto: "Confira transmissoes, gravacoes e registros oficiais dos congressos, assembleias e reunioes ministeriais.",
  home_eventos_video_botao: "Inscreva-se no Canal",
  home_eventos_video_inscritos: "15.3K inscritos",
};
