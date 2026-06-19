-- ==========================================
-- CMS INSTITUCIONAL SECOES (SUB-MÓDULO)
-- ==========================================

create table if not exists site.cms_institucional_secoes (
  id uuid primary key default gen_random_uuid(),
  institucional_id uuid not null references site.cms_institucional(id) on delete cascade,
  tipo text not null default 'texto' check (tipo in ('texto', 'imagem_texto', 'cta')),
  titulo text,
  subtitulo text,
  conteudo text,
  imagem_url text,
  ordem integer not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indices para otimização
create index if not exists idx_institucional_secoes_inst on site.cms_institucional_secoes(institucional_id);
create index if not exists idx_institucional_secoes_ativo_ordem on site.cms_institucional_secoes(ativo, ordem);

-- Trigger para updated_at
drop trigger if exists set_updated_at on site.cms_institucional_secoes;
create trigger set_updated_at
before update on site.cms_institucional_secoes
for each row execute function public.set_updated_at();

-- Habilitar RLS
alter table site.cms_institucional_secoes enable row level security;

-- Política de RLS para leitura pública
drop policy if exists "Secoes ativas podem ser lidas" on site.cms_institucional_secoes;
create policy "Secoes ativas podem ser lidas"
on site.cms_institucional_secoes
for select to anon, authenticated
using (ativo = true);

-- Permissões gerais de acesso
grant select on site.cms_institucional_secoes to anon, authenticated;
grant all privileges on site.cms_institucional_secoes to service_role;
