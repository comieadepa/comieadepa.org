-- ==========================================
-- CMS PAGINAS INSTITUCIONAIS
-- ==========================================

create table if not exists site.cms_paginas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  slug text not null unique,
  resumo text,
  conteudo text,
  imagem_url text,
  status text not null default 'rascunho'
    check (status in ('rascunho','publicado','arquivado')),
  ordem integer not null default 0,
  seo_title text,
  seo_description text,
  publicado_em timestamptz,
  criado_por text,
  atualizado_por text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on site.cms_paginas;
create trigger set_updated_at
before update on site.cms_paginas
for each row execute function public.set_updated_at();

alter table site.cms_paginas enable row level security;

drop policy if exists "Site paginas publicadas podem ser lidas"
on site.cms_paginas;

create policy "Site paginas publicadas podem ser lidas"
on site.cms_paginas
for select to anon
using (status = 'publicado' and (publicado_em is null or publicado_em <= now()));

grant select on site.cms_paginas to anon, authenticated;
