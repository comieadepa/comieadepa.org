-- ==========================================
-- CMS INSTITUCIONAL CARDS (SUB-MÓDULO)
-- ==========================================

-- Alterar constraint de tipo para incluir 'cards'
alter table site.cms_institucional_secoes drop constraint if exists cms_institucional_secoes_tipo_check;
alter table site.cms_institucional_secoes add constraint cms_institucional_secoes_tipo_check check (tipo in ('texto', 'imagem_texto', 'cta', 'cards'));

-- Criar tabela de cards
create table if not exists site.cms_institucional_cards (
  id uuid primary key default gen_random_uuid(),
  secao_id uuid not null references site.cms_institucional_secoes(id) on delete cascade,
  titulo text not null,
  subtitulo text,
  descricao text,
  imagem_url text,
  icone text,
  link_url text,
  link_texto text,
  ordem integer not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indices
create index if not exists idx_institucional_cards_secao on site.cms_institucional_cards(secao_id);
create index if not exists idx_institucional_cards_ativo_ordem on site.cms_institucional_cards(ativo, ordem);

-- Trigger para updated_at
drop trigger if exists set_updated_at on site.cms_institucional_cards;
create trigger set_updated_at
before update on site.cms_institucional_cards
for each row execute function public.set_updated_at();

-- Habilitar RLS
alter table site.cms_institucional_cards enable row level security;

-- Política de RLS
drop policy if exists "Cards ativos podem ser lidos" on site.cms_institucional_cards;
create policy "Cards ativos podem ser lidos"
on site.cms_institucional_cards
for select to anon, authenticated
using (ativo = true);

-- Permissões
grant select on site.cms_institucional_cards to anon, authenticated;
grant all privileges on site.cms_institucional_cards to service_role;
