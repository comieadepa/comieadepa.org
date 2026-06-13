-- ==========================================
-- CMS DOCUMENTOS
-- ==========================================

create table if not exists site.cms_documentos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  slug text not null unique,
  descricao text,
  categoria text,
  arquivo_url text not null,
  thumbnail_url text,
  tipo_arquivo text,
  tamanho bigint not null default 0,
  ordem integer not null default 0,
  downloads integer not null default 0,
  destaque boolean not null default false,
  status text not null default 'rascunho'
    check (status in ('rascunho', 'publicado', 'arquivado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by text
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on site.cms_documentos;
create trigger set_updated_at
before update on site.cms_documentos
for each row execute function public.set_updated_at();

alter table site.cms_documentos enable row level security;

drop policy if exists "Site documentos publicados podem ser lidos"
on site.cms_documentos;

create policy "Site documentos publicados podem ser lidos"
on site.cms_documentos
for select to anon
using (status = 'publicado');

grant select on site.cms_documentos to anon, authenticated;
