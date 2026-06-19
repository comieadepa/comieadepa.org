-- ==========================================
-- CMS INSTITUCIONAL V2 (CONTEÚDO E SEO)
-- ==========================================

alter table site.cms_institucional
add column if not exists subtitulo text,
add column if not exists descricao text,
add column if not exists conteudo text,
add column if not exists hero_image_url text,
add column if not exists seo_title text,
add column if not exists seo_description text;
