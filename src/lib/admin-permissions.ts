export type AdminRole = "admin" | "editor" | "midia" | "viewer";
export type AdminModule =
  | "dashboard"
  | "home"
  | "eventos"
  | "noticias"
  | "videos"
  | "departamentos"
  | "midia"
  | "auditoria"
  | "usuarios"
  | "configuracoes"
  | "permissoes"
  | "paginas";
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
  "midia",
  "auditoria",
  "usuarios",
  "configuracoes",
  "permissoes",
  "paginas",
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
  midia: "/admin/midia",
  auditoria: "/admin/auditoria",
  usuarios: "/admin/usuarios",
  configuracoes: "/admin/configuracoes",
  permissoes: "/admin/permissoes",
  paginas: "/admin/paginas",
};

const rolePermissions: Record<AdminRole, Partial<Record<AdminModule, AdminAction[]>>> = {
  admin: Object.fromEntries(adminModules.map((moduleKey) => [moduleKey, adminActions])) as Record<AdminModule, AdminAction[]>,
  editor: {
    dashboard: ["view"],
    home: ["view", "update"],
    eventos: ["view", "create", "update"],
    noticias: ["view", "create", "update", "publish", "archive"],
    videos: ["view", "create", "update"],
    departamentos: ["view", "create", "update"],
    midia: ["view", "upload"],
    paginas: ["view", "create", "update", "publish", "archive"],
  },
  midia: {
    dashboard: ["view"],
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
    midia: ["view"],
    paginas: ["view"],
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

  if (pathname.startsWith("/admin/permissoes")) {
    return "permissoes";
  }

  if (pathname.startsWith("/admin/paginas") || pathname.startsWith("/api/admin/paginas")) {
    return "paginas";
  }

  if (pathname.startsWith("/admin/paginas")) {
    return "paginas";
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

  if (pathname.startsWith("/admin/preview/paginas")) {
    return "paginas";
  }

  return null;
}
