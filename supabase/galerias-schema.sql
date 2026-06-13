-- ==========================================
-- CMS GALERIAS DE FOTOS
-- ==========================================

create table if not exists site.cms_galerias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  slug text not null unique,
  descricao text,
  categoria text,
  capa_url text,
  status text not null default 'rascunho'
    check (status in ('rascunho', 'publicado', 'arquivado')),
  destaque boolean not null default false,
  ordem integer not null default 0,
  data_evento date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid
);

create table if not exists site.cms_galeria_fotos (
  id uuid primary key default gen_random_uuid(),
  galeria_id uuid not null references site.cms_galerias(id) on delete cascade,
  imagem_url text not null,
  legenda text,
  credito text,
  ordem integer not null default 0,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on site.cms_galerias;
create trigger set_updated_at
before update on site.cms_galerias
for each row execute function public.set_updated_at();

alter table site.cms_galerias enable row level security;
alter table site.cms_galeria_fotos enable row level security;

drop policy if exists "Site galerias publicadas podem ser lidas"
on site.cms_galerias;

create policy "Site galerias publicadas podem ser lidas"
on site.cms_galerias
for select to anon
using (status = 'publicado');

drop policy if exists "Site fotos de galerias publicadas podem ser lidas"
on site.cms_galeria_fotos;

create policy "Site fotos de galerias publicadas podem ser lidas"
on site.cms_galeria_fotos
for select to anon
using (
  exists (
    select 1
    from site.cms_galerias galerias
    where galerias.id = cms_galeria_fotos.galeria_id
      and galerias.status = 'publicado'
  )
);

grant select on site.cms_galerias to anon, authenticated;
grant select on site.cms_galeria_fotos to anon, authenticated;
