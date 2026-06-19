-- Sprint 9: Hero Builder Institucional
-- Adiciona campos de configuração do hero premium às páginas institucionais

ALTER TABLE site.cms_institucional
  ADD COLUMN IF NOT EXISTS hero_badge text,
  ADD COLUMN IF NOT EXISTS hero_overlay_opacity numeric DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS hero_alignment text DEFAULT 'left';

COMMENT ON COLUMN site.cms_institucional.hero_badge IS 'Badge opcional exibido acima do título no hero (ex: INSTITUCIONAL, PRESIDENTE)';
COMMENT ON COLUMN site.cms_institucional.hero_overlay_opacity IS 'Opacidade do overlay escuro sobre a imagem hero (0.0 a 1.0)';
COMMENT ON COLUMN site.cms_institucional.hero_alignment IS 'Alinhamento do conteúdo no hero: left | center | right';
