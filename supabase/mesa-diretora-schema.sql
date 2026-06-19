-- ==========================================
-- CMS MESA DIRETORA
-- ==========================================

create table if not exists site.cms_mesa_diretora (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cargo text not null,
  grupo text not null
    check (grupo in (
      'presidente',
      'presidente_honra',
      'vice_presidentes',
      'secretarios',
      'tesoureiros',
      'assessoria',
      'conselhos',
      'comissoes'
    )),
  campo text,
  foto_url text,
  bio text,
  ordem integer not null default 0,
  status text not null default 'rascunho'
    check (status in ('rascunho', 'publicado')),
  destaque boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid
);

-- Indices para otimização de busca e ordenação
create index if not exists idx_mesa_diretora_grupo on site.cms_mesa_diretora(grupo);
create index if not exists idx_mesa_diretora_status on site.cms_mesa_diretora(status);
create index if not exists idx_mesa_diretora_ordem on site.cms_mesa_diretora(ordem);

-- Trigger para atualizar automaticamente o campo updated_at
drop trigger if exists set_updated_at on site.cms_mesa_diretora;
create trigger set_updated_at
before update on site.cms_mesa_diretora
for each row execute function public.set_updated_at();

-- Habilitar Row Level Security (RLS)
alter table site.cms_mesa_diretora enable row level security;

-- Políticas de RLS
drop policy if exists "Membros da mesa diretora publicados podem ser lidos" on site.cms_mesa_diretora;
create policy "Membros da mesa diretora publicados podem ser lidos"
on site.cms_mesa_diretora
for select to anon, authenticated
using (status = 'publicado');

-- Permissões gerais de acesso
grant usage on schema site to anon, authenticated, service_role;
grant select on site.cms_mesa_diretora to anon, authenticated;
grant all privileges on site.cms_mesa_diretora to service_role;

