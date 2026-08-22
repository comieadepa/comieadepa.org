export type AdminRole = "admin" | "editor" | "midia" | "viewer";
export type AdminModule =
  | "dashboard"
  | "home"
  | "eventos"
  | "noticias"
  | "videos"
  | "departamentos"
  | "documentos"
  | "galerias"
  | "midia"
  | "auditoria"
  | "usuarios"
  | "configuracoes"
  | "permissoes"
  | "paginas"
  | "mesa_diretora"
  | "institucional";
export type AdminAction =
  | "view"
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "archive"
  | "upload"
  | "manage_users"
  | "manage_settings";

type AdminPermission = {
  href: string;
  roles: AdminRole[];
};

const fallbackRole: AdminRole = "viewer";
const adminRoles: AdminRole[] = ["admin", "editor", "midia", "viewer"];
export const adminRoleList = [...adminRoles] as const;
const adminModules: AdminModule[] = [
  "dashboard",
  "home",
  "eventos",
  "noticias",
  "videos",
  "departamentos",
  "documentos",
  "galerias",
  "midia",
  "auditoria",
  "usuarios",
  "configuracoes",
  "permissoes",
  "paginas",
  "mesa_diretora",
  "institucional",
];
export const adminModuleList = [...adminModules] as const;
const adminActions: AdminAction[] = [
  "view",
  "create",
  "update",
  "delete",
  "publish",
  "archive",
  "upload",
  "manage_users",
  "manage_settings",
];
export const adminActionList = [...adminActions] as const;

const adminModulePaths: Record<AdminModule, string> = {
  dashboard: "/admin",
  home: "/admin/home",
  eventos: "/admin/eventos",
  noticias: "/admin/noticias",
  videos: "/admin/videos",
  departamentos: "/admin/departamentos",
  documentos: "/admin/documentos",
  galerias: "/admin/galerias",
  midia: "/admin/midia",
  auditoria: "/admin/auditoria",
  usuarios: "/admin/usuarios",
  configuracoes: "/admin/configuracoes",
  permissoes: "/admin/permissoes",
  paginas: "/admin/paginas",
  mesa_diretora: "/admin/mesa-diretora",
  institucional: "/admin/institucional",
};

const rolePermissions: Record<AdminRole, Partial<Record<AdminModule, AdminAction[]>>> = {
  admin: Object.fromEntries(adminModules.map((moduleKey) => [moduleKey, adminActions])) as Record<AdminModule, AdminAction[]>,
  editor: {
    dashboard: ["view"],
    home: ["view", "create", "update", "delete", "publish", "archive"],
    eventos: ["view", "create", "update"],
    noticias: ["view", "create", "update", "publish", "archive"],
    videos: ["view", "create", "update"],
    departamentos: ["view", "create", "update"],
    documentos: ["view", "create", "update", "publish", "archive"],
    galerias: ["view", "create", "update", "publish", "archive"],
    midia: ["view", "upload"],
    paginas: ["view", "create", "update", "publish", "archive"],
    mesa_diretora: ["view", "create", "update", "delete", "publish"],
    institucional: ["view", "create", "update", "delete", "publish"],
  },
  midia: {
    dashboard: ["view"],
    home: ["view", "create", "update", "publish", "archive"],
    noticias: ["view", "create", "update", "publish", "archive"],
    galerias: ["view", "create", "update", "publish", "archive"],
    midia: ["view", "upload"],
    videos: ["view", "create", "update"],
  },
  viewer: {
    dashboard: ["view"],
    home: ["view"],
    eventos: ["view"],
    noticias: ["view"],
    videos: ["view"],
    departamentos: ["view"],
    documentos: ["view"],
    galerias: ["view"],
    midia: ["view"],
    paginas: ["view"],
    mesa_diretora: ["view"],
    institucional: ["view"],
  },
};

export const adminPermissions: AdminPermission[] = Object.entries(adminModulePaths).map(([moduleKey, href]) => ({
  href,
  roles: adminRoles.filter((role) => canPerformAdminAction(role, moduleKey as AdminModule, "view")),
}));

export function normalizeAdminRole(value: string | undefined | null): AdminRole {
  if (value === "admin" || value === "editor" || value === "midia" || value === "viewer") {
    return value;
  }

  return fallbackRole;
}

export function resolveAdminRoleFromHeaders(headers: Headers) {
  return normalizeAdminRole(headers.get("x-admin-role"));
}

