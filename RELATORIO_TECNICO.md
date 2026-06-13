# Relatório Técnico do Portal COMIEADEPA

## 1. Estrutura de pastas do projeto

```text
comieadepa.org/
├── public/
│   ├── assets/                  Imagens institucionais
│   └── img/
├── src/
│   ├── app/
│   │   ├── admin/               Painel editorial
│   │   ├── api/admin/           APIs administrativas
│   │   ├── departamentos/       Páginas públicas dos departamentos
│   │   ├── noticias/            Notícias públicas
│   │   ├── paginas/             Páginas institucionais
│   │   ├── privacidade/
│   │   ├── termos/
│   │   ├── videos/
│   │   ├── layout.tsx
│   │   ├── page.tsx             Home
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   ├── lib/                     Permissões, CMS, SEO e acesso a dados
│   └── middleware.ts
├── supabase/
│   ├── cms-schema.sql
│   ├── eventos-schema.sql
│   ├── paginas-schema.sql
│   └── config.toml
├── package.json
├── next.config.ts
└── tsconfig.json
```

## 2. Stack utilizada

- Next.js 15 com App Router.
- React 19.
- TypeScript em modo estrito.
- Tailwind CSS 4.
- Framer Motion.
- Lucide React.
- Supabase: autenticação, PostgreSQL, API REST e Storage.
- PostgREST para leitura e escrita.
- ESLint com regras Next.js.
- Vercel como provável ambiente de hospedagem.
- Prisma não está instalado nem utilizado.

## 3. Principais módulos existentes

- Home pública institucional.
- Notícias e categorias.
- Vídeos e importação do YouTube.
- Departamentos.
- Eventos e tipos de inscrição.
- Páginas institucionais.
- Biblioteca de mídia.
- Configurações gerais e SEO.
- Home editável.
- Usuários administrativos.
- Perfis e permissões.
- Auditoria.
- Pré-visualização de conteúdos.
- Dashboard com métricas editoriais.

## 4. Sistema de autenticação

- Login por e-mail e senha utilizando Supabase Auth.
- Tokens de acesso e atualização armazenados em cookies `httpOnly`.
- Renovação automática de sessão pelo middleware.
- O usuário autenticado também precisa existir e estar ativo em `cms_admin_users`.
- Perfis existentes: `admin`, `editor`, `midia` e `viewer`.
- O middleware protege `/admin/*` e `/api/admin/*`.
- As permissões são verificadas por módulo e ação.
- O cadastro em `cms_admin_users` não cria automaticamente uma conta de autenticação.

## 5. Sistema CMS existente

- CRUD editorial de notícias, páginas, departamentos, vídeos e categorias.
- Estados de notícia: rascunho, revisão, publicado, agendado e arquivado.
- Publicação programada por `publicado_em`.
- Conteúdos destacados na home.
- Editor textual com marcação simples para títulos, links, listas e imagens.
- Biblioteca de mídia integrada ao Storage.
- Home configurável por seções.
- SEO individual para páginas institucionais.
- Registro automático de ações administrativas.
- Pré-visualização antes da publicação.

## 6. Layout principal e componentes compartilhados

- `src/app/layout.tsx`: fontes, metadados globais e consentimento LGPD.
- `src/app/page.tsx`: home pública, menu, seções, rodapé e carregamento dinâmico.
- `src/app/admin/layout.tsx`: sidebar, cabeçalho, perfil atual e logout.
- Componentes administrativos compartilhados:
  - `RichTextField`
  - `MediaUrlField`
  - `StatusMessage`
  - `SettingsForm`
  - `HomeSettingsForm`
  - `PagesManager`
- Views compartilhadas para notícias, departamentos e páginas.
- Não existe uma pasta global `components`.
- O cabeçalho público está incorporado diretamente na home e não é compartilhado pelas páginas internas.

## 7. Rotas públicas e privadas

### Públicas

- `/`
- `/noticias`
- `/noticias/[slug]`
- `/videos`
- `/departamentos`
- `/departamentos/[slug]`
- `/paginas`
- `/paginas/[slug]`
- `/privacidade`
- `/termos`
- `/robots.txt`
- `/sitemap.xml`

### Privadas

- `/admin`
- `/admin/home`
- `/admin/eventos`
- `/admin/noticias`
- `/admin/categorias`
- `/admin/videos`
- `/admin/departamentos`
- `/admin/midia`
- `/admin/paginas`
- `/admin/auditoria`
- `/admin/usuarios`
- `/admin/permissoes`
- `/admin/configuracoes`
- `/admin/preview/*`

`/admin/login` é a entrada pública do painel.

## 8. Como funciona o menu principal

- O menu público está definido dentro da home.
- A maioria dos itens navega para seções por âncoras.
- O item `Institucional` abre `/paginas`.
- Existe versão desktop e menu móvel.
- O botão "Área do Ministro" usa URL configurável.
- O menu administrativo é definido em `src/lib/cms.ts`.
- A sidebar do admin é filtrada conforme o perfil autenticado.
- Busca e sino do cabeçalho administrativo ainda não possuem funcionalidade implementada.

