-- ==========================================
-- MESA DIRETORA V3 — GRUPOS CONFORME ESTRUTURA OFICIAL COMIEADEPA
-- Migration: 20261017000000_mesa_diretora_grupos_v3.sql
-- Aplique manualmente no painel Supabase > SQL Editor
-- ==========================================

-- 1. Estender o CHECK CONSTRAINT do layout para incluir grid5, grid6 e conselho_fiscal
-- Remove qualquer constraint de check existente na coluna layout (inclusive inline anonymous)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT conname
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
    WHERE c.conrelid = 'site.cms_mesa_grupos'::regclass
      AND c.contype = 'c'
      AND a.attname = 'layout'
  ) LOOP
    EXECUTE 'ALTER TABLE site.cms_mesa_grupos DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE site.cms_mesa_grupos
  ADD CONSTRAINT cms_mesa_grupos_layout_check
    CHECK (layout IN ('hero', 'center', 'grid2', 'grid3', 'grid4', 'grid5', 'grid6', 'conselho_fiscal'));

-- 2. Migrar grupo legado "vice_presidentes" para novo slug "vices_administrativos" caso exista
UPDATE site.cms_mesa_grupos
SET slug       = 'vices_administrativos',
    nome       = 'Vices-Administrativos',
    layout     = 'grid6',
    ordem      = 20,
    updated_at = now()
WHERE slug = 'vice_presidentes'
  AND NOT EXISTS (SELECT 1 FROM site.cms_mesa_grupos WHERE slug = 'vices_administrativos');

-- 3. Remover grupos legados que não fazem parte da estrutura oficial v3
-- (Somente remove se não houver dirigentes associados a eles)
DELETE FROM site.cms_mesa_grupos
WHERE slug IN ('presidente_honra', 'assessoria', 'conselhos', 'comissoes')
  AND NOT EXISTS (
    SELECT 1 FROM site.cms_mesa_diretora d
    WHERE d.grupo_id = site.cms_mesa_grupos.id
  );

-- 4. Inserir / Atualizar grupos na ordem oficial v3
INSERT INTO site.cms_mesa_grupos (nome, slug, ordem, layout, ativo, subtitulo, descricao)
VALUES
  (
    'Presidente',
    'presidente',
    10,
    'hero',
    true,
    'Ministro do Evangelho',
    'Presidente da Convenção Interestadual de Ministros e Igrejas Evangélicas Assembleias de Deus no Pará.'
  ),
  (
    'Vices-Administrativos',
    'vices_administrativos',
    20,
    'grid6',
    true,
    '1º ao 6º Vice-Administrativo',
    null
  ),
  (
    'Vices-Assistenciais',
    'vices_assistenciais',
    30,
    'grid6',
    true,
    '1º ao 6º Vice-Assistencial',
    null
  ),
  (
    'Secretários',
    'secretarios',
    40,
    'grid5',
    true,
    '1º ao 5º Secretário',
    null
  ),
  (
    'Tesoureiros',
    'tesoureiros',
    50,
    'grid3',
    true,
    '1º ao 3º Tesoureiro',
    null
  ),
  (
    'Conselho Fiscal',
    'conselho_fiscal',
    60,
    'conselho_fiscal',
    true,
    'Titulares e Suplentes',
    null
  )
ON CONFLICT (slug) DO UPDATE SET
  nome      = EXCLUDED.nome,
  ordem     = EXCLUDED.ordem,
  layout    = EXCLUDED.layout,
  ativo     = EXCLUDED.ativo,
  subtitulo = EXCLUDED.subtitulo,
  descricao = EXCLUDED.descricao,
  updated_at = now();

-- 5. Adicionar coluna subgrupo à tabela de membros (para dividir Titulares/Suplentes no Conselho Fiscal)
ALTER TABLE site.cms_mesa_diretora
  ADD COLUMN IF NOT EXISTS subgrupo text
    CHECK (subgrupo IS NULL OR subgrupo IN ('titular', 'suplente'));

COMMENT ON COLUMN site.cms_mesa_diretora.subgrupo IS
  'Subgrupo do membro dentro do grupo — ex: titular ou suplente no Conselho Fiscal.';

-- Índice para otimizar filtros por subgrupo
CREATE INDEX IF NOT EXISTS idx_mesa_diretora_subgrupo ON site.cms_mesa_diretora(subgrupo);

-- 6. Garantir permissões de leitura pública e RLS
GRANT USAGE ON SCHEMA site TO anon, authenticated, service_role;
GRANT SELECT ON site.cms_mesa_grupos TO anon, authenticated;
GRANT SELECT ON site.cms_mesa_diretora TO anon, authenticated;
GRANT ALL PRIVILEGES ON site.cms_mesa_grupos TO service_role;
GRANT ALL PRIVILEGES ON site.cms_mesa_diretora TO service_role;

-- 7. Verificação final de conferência
SELECT id, nome, slug, ordem, layout, ativo FROM site.cms_mesa_grupos ORDER BY ordem;