export function canPerformAdminAction(role: AdminRole, adminModule: AdminModule, action: AdminAction) {
  if (role === "admin") {
    return true;
  }

  const actions = rolePermissions[role]?.[adminModule] ?? [];
  return actions.includes(action);
}

export function canAccessAdminPath(pathname: string, role: AdminRole) {
  const adminModule = getAdminModuleFromPath(pathname);
  if (!adminModule) {
    return role === "admin";
  }

  return canPerformAdminAction(role, adminModule, "view");
}

export function filterAdminNavByRole<TItem extends { href: string }>(items: TItem[], role: AdminRole) {
  return items.filter((item) => canAccessAdminPath(item.href, role));
}

export function filterAdminNavGroupsByRole<
  TSubItem extends { href: string },
  TItem extends { href: string; subItems?: TSubItem[] },
  TGroup extends { id: string; title?: string; items: TItem[] }
>(groups: TGroup[], role: AdminRole): TGroup[] {
  return groups
    .map((group) => {
      const visibleItems = group.items
        .filter((item) => canAccessAdminPath(item.href, role) || item.subItems?.some((sub) => canAccessAdminPath(sub.href, role)))
        .map((item) => {
          const visibleSubItems = item.subItems?.filter((sub) => canAccessAdminPath(sub.href, role));
          return {
            ...item,
            subItems: visibleSubItems && visibleSubItems.length > 0 ? visibleSubItems : undefined,
          };
        });

      return {
        ...group,
        items: visibleItems,
      };
    })
    .filter((group) => group.items.length > 0);
}

function getAdminModuleFromPath(pathname: string): AdminModule | null {
  if (pathname === "/admin" || pathname === "/admin/") {
    return "dashboard";
  }

  if (pathname.startsWith("/admin/home") || pathname.startsWith("/api/admin/home")) {
    return "home";
  }

  if (pathname.startsWith("/admin/eventos") || pathname.startsWith("/api/admin/eventos")) {
    return "eventos";
  }

  if (pathname.startsWith("/admin/noticias") || pathname.startsWith("/api/admin/posts")) {
    return "noticias";
  }

  if (pathname.startsWith("/admin/categorias") || pathname.startsWith("/api/admin/categorias")) {
    return "noticias";
  }

  if (pathname.startsWith("/admin/videos") || pathname.startsWith("/api/admin/videos") || pathname.startsWith("/api/admin/youtube")) {
    return "videos";
  }

  if (pathname.startsWith("/admin/departamentos") || pathname.startsWith("/api/admin/departamentos")) {
    return "departamentos";
  }

  if (pathname.startsWith("/admin/documentos") || pathname.startsWith("/api/admin/documentos")) {
    return "documentos";
  }

  if (pathname.startsWith("/admin/galerias") || pathname.startsWith("/api/admin/galerias")) {
    return "galerias";
  }

  if (pathname.startsWith("/admin/midia") || pathname.startsWith("/api/admin/media")) {
    return "midia";
  }

  if (pathname.startsWith("/admin/auditoria")) {
    return "auditoria";
  }

  if (pathname.startsWith("/admin/usuarios") || pathname.startsWith("/api/admin/usuarios")) {
    return "usuarios";
  }

  if (pathname.startsWith("/admin/configuracoes") || pathname.startsWith("/api/admin/configuracoes")) {
    return "configuracoes";
  }

  if (pathname.startsWith("/admin/permissoes") || pathname.startsWith("/api/admin/permissoes")) {
    return "permissoes";
  }

  if (pathname.startsWith("/admin/paginas") || pathname.startsWith("/api/admin/paginas")) {
    return "paginas";
  }

  if (pathname.startsWith("/admin/mesa-diretora") || pathname.startsWith("/api/admin/mesa-diretora")) {
    return "mesa_diretora";
  }

  if (pathname.startsWith("/admin/institucional") || pathname.startsWith("/api/admin/institucional")) {
    return "institucional";
  }

  if (pathname.startsWith("/admin/preview/noticias")) {
    return "noticias";
  }

  if (pathname.startsWith("/admin/preview/videos")) {
    return "videos";
  }

  if (pathname.startsWith("/admin/preview/departamentos")) {
    return "departamentos";
  }

  if (pathname.startsWith("/admin/preview/institucional")) {
    return "institucional";
  }

  if (pathname.startsWith("/admin/preview/paginas")) {
    return "paginas";
  }

  return null;
}
