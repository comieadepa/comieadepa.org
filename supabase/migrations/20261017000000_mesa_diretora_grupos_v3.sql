-- ==========================================
-- MESA DIRETORA V3 — GRUPOS CONFORME ESTRUTURA OFICIAL COMIEADEPA
-- Migration: 20261017000000_mesa_diretora_grupos_v3.sql
-- Aplique manualmente no painel Supabase > SQL Editor
-- ==========================================

-- 1. Estender o CHECK CONSTRAINT do layout para incluir grid6 e conselho_fiscal
-- (Recriar o constraint substituindo o existente)
ALTER TABLE site.cms_mesa_grupos
  DROP CONSTRAINT IF EXISTS cms_mesa_grupos_layout_check;

ALTER TABLE site.cms_mesa_grupos
  ADD CONSTRAINT cms_mesa_grupos_layout_check
    CHECK (layout IN ('hero', 'center', 'grid2', 'grid3', 'grid4', 'grid5', 'grid6', 'conselho_fiscal'));

-- 2. Remover grupos legados que não fazem parte da estrutura oficial v3
-- ATENÇÃO: Só executa se não houver membros publicados nesses grupos.
-- Se houver, migre os membros manualmente antes.
DELETE FROM site.cms_mesa_grupos
WHERE slug IN ('presidente_honra', 'assessoria', 'conselhos', 'comissoes')
  AND NOT EXISTS (
    SELECT 1 FROM site.cms_mesa_diretora d
    WHERE d.grupo_id = site.cms_mesa_grupos.id
      AND d.status = 'publicado'
  );

-- 3. Inserir / Atualizar grupos na ordem oficial v3
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

-- 4. Atualizar grupo legado "vice_presidentes" para novo slug se existir
UPDATE site.cms_mesa_grupos
SET slug       = 'vices_administrativos',
    nome       = 'Vices-Administrativos',
    layout     = 'grid6',
    ordem      = 20,
    updated_at = now()
WHERE slug = 'vice_presidentes'
  AND NOT EXISTS (SELECT 1 FROM site.cms_mesa_grupos WHERE slug = 'vices_administrativos');

-- 5. Adicionar coluna subgrupo à tabela de membros (para dividir Titulares/Suplentes no Conselho Fiscal)
ALTER TABLE site.cms_mesa_diretora
  ADD COLUMN IF NOT EXISTS subgrupo text
    CHECK (subgrupo IS NULL OR subgrupo IN ('titular', 'suplente'));

COMMENT ON COLUMN site.cms_mesa_diretora.subgrupo IS
  'Subgrupo do membro dentro do grupo — ex: titular ou suplente no Conselho Fiscal.';

-- Index para otimizar filtros por subgrupo
CREATE INDEX IF NOT EXISTS idx_mesa_diretora_subgrupo ON site.cms_mesa_diretora(subgrupo);


-- 5. Garantir que o campo grupo_id não perde FK ao recriar grupos com novo slug
-- (A FK é por UUID, então renomear slugs não afeta membros já associados.)

-- 6. Verificação final — exibir grupos existentes
SELECT id, nome, slug, ordem, layout, ativo FROM site.cms_mesa_grupos ORDER BY ordem;
