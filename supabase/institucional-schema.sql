-- ==========================================
-- CMS INSTITUCIONAL (MÓDULO DE EXPANSÃO)
-- ==========================================

create table if not exists site.cms_institucional (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  slug text not null unique,
  status text not null default 'rascunho'
    check (status in ('rascunho', 'publicado')),
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indices para otimização
create index if not exists idx_institucional_status on site.cms_institucional(status);
create index if not exists idx_institucional_ordem on site.cms_institucional(ordem);

-- Trigger para updated_at
drop trigger if exists set_updated_at on site.cms_institucional;
create trigger set_updated_at
before update on site.cms_institucional
for each row execute function public.set_updated_at();

-- Habilitar RLS
alter table site.cms_institucional enable row level security;

-- Política de RLS para leitura pública
drop policy if exists "Institucional publicado pode ser lido" on site.cms_institucional;
create policy "Institucional publicado pode ser lido"
on site.cms_institucional
for select to anon, authenticated
using (status = 'publicado');

-- Permissões gerais de acesso
grant usage on schema site to anon, authenticated, service_role;
grant select on site.cms_institucional to anon, authenticated;
grant all privileges on site.cms_institucional to service_role;
