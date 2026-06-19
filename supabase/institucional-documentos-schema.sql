-- ==========================================
-- CMS INSTITUCIONAL DOCUMENTOS (SUB-MÓDULO)
-- ==========================================

-- Alterar constraint de tipo em secoes para incluir 'documentos'
alter table site.cms_institucional_secoes drop constraint if exists cms_institucional_secoes_tipo_check;
alter table site.cms_institucional_secoes add constraint cms_institucional_secoes_tipo_check check (tipo in ('texto', 'imagem_texto', 'cta', 'cards', 'documentos'));

-- Criar tabela de documentos da seção
create table if not exists site.cms_institucional_documentos (
  id uuid primary key default gen_random_uuid(),
  secao_id uuid not null references site.cms_institucional_secoes(id) on delete cascade,
  documento_id uuid not null references site.cms_documentos(id) on delete cascade,
  ordem integer not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- Indices
create index if not exists idx_inst_docs_secao on site.cms_institucional_documentos(secao_id);
create index if not exists idx_inst_docs_doc on site.cms_institucional_documentos(documento_id);

-- Habilitar RLS
alter table site.cms_institucional_documentos enable row level security;

-- Política de RLS
drop policy if exists "Documentos vinculados ativos podem ser lidos" on site.cms_institucional_documentos;
create policy "Documentos vinculados ativos podem ser lidos"
on site.cms_institucional_documentos
for select to anon, authenticated
using (ativo = true);

-- Permissões
grant select on site.cms_institucional_documentos to anon, authenticated;
grant all privileges on site.cms_institucional_documentos to service_role;