## 9. Como funciona o banco de dados

- PostgreSQL gerenciado pelo Supabase.
- Dados do portal ficam no schema `site`.
- Eventos existentes ficam no schema `public`.
- Views do schema `site` expõem eventos públicos ao portal.
- Chaves estrangeiras ligam conteúdos a departamentos e categorias.
- RLS está habilitado nas tabelas do CMS.
- Usuários anônimos recebem somente leitura de conteúdo público.
- Operações administrativas utilizam a chave de serviço no servidor.
- Configurações são armazenadas como chave/valor em JSONB.
- Não existe ORM; o acesso é feito diretamente pela API REST.

## 10. Lista das tabelas utilizadas pelo portal

### Schema `site`

- `cms_departamentos`
- `cms_categorias`
- `cms_posts`
- `cms_videos`
- `cms_media_assets`
- `cms_audit_logs`
- `cms_admin_users`
- `cms_configuracoes`
- `cms_paginas`

### Schema `public`

- `eventos`
- `evento_tipos_inscricao`

### Views

- `site.v_eventos_publicos`
- `site.v_evento_tipos_inscricao_publicos`

O Storage utiliza, por padrão, o bucket `cms-media`.

## 11. APIs existentes

- `POST /api/admin/auth/login`
- `POST /api/admin/auth/logout`
- `POST /api/admin/categorias`
- `POST /api/admin/configuracoes`
- `POST /api/admin/departamentos`
- `POST /api/admin/eventos`
- `POST /api/admin/eventos/tipos`
- `POST /api/admin/home`
- `POST /api/admin/media`
- `GET, POST, PUT, DELETE /api/admin/paginas`
- `POST /api/admin/permissoes`
- `POST, DELETE /api/admin/posts`
- `POST /api/admin/usuarios`
- `POST /api/admin/videos`
- `POST /api/admin/youtube/import`

## 12. Integrações existentes

- Supabase Auth.
- Supabase PostgreSQL e API REST.
- Supabase Storage.
- YouTube Data API para importação de playlist.
- YouTube Embed e thumbnails.
- Sistema externo de eventos.
- Área externa do Ministro.
- WhatsApp para contatos de departamentos.
- Facebook, Instagram e YouTube.
- Google Fonts por `next/font`.
- Consentimento LGPD.
- Sitemap, robots e metadados Open Graph.

## 13. Possíveis áreas disponíveis para expansão

- Busca global pública e administrativa.
- Central de notificações.
- Criação automática da conta de autenticação ao cadastrar usuário.
- Recuperação e redefinição de senha.
- Permissões personalizadas além dos quatro perfis fixos.
- Workflow formal de aprovação editorial.
- Histórico e restauração de versões.
- Exclusão e organização avançada da biblioteca de mídia.
- Analytics de acesso e desempenho de conteúdo.
- Formulário público de contato.
- Newsletter e mailing.
- Agenda pública detalhada de eventos.
- Gestão de documentos e downloads.
- Menu público totalmente administrável.
- Cabeçalho e rodapé compartilhados nas páginas internas.
- Testes automatizados.
- Monitoramento de erros e disponibilidade.

# ESTADO ATUAL DO PROJETO

## O que está pronto

- Portal público responsivo.
- Home institucional dinâmica.
- Notícias, vídeos, departamentos e páginas institucionais.
- CMS administrativo protegido.
- Autenticação e renovação de sessão.
- Perfis administrativos e controle de acesso.
- Biblioteca de mídia.
- Auditoria.
- Configurações, SEO, sitemap e LGPD.
- Integrações com eventos e YouTube.

## O que está parcialmente implementado

- Usuários: o cadastro administrativo não provisiona a conta de login.
- Permissões: os perfis podem ser atribuídos, mas a matriz é fixa no código.
- Eventos: dependem das tabelas e do sistema externo existente.
- Busca e notificações administrativas são apenas visuais.
- Biblioteca de mídia não possui gestão completa de exclusão e metadados.
- Layout público não é compartilhado entre todas as páginas.
- Alguns conteúdos possuem dados de fallback fixos na aplicação.

## O que está faltando

- Provisionamento completo de usuários.
- Recuperação de senha.
- Busca funcional.
- Notificações.
- Testes automatizados.
- Versionamento editorial.
- Analytics.
- Formulários públicos.
- Gestão dinâmica do menu.
- Padronização do layout das páginas públicas.

## Módulos que podem ser desenvolvidos sem impactar os existentes

- Busca global.
- Newsletter.
- Formulário de contato.
- Analytics.
- Central de documentos.
- Galerias de fotos.
- Notificações administrativas.
- Histórico de versões.
- Agenda pública avançada.
- FAQ institucional.
- Gestão de banners.
- Relatórios editoriais.
