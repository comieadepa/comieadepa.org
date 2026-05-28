export type AdminRole = "admin" | "editor" | "midia" | "viewer";

type AdminPermission = {
  href: string;
  roles: AdminRole[];
};

const fallbackRole: AdminRole = "viewer";

export const adminPermissions: AdminPermission[] = [
  { href: "/admin", roles: ["admin", "editor", "midia", "viewer"] },
  { href: "/admin/home", roles: ["admin", "editor", "midia"] },
  { href: "/admin/noticias", roles: ["admin", "editor"] },
  { href: "/admin/categorias", roles: ["admin", "editor"] },
  { href: "/admin/videos", roles: ["admin", "editor", "midia"] },
  { href: "/admin/departamentos", roles: ["admin", "editor"] },
  { href: "/admin/midia", roles: ["admin", "editor", "midia"] },
  { href: "/admin/auditoria", roles: ["admin"] },
  { href: "/admin/usuarios", roles: ["admin"] },
  { href: "/admin/configuracoes", roles: ["admin"] },
];

export function normalizeAdminRole(value: string | undefined | null): AdminRole {
  if (value === "admin" || value === "editor" || value === "midia" || value === "viewer") {
    return value;
  }

  return fallbackRole;
}

export function canAccessAdminPath(pathname: string, role: AdminRole) {
  if (role === "admin") {
    return true;
  }

  const normalizedPath = normalizeAdminPath(pathname);
  const permission = adminPermissions
    .filter((item) => normalizedPath === item.href || normalizedPath.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];

  return permission ? permission.roles.includes(role) : false;
}

export function filterAdminNavByRole<TItem extends { href: string }>(items: TItem[], role: AdminRole) {
  return items.filter((item) => canAccessAdminPath(item.href, role));
}

function normalizeAdminPath(pathname: string) {
  if (pathname.startsWith("/api/admin/posts")) {
    return "/admin/noticias";
  }

  if (pathname.startsWith("/api/admin/categorias")) {
    return "/admin/categorias";
  }

  if (pathname.startsWith("/api/admin/videos")) {
    return "/admin/videos";
  }

  if (pathname.startsWith("/api/admin/youtube")) {
    return "/admin/videos";
  }

  if (pathname.startsWith("/api/admin/departamentos")) {
    return "/admin/departamentos";
  }

  if (pathname.startsWith("/api/admin/media")) {
    return "/admin/midia";
  }

  if (pathname.startsWith("/api/admin/home")) {
    return "/admin/home";
  }

  if (pathname.startsWith("/api/admin/usuarios")) {
    return "/admin/usuarios";
  }

  if (pathname.startsWith("/api/admin/configuracoes")) {
    return "/admin/configuracoes";
  }

  return pathname;
}
