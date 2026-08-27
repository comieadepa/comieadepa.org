"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";
import { adminNavGroups, type AdminNavItem } from "@/lib/cms";
import { filterAdminNavGroupsByRole, normalizeAdminRole, type AdminRole } from "@/lib/admin-permissions";

const unlockedRoutes = new Set([
  "/admin",
  "/admin/home",
  "/admin/noticias",
  "/admin/usuarios",
]);

function isRouteActive(item: AdminNavItem, currentPath: string): boolean {
  if (item.href === "/admin") {
    return currentPath === "/admin" || currentPath === "/admin/";
  }

  if (currentPath === item.href || currentPath.startsWith(`${item.href}/`)) {
    return true;
  }

  if (item.subItems && item.subItems.some((sub) => currentPath === sub.href || currentPath.startsWith(`${sub.href}/`))) {
    return true;
  }

  if (item.href === "/admin/noticias" && (currentPath.startsWith("/admin/categorias") || currentPath.startsWith("/admin/preview/noticias"))) {
    return true;
  }

  return false;
}

export function AdminSidebarNav({ role }: { role: AdminRole | string }) {
  const pathname = usePathname() || "";
  const normalizedRole = normalizeAdminRole(role);
  const visibleNavGroups = filterAdminNavGroupsByRole(adminNavGroups, normalizedRole);

  return (
    <nav className="mt-6 flex-1 space-y-6 overflow-y-auto">
      {visibleNavGroups.map((group) => (
        <div key={group.id} className="space-y-1.5">
          {group.title ? (
            <p className="px-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#f4cf6a]/70">
              {group.title}
            </p>
          ) : null}

          <div className="grid gap-1">
            {group.items.map((item) => {
              const isUnlocked = unlockedRoutes.has(item.href);
              const isItemActive = isRouteActive(item, pathname);

              if (!isUnlocked) {
                return (
                  <div
                    key={item.href}
                    title="Módulo em fase de homologação"
                    className="flex items-center justify-between rounded-sm px-3.5 py-2.5 text-sm font-semibold text-white/28 cursor-not-allowed select-none transition hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className="text-white/20" />
                      <span>{item.label}</span>
                    </div>
                    <Lock size={12} className="text-white/20" />
                  </div>
                );
              }

              return (
                <div key={item.href} className="space-y-1">
                  <Link
                    href={item.href}
                    className={`group flex items-center justify-between rounded-sm border px-3.5 py-2.5 text-sm font-bold transition ${
                      isItemActive
                        ? "border-[#f4cf6a]/60 bg-[#f4cf6a]/15 text-white shadow-sm"
                        : "border-transparent text-white/80 hover:border-white/10 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        size={18}
                        className={isItemActive ? "text-[#f4cf6a]" : "text-white/60 group-hover:text-[#f4cf6a]"}
                      />
                      <span className="flex-1">{item.label}</span>
                    </div>
                    {isItemActive && (
                      <span className="rounded bg-[#f4cf6a] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#171006]">
                        Ativo
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
