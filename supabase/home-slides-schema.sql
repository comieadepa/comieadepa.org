-- ==============================================================================
-- ESTRUTURA: DESTAQUES DA HOME (HERO SLIDER)
-- Schema: site
-- Tabela: cms_home_slides
-- ==============================================================================

-- 1. Garante que o schema site exista
create schema if not exists site;

-- 2. Criação da tabela de slides
create table if not exists site.cms_home_slides (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  subtitulo text,
  descricao text,
  data_label text,
  imagem_url text not null,
  botao_texto text,
  botao_url text,
  ordem integer not null default 0,
  status text not null default 'rascunho'
    check (status in ('rascunho', 'publicado', 'arquivado')),
  abrir_nova_aba boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid
);

-- 3. Índice composto de alta performance para a Home pública
create index if not exists idx_cms_home_slides_status_ordem 
on site.cms_home_slides (status, ordem asc, updated_at desc);

-- 4. Função e trigger para atualização automática de updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on site.cms_home_slides;
create trigger set_updated_at
before update on site.cms_home_slides
for each row execute function public.set_updated_at();

-- 5. Habilitação de Segurança por Linha (RLS)
alter table site.cms_home_slides enable row level security;

-- 6. Política de leitura pública (somente registros publicados)
drop policy if exists "Site home slides publicados podem ser lidos" on site.cms_home_slides;
create policy "Site home slides publicados podem ser lidos"
on site.cms_home_slides
for select to anon, authenticated
using (status = 'publicado');

-- 7. Concessão de permissões de leitura (escrita restrita a service_role)
grant usage on schema site to anon, authenticated;
grant select on site.cms_home_slides to anon, authenticated;
