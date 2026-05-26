-- ==========================================
-- CMS INSTITUCIONAL COMIEADEPA
-- Schema isolado: site
-- Seguro para projeto Supabase em produção
-- ==========================================

create extension if not exists pgcrypto;

create schema if not exists site;

-- ==========================================
-- TABELAS DO SITE
-- ==========================================

create table if not exists site.cms_departamentos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  titulo text,
  resumo text,
  conteudo text,
  logo_url text,
  banner_url text,
  contato_nome text,
  contato_whatsapp text,
  redes_sociais jsonb not null default '[]'::jsonb,
  documentos jsonb not null default '[]'::jsonb,
  ativo boolean not null default true,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table site.cms_departamentos
  add column if not exists redes_sociais jsonb not null default '[]'::jsonb,
  add column if not exists documentos jsonb not null default '[]'::jsonb;

create table if not exists site.cms_categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  descricao text,
  created_at timestamptz not null default now()
);

create table if not exists site.cms_posts (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  slug text not null unique,
  resumo text,
  conteudo text,
  capa_url text,
  categoria_id uuid references site.cms_categorias(id) on delete set null,
  departamento_id uuid references site.cms_departamentos(id) on delete set null,
  status text not null default 'rascunho'
    check (status in ('rascunho','revisao','publicado','agendado','arquivado')),
  destaque_home boolean not null default false,
  publicado_em timestamptz,
  autor_nome text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists site.cms_videos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  youtube_url text not null,
  youtube_id text,
  tipo text not null default 'video'
    check (tipo in ('video','shorts','live')),
  thumbnail_url text,
  departamento_id uuid references site.cms_departamentos(id) on delete set null,
  destaque_home boolean not null default false,
  ativo boolean not null default true,
  ordem integer not null default 0,
  publicado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists site.cms_media_assets (
  id uuid primary key default gen_random_uuid(),
  titulo text,
  arquivo_url text not null,
  tipo text,
  pasta text,
  departamento_id uuid references site.cms_departamentos(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists site.cms_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor text,
  action text not null,
  entity text not null,
  entity_id text,
  entity_title text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists site.cms_admin_users (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  role text not null default 'editor'
    check (role in ('admin','editor','midia','viewer')),
  departamento_id uuid references site.cms_departamentos(id) on delete set null,
  ativo boolean not null default true,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists site.cms_configuracoes (
  chave text primary key,
  valor jsonb not null default '""'::jsonb,
  grupo text not null default 'geral',
  descricao text,
  publico boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ==========================================
-- VIEW SEGURA PARA ESPELHAR EVENTOS DO SISTEMA
-- ==========================================

create or replace view site.v_eventos_publicos as
select
  id,
  nome,
  slug,
  descricao,
  departamento,
  data_inicio,
  data_fim,
  local,
  cidade,
  banner_url,
  valor_inscricao,
  inscricoes_abertas,
  publico_alvo,
  status,
  usar_tipos_inscricao
from public.eventos
where status is distinct from 'rascunho'
  and status is distinct from 'cancelado'
order by data_inicio asc;

create or replace view site.v_evento_tipos_inscricao_publicos as
select
  tipos.evento_id,
  tipos.nome,
  tipos.valor
from public.evento_tipos_inscricao tipos
join public.eventos eventos on eventos.id = tipos.evento_id
where eventos.status is distinct from 'rascunho'
  and eventos.status is distinct from 'cancelado'
order by tipos.valor asc;

-- ==========================================
-- RLS
-- ==========================================

alter table site.cms_departamentos enable row level security;
alter table site.cms_categorias enable row level security;
alter table site.cms_posts enable row level security;
alter table site.cms_videos enable row level security;
alter table site.cms_media_assets enable row level security;
alter table site.cms_audit_logs enable row level security;
alter table site.cms_admin_users enable row level security;
alter table site.cms_configuracoes enable row level security;

-- ==========================================
-- POLICIES PÚBLICAS DO SITE
-- ==========================================

drop policy if exists "Site departamentos ativos podem ser lidos"
on site.cms_departamentos;

drop policy if exists "Site categorias podem ser lidas"
on site.cms_categorias;

drop policy if exists "Site posts publicados podem ser lidos"
on site.cms_posts;

drop policy if exists "Site videos ativos podem ser lidos"
on site.cms_videos;

drop policy if exists "Site configuracoes publicas podem ser lidas"
on site.cms_configuracoes;

create policy "Site departamentos ativos podem ser lidos"
on site.cms_departamentos
for select to anon
using (ativo = true);

create policy "Site categorias podem ser lidas"
on site.cms_categorias
for select to anon
using (true);

create policy "Site posts publicados podem ser lidos"
on site.cms_posts
for select to anon
using (
  status = 'publicado'
  and (publicado_em is null or publicado_em <= now())
);

create policy "Site videos ativos podem ser lidos"
on site.cms_videos
for select to anon
using (ativo = true);

create policy "Site configuracoes publicas podem ser lidas"
on site.cms_configuracoes
for select to anon
using (publico = true);

-- ==========================================
-- PERMISSÕES PARA LEITURA PÚBLICA
-- ==========================================

grant usage on schema site to anon, authenticated;

grant select on
  site.cms_departamentos,
  site.cms_categorias,
  site.cms_posts,
  site.cms_videos,
  site.cms_configuracoes,
  site.v_eventos_publicos,
  site.v_evento_tipos_inscricao_publicos
to anon, authenticated;

-- ==========================================
-- DADOS INICIAIS
-- ==========================================

insert into site.cms_departamentos (
  slug,
  nome,
  titulo,
  resumo,
  ordem
)
values
('ago', 'AGO', 'Assembleia Geral Ordinária', 'Programação, comunicados e cobertura oficial da AGO.', 10),
('umadespa', 'UMADESPA', 'União da Mocidade das Assembleias de Deus no Pará', 'Juventude, congressos e mobilizações.', 20),
('coadespa', 'COADESPA', 'Coordenação de Senhoras', 'Ações e comunicação oficial da COADESPA.', 30),
('seiadepa', 'SEIADEPA', 'Secretaria Infantil', 'Ensino, cuidado e formação cristã para crianças.', 40),
('conec', 'CONEC', 'Conselho de Educação Cristã', 'Formação, currículo e educação cristã.', 50)
on conflict (slug)
do update set
  nome = excluded.nome,
  titulo = excluded.titulo,
  resumo = excluded.resumo,
  ordem = excluded.ordem,
  updated_at = now();

insert into site.cms_configuracoes (
  chave,
  valor,
  grupo,
  descricao,
  publico
)
values
('url_area_ministro', to_jsonb('https://www.siscomieadepa.org/login'::text), 'links', 'Link do botÃ£o Ãrea do Ministro na home.', true),
('url_eventos', to_jsonb('https://eventos.siscomieadepa.org/eventos-publicos'::text), 'links', 'Link do sistema oficial de eventos.', true),
('youtube_channel_url', to_jsonb('https://www.youtube.com/@comieadepa'::text), 'redes', 'Canal oficial no YouTube.', true),
('facebook_url', to_jsonb(''::text), 'redes', 'Perfil oficial no Facebook.', true),
('instagram_url', to_jsonb(''::text), 'redes', 'Perfil oficial no Instagram.', true),
('contato_endereco', to_jsonb('Rodovia MÃ¡rio Covas, 2500'::text), 'contato', 'EndereÃ§o exibido no rodapÃ©.', true),
('contato_telefone', to_jsonb('55 (91) 0000-0000'::text), 'contato', 'Telefone exibido no rodapÃ©.', true),
('contato_email', to_jsonb('secretaria@comieadepa.com.br'::text), 'contato', 'E-mail exibido no rodapÃ©.', true),
('contato_horario', to_jsonb('9h Ã s 17h - Segunda a Sexta'::text), 'contato', 'HorÃ¡rio de atendimento exibido no rodapÃ©.', true),
('home_hero_selo', to_jsonb('BerÃ§o do pentecostes no Brasil'::text), 'home', 'Selo textual exibido acima do tÃ­tulo principal da home.', true),
('home_hero_titulo', to_jsonb('COMIEADEPA'::text), 'home', 'TÃ­tulo principal da home.', true),
('home_hero_subtitulo', to_jsonb('A primeira convenÃ§Ã£o assembleiana do Brasil, fundada em 18 de agosto de 1921, no estado do ParÃ¡.'::text), 'home', 'Chamada principal da home.', true),
('home_hero_texto', to_jsonb('Mais de cem anos proclamando o Evangelho, reunindo ministros, igrejas e congregaÃ§Ãµes em todo o ParÃ¡. Uma convenÃ§Ã£o edificada sobre fÃ©, missÃ£o e fidelidade inabalÃ¡vel Ã  Palavra de Deus.'::text), 'home', 'Texto de apoio da primeira dobra da home.', true),
('home_hero_botao_primario', to_jsonb('ConheÃ§a a histÃ³ria'::text), 'home', 'Texto do botÃ£o primÃ¡rio da home.', true),
('home_hero_link_primario', to_jsonb('#a-comieadepa'::text), 'home', 'Link do botÃ£o primÃ¡rio da home.', true),
('home_hero_botao_secundario', to_jsonb('Eventos oficiais'::text), 'home', 'Texto do botÃ£o secundÃ¡rio da home.', true),
('home_ago_selo', to_jsonb('PrÃ³xima AGO'::text), 'home', 'Selo da chamada da AGO na home.', true),
('home_ago_titulo', to_jsonb('125Âª Assembleia Geral OrdinÃ¡ria'::text), 'home', 'TÃ­tulo da chamada da AGO na home.', true),
('home_sobre_selo', to_jsonb('A COMIEADEPA'::text), 'home', 'Selo textual da seÃ§Ã£o institucional.', true),
('home_sobre_titulo', to_jsonb('A primeira convenÃ§Ã£o assembleiana do Brasil.'::text), 'home', 'TÃ­tulo da seÃ§Ã£o institucional.', true),
('home_sobre_texto', to_jsonb('Fundada em 18 de agosto de 1921, a COMIEADEPA Ã© reconhecida como a primeira convenÃ§Ã£o das Assembleias de Deus no Brasil. Nascida no solo paraense, onde o pentecostalismo clÃ¡ssico floresceu, a convenÃ§Ã£o reÃºne milhares de ministros, igrejas e congregaÃ§Ãµes em centenas de campos eclesiÃ¡sticos por todo o ParÃ¡ â€” reconhecida como PatrimÃ´nio Cultural Material e Imaterial do Estado.'::text), 'home', 'Texto da seÃ§Ã£o institucional.', true),
('home_sobre_imagem_url', to_jsonb('/assets/sede-aerea-comieadepa.jpg'::text), 'home', 'Imagem principal da seÃ§Ã£o institucional.', true),
('home_sobre_selo_url', to_jsonb('/assets/selo-comieadepa-dourado.png'::text), 'home', 'Selo visual da seÃ§Ã£o institucional.', true),
('home_sobre_data', to_jsonb('18.08.1921'::text), 'home', 'Data destacada na seÃ§Ã£o institucional.', true),
('home_sobre_legenda', to_jsonb('BerÃ§o do pentecostes no Brasil'::text), 'home', 'Legenda da data destacada na seÃ§Ã£o institucional.', true),
('home_sobre_pilar_1', to_jsonb('Evangelismo'::text), 'home', 'Primeiro pilar institucional.', true),
('home_sobre_pilar_2', to_jsonb('MissÃµes'::text), 'home', 'Segundo pilar institucional.', true),
('home_sobre_pilar_3', to_jsonb('AÃ§Ã£o Social'::text), 'home', 'Terceiro pilar institucional.', true),
('home_presidencia_imagem_url', to_jsonb('/assets/presidente-comieadepa.png'::text), 'home', 'Imagem da seÃ§Ã£o PresidÃªncia.', true),
('home_presidencia_nome', to_jsonb('Pr. OcÃ©lio Nauar'::text), 'home', 'Nome exibido na seÃ§Ã£o PresidÃªncia.', true),
('home_presidencia_cargo', to_jsonb('Presidente COMIEADEPA'::text), 'home', 'Cargo exibido na seÃ§Ã£o PresidÃªncia.', true),
('home_presidencia_iniciais', to_jsonb('ON'::text), 'home', 'Iniciais exibidas na assinatura da PresidÃªncia.', true),
('home_presidencia_selo', to_jsonb('Palavra do Presidente'::text), 'home', 'Selo textual da seÃ§Ã£o PresidÃªncia.', true),
('home_presidencia_titulo_linha_1', to_jsonb('Servindo com'::text), 'home', 'Primeira linha do tÃ­tulo da PresidÃªncia.', true),
('home_presidencia_titulo_destaque', to_jsonb('Integridade'::text), 'home', 'Destaque do tÃ­tulo da PresidÃªncia.', true),
('home_presidencia_titulo_linha_2', to_jsonb('e Fidelidade'::text), 'home', 'Complemento do tÃ­tulo da PresidÃªncia.', true),
('home_presidencia_texto_1', to_jsonb('A COMIEADEPA segue firme no propÃ³sito de servir a Deus com integridade, unidade e compromisso com a Palavra.'::text), 'home', 'Primeiro parÃ¡grafo da PresidÃªncia.', true),
('home_presidencia_texto_2', to_jsonb('A cada pastor, lÃ­der e membro, reafirmamos: sua dedicaÃ§Ã£o nÃ£o Ã© em vÃ£o. Mesmo diante dos desafios, Deus sustenta e honra os que O servem com fidelidade.'::text), 'home', 'Segundo parÃ¡grafo da PresidÃªncia.', true),
('home_presidencia_texto_3', to_jsonb('Sigamos em oraÃ§Ã£o, com visÃ£o espiritual e amor pelas almas. O Senhor Ã© conosco e maiores ainda sÃ£o as obras que Ele realizarÃ¡!'::text), 'home', 'Terceiro parÃ¡grafo da PresidÃªncia.', true),
('home_eventos_selo', to_jsonb('Eventos oficiais'::text), 'home', 'Selo textual da seÃ§Ã£o de eventos.', true),
('home_eventos_titulo', to_jsonb('Eventos que edificam a histÃ³ria pentecostal do ParÃ¡.'::text), 'home', 'TÃ­tulo da seÃ§Ã£o de eventos.', true),
('home_eventos_texto', to_jsonb('A agenda convencional reÃºne assembleias, congressos, capacitaÃ§Ãµes e encontros ministeriais que organizam a comunhÃ£o da obra, fortalecem departamentos e conectam ministros, igrejas e regiÃµes em torno da missÃ£o da COMIEADEPA.'::text), 'home', 'Texto de apoio da seÃ§Ã£o de eventos.', true),
('home_noticias_selo', to_jsonb('NotÃ­cias'::text), 'home', 'Selo textual da seÃ§Ã£o de notÃ­cias.', true),
('home_noticias_titulo', to_jsonb('A voz oficial da COMIEADEPA.'::text), 'home', 'TÃ­tulo da seÃ§Ã£o de notÃ­cias.', true),
('home_videos_selo', to_jsonb('VÃ­deos'::text), 'home', 'Selo textual da seÃ§Ã£o de vÃ­deos.', true),
('home_videos_titulo', to_jsonb('A convenÃ§Ã£o em movimento.'::text), 'home', 'TÃ­tulo da seÃ§Ã£o de vÃ­deos.', true),
('home_videos_texto', to_jsonb('Registros oficiais de congressos, assembleias e momentos marcantes da maior e mais histÃ³rica convenÃ§Ã£o assembleiana do Brasil.'::text), 'home', 'Texto de apoio da seÃ§Ã£o de vÃ­deos.', true),
('home_videos_botao', to_jsonb('Ver todos os vÃ­deos'::text), 'home', 'Texto do botÃ£o da seÃ§Ã£o de vÃ­deos.', true),
('home_departamentos_selo', to_jsonb('Departamentos'::text), 'home', 'Selo textual da seÃ§Ã£o de departamentos.', true),
('home_departamentos_titulo', to_jsonb('Conselhos, comissÃµes e departamentos da convenÃ§Ã£o.'::text), 'home', 'TÃ­tulo da seÃ§Ã£o de departamentos.', true),
('home_departamentos_texto', to_jsonb('Uma rede de trabalho que sustenta a vida convencional: formaÃ§Ã£o, cuidado, juventude, ensino e serviÃ§o caminhando juntos para fortalecer igrejas, famÃ­lias ministeriais e a missÃ£o em todo o ParÃ¡.'::text), 'home', 'Texto de apoio da seÃ§Ã£o de departamentos.', true),
('home_eventos_video_selo', to_jsonb('YouTube'::text), 'home', 'Selo textual da seÃ§Ã£o de transmissÃµes e gravaÃ§Ãµes.', true),
('home_eventos_video_titulo', to_jsonb('Assista Nossos Eventos'::text), 'home', 'TÃ­tulo da seÃ§Ã£o de transmissÃµes e gravaÃ§Ãµes.', true),
('home_eventos_video_texto', to_jsonb('Confira transmissÃµes, gravaÃ§Ãµes e registros oficiais dos congressos, assembleias e reuniÃµes ministeriais.'::text), 'home', 'Texto da seÃ§Ã£o de transmissÃµes e gravaÃ§Ãµes.', true),
('home_eventos_video_botao', to_jsonb('Inscreva-se no Canal'::text), 'home', 'Texto do botÃ£o do canal do YouTube.', true),
('home_eventos_video_inscritos', to_jsonb('15.3K inscritos'::text), 'home', 'Texto de inscritos exibido na seÃ§Ã£o de YouTube.', true),
('seo_titulo_padrao', to_jsonb('COMIEADEPA | Portal Institucional'::text), 'seo', 'TÃ­tulo padrÃ£o do portal.', true),
('seo_descricao_padrao', to_jsonb('Portal institucional da COMIEADEPA, a primeira convenÃ§Ã£o assembleiana do Brasil.'::text), 'seo', 'DescriÃ§Ã£o padrÃ£o para SEO.', true)
on conflict (chave)
do update set
  descricao = excluded.descricao,
  grupo = excluded.grupo,
  publico = excluded.publico,
  updated_at = now();
