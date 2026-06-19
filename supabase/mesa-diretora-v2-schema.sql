-- ==========================================
-- CMS MESA DIRETORA V2 (GRUPOS DINÂMICOS)
-- ==========================================

-- 1. Criar a tabela de grupos
create table if not exists site.cms_mesa_grupos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  descricao text,
  subtitulo text,
  bg_image_url text,
  title_color text,
  ordem integer not null default 0,
  ativo boolean not null default true,
  layout text not null default 'grid3'
    check (layout in ('hero', 'center', 'grid2', 'grid3', 'grid4')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid
);

-- Indices para otimização
create index if not exists idx_mesa_grupos_ativo on site.cms_mesa_grupos(ativo);
create index if not exists idx_mesa_grupos_ordem on site.cms_mesa_grupos(ordem);

-- Trigger para updated_at na tabela de grupos
drop trigger if exists set_updated_at on site.cms_mesa_grupos;
create trigger set_updated_at
before update on site.cms_mesa_grupos
for each row execute function public.set_updated_at();

-- Habilitar RLS para grupos
alter table site.cms_mesa_grupos enable row level security;

-- Política de RLS para leitura pública
drop policy if exists "Grupos da mesa diretora ativos podem ser lidos" on site.cms_mesa_grupos;
create policy "Grupos da mesa diretora ativos podem ser lidos"
on site.cms_mesa_grupos
for select to anon, authenticated
using (ativo = true);

-- Permissões gerais de acesso para grupos
grant usage on schema site to anon, authenticated, service_role;
grant select on site.cms_mesa_grupos to anon, authenticated;
grant all privileges on site.cms_mesa_grupos to service_role;

-- 2. Adicionar coluna grupo_id na tabela site.cms_mesa_diretora
-- Nota: A coluna grupo antiga NÃO será removida nesta sprint por compatibilidade e será dropada futuramente.
alter table site.cms_mesa_diretora
add column if not exists grupo_id uuid references site.cms_mesa_grupos(id) on delete set null;

-- Index para otimizar buscas por grupo_id
create index if not exists idx_mesa_diretora_grupo_id on site.cms_mesa_diretora(grupo_id);

-- 3. Inserir grupos padrão se a tabela estiver vazia
insert into site.cms_mesa_grupos (nome, slug, ordem, layout, ativo)
values
  ('Presidente', 'presidente', 10, 'hero', true),
  ('Presidente de Honra', 'presidente_honra', 20, 'center', true),
  ('Vice-Presidentes', 'vice_presidentes', 30, 'grid3', true),
  ('Secretários', 'secretarios', 40, 'grid4', true),
  ('Tesoureiros', 'tesoureiros', 50, 'grid4', true),
  ('Secretário Executivo / Assessoria', 'assessoria', 60, 'center', true),
  ('Conselhos', 'conselhos', 70, 'grid4', true),
  ('Comissões', 'comissoes', 80, 'grid4', true)
on conflict (slug) do nothing;

-- 4. Migrar dados existentes da coluna "grupo" para "grupo_id"
update site.cms_mesa_diretora md
set grupo_id = g.id
from site.cms_mesa_grupos g
where md.grupo_id is null
  and (
    md.grupo = g.slug
    or (md.grupo = 'vice' and g.slug = 'vice_presidentes')
    or (md.grupo = 'secretario' and g.slug = 'secretarios')
    or (md.grupo = 'tesoureiro' and g.slug = 'tesoureiros')
    or (md.grupo = 'honra' and g.slug = 'presidente_honra')
  );
