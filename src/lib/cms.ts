import {
  BarChart3,
  Building2,
  FolderOpen,
  ImageIcon,
  Home,
  Images,
  ListChecks,
  Newspaper,
  UserCog,
  Settings,
  ShieldCheck,
  Youtube,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminSubNavItem = {
  href: string;
  label: string;
};

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  subItems?: AdminSubNavItem[];
};

export type AdminNavGroup = {
  id: string;
  title?: string;
  items: AdminNavItem[];
};

export const adminNavGroups: AdminNavGroup[] = [
  {
    id: "principal",
    title: "Geral",
    items: [
      { href: "/admin", label: "Visão Geral", icon: Home },
    ],
  },
  {
    id: "editorial",
    title: "Conteúdo & Mídia",
    items: [
      { href: "/admin/home", label: "Destaques da Home", icon: Settings },
      {
        href: "/admin/noticias",
        label: "Notícias",
        icon: Newspaper,
        subItems: [
          { href: "/admin/noticias", label: "Todas as notícias" },
          { href: "/admin/categorias", label: "Categorias" },
        ],
      },
      { href: "/admin/galerias", label: "Galeria de Fotos", icon: ImageIcon },
      { href: "/admin/videos", label: "Vídeos & YouTube", icon: Youtube },
      { href: "/admin/midia", label: "Biblioteca de Mídia", icon: Images },
    ],
  },
  {
    id: "institucional",
    title: "Institucional",
    items: [
      {
        href: "/admin/institucional",
        label: "Páginas Institucionais",
        icon: Building2,
        subItems: [
          { href: "/admin/institucional", label: "Estrutura Institucional" },
          { href: "/admin/paginas", label: "Páginas Avulsas" },
        ],
      },
      {
        href: "/admin/mesa-diretora",
        label: "Mesa Diretora",
        icon: Users,
        subItems: [
          { href: "/admin/mesa-diretora", label: "Membros da Mesa" },
          { href: "/admin/mesa-diretora/grupos", label: "Grupos e Comissões" },
        ],
      },
      { href: "/admin/departamentos", label: "Departamentos", icon: Building2 },
      { href: "/admin/documentos", label: "Documentos", icon: FolderOpen },
    ],
  },
  {
    id: "sistema",
    title: "Administração",
    items: [
      { href: "/admin/usuarios", label: "Usuários", icon: UserCog },
      { href: "/admin/permissoes", label: "Permissões (RBAC)", icon: ShieldCheck },
      { href: "/admin/auditoria", label: "Auditoria", icon: ListChecks },
      { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
];

export const adminNavItems: AdminNavItem[] = adminNavGroups.flatMap((group) => group.items);
export const adminSecondaryNavItems: Array<{ href: string; label: string; icon: LucideIcon; status: string }> = [];

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
