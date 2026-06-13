import {
  BarChart3,
  Building2,
  FileText,
  FolderOpen,
  ImageIcon,
  Home,
  Images,
  ListChecks,
  Newspaper,
  UserCog,
  Settings,
  ShieldCheck,
  Tags,
  Youtube,
} from "lucide-react";

export const adminNavItems = [
  { href: "/admin", label: "Visão Geral", icon: Home },
  { href: "/admin/home", label: "Home", icon: Settings },
  { href: "/admin/noticias", label: "Notícias", icon: Newspaper },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/videos", label: "Vídeos", icon: Youtube },
  { href: "/admin/departamentos", label: "Departamentos", icon: Building2 },
  { href: "/admin/documentos", label: "Documentos", icon: FolderOpen },
  { href: "/admin/galerias", label: "Galeria de Fotos", icon: ImageIcon },
  { href: "/admin/midia", label: "Mídia", icon: Images },
  { href: "/admin/paginas", label: "Páginas", icon: FileText },
  { href: "/admin/auditoria", label: "Auditoria", icon: ListChecks },
  { href: "/admin/usuarios", label: "Usuários", icon: UserCog },
  { href: "/admin/permissoes", label: "Permissões", icon: ShieldCheck },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export const adminSecondaryNavItems = [
  { href: "/admin/paginas", label: "Páginas", icon: FileText, status: "Ativo" },
  { href: "/admin/permissoes", label: "Permissões", icon: ShieldCheck, status: "Ativo" },
  { href: "/admin/home", label: "Home editável", icon: Settings, status: "Ativo" },
];

export const editorialWorkflow = [
  {
    title: "Rascunho",
    text: "A equipe de mídia cria conteúdo, adiciona imagens, vídeos e resumo para revisão.",
  },
  {
    title: "Revisão",
    text: "Coordenação valida texto, departamento relacionado, SEO e data de publicação.",
  },
  {
    title: "Publicado",
    text: "O conteúdo aparece automaticamente no portal e pode ser destacado na home.",
  },
];

export const contentModules = [
  {
    title: "Notícias e Blog",
    icon: Newspaper,
    text: "Publicações institucionais, coberturas, comunicados oficiais e notas da convenção.",
    status: "Primeiro módulo",
  },
  {
    title: "Canal YouTube",
    icon: Youtube,
    text: "Cadastro de vídeos, shorts, lives e destaques por departamento ou evento.",
    status: "Primeiro módulo",
  },
  {
    title: "Departamentos",
    icon: Building2,
    text: "Páginas próprias para AGO, UMADESPA, COADESPA, SEIADEPA, CONEC e novos órgãos.",
    status: "Primeiro módulo",
  },
  {
    title: "Biblioteca de mídia",
    icon: Images,
    text: "Upload de capas, banners, logos, thumbnails e documentos para reutilização no portal.",
    status: "Primeiro módulo",
  },
  {
    title: "Métricas editoriais",
    icon: BarChart3,
    text: "Visão de conteúdos publicados, pendências e áreas que precisam de atualização.",
    status: "Painel",
  },
];

export const postStatuses = ["Rascunho", "Em revisão", "Publicado", "Agendado", "Arquivado"];

export const postSamples = [
  {
    title: "Cobertura oficial da 125ª Assembleia Geral Ordinária",
    department: "AGO",
    status: "Rascunho",
    date: "A definir",
  },
  {
    title: "COMIEADEPA amplia comunicação institucional",
    department: "Secretaria",
    status: "Em revisão",
    date: "A definir",
  },
];

export const videoSamples = [
  {
    title: "Registro institucional da convenção",
    type: "Shorts",
    department: "COMIEADEPA",
    featured: true,
  },
  {
    title: "Palavra da presidência",
    type: "Vídeo",
    department: "Presidência",
    featured: true,
  },
];

export const departmentPages = [
  {
    slug: "ago",
    name: "AGO",
    title: "Assembleia Geral Ordinária",
    text: "Página da AGO com programação, comunicados, cobertura, deliberações e materiais oficiais.",
    status: "Planejada",
  },
  {
    slug: "umadespa",
    name: "UMADESPA",
    title: "União da Mocidade das Assembleias de Deus no Pará",
    text: "Página dedicada à juventude, congressos, mobilizações, vídeos e notícias da UMADESPA.",
    status: "Planejada",
  },
  {
    slug: "coadespa",
    name: "COADESPA",
    title: "Coordenação de Senhoras",
    text: "Espaço para ações, agenda, conteúdos e comunicação oficial da COADESPA.",
    status: "Planejada",
  },
  {
    slug: "seiadepa",
    name: "SEIADEPA",
    title: "Secretaria Infantil",
    text: "Conteúdo, treinamentos, materiais e eventos relacionados ao trabalho com crianças.",
    status: "Planejada",
  },
  {
    slug: "conec",
    name: "CONEC",
    title: "Conselho de Educação Cristã",
    text: "Página para ensino, formação, currículos, EBD e ações de educação cristã.",
    status: "Planejada",
  },
];
