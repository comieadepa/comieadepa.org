-- ==========================================
-- HOME SLIDER PRINCIPAL
-- ==========================================

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

alter table site.cms_home_slides enable row level security;

drop policy if exists "Site home slides publicados podem ser lidos"
on site.cms_home_slides;

create policy "Site home slides publicados podem ser lidos"
on site.cms_home_slides
for select to anon
using (status = 'publicado');

grant select on site.cms_home_slides to anon, authenticated;
