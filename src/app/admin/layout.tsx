import { adminNavGroups } from "@/lib/cms";
import { filterAdminNavGroupsByRole, normalizeAdminRole } from "@/lib/admin-permissions";
import { ArrowLeft, Bell, Lock, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const role = normalizeAdminRole(headerList.get("x-admin-role"));
  const adminEmail = headerList.get("x-admin-email");
  const currentPath = headerList.get("x-admin-path") ?? "";

  if (currentPath.startsWith("/admin/login") || currentPath.startsWith("/admin/definir-senha")) {
    return <main className="min-h-screen bg-[#f4efe1] text-[#171006]">{children}</main>;
  }

  const visibleNavGroups = filterAdminNavGroupsByRole(adminNavGroups, role);

  return (
    <main className="min-h-screen bg-[#f4efe1] text-[#171006]">
      <div className="grid min-h-screen lg:grid-cols-[292px_1fr]">
        <aside className="flex flex-col border-r border-[#d8c38b] bg-[#120f0a] px-5 py-6 text-white">
          <div className="flex items-center gap-3">
            <Image src="/assets/logo-comieadepa.png" alt="COMIEADEPA" width={54} height={54} className="h-14 w-14 object-contain" />
            <div>
              <p className="font-serif text-2xl font-black leading-none">COMIEADEPA</p>
              <p className="mt-1 text-xs font-black uppercase tracking-[0.2em] text-[#f4cf6a]">Painel editorial</p>
            </div>
          </div>

          <Link
            href="/"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 border border-white/14 bg-white/5 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white/82 transition hover:border-[#f4cf6a] hover:text-[#f4cf6a]"
          >
            <ArrowLeft size={17} />
            Voltar ao portal
          </Link>

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
                    const unlockedRoutes = new Set([
                      "/admin",
                      "/admin/home",
                      "/admin/noticias",
                      "/admin/usuarios",
                    ]);
                    const isUnlocked = unlockedRoutes.has(item.href);
                    const isItemActive =
                      item.href === "/admin"
                        ? currentPath === "/admin" || currentPath === "/admin/"
                        : currentPath === item.href || currentPath.startsWith(`${item.href}/`);

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

          <div className="mt-8 border-t border-white/10 pt-4 text-xs text-white/40 px-3 flex items-center justify-between">
            <span>Portal COMIEADEPA</span>
            <span className="text-[10px] uppercase tracking-wider text-[#f4cf6a]/70">CMS v2.0</span>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-[#d8c38b] bg-[#f4efe1]/88 px-5 py-4 backdrop-blur-xl sm:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8b2f2b]">Central editorial</p>
                <h1 className="mt-1 font-serif text-3xl font-black">Painel de controle</h1>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-[#5a472c]/70">Perfil atual: {formatRole(role)}</p>
                {adminEmail ? <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#5a472c]/55">{adminEmail}</p> : null}
              </div>
              <div className="flex items-center gap-3">
                <label className="hidden min-w-[280px] items-center gap-2 border border-[#d8c38b] bg-white/64 px-4 py-3 text-sm text-[#5a472c] md:flex">
                  <Search size={17} />
                  <input className="w-full bg-transparent outline-none placeholder:text-[#5a472c]/58" placeholder="Buscar conteúdos..." />
                </label>
                <button className="grid h-11 w-11 place-items-center border border-[#d8c38b] bg-white/64 text-[#5a472c]">
                  <Bell size={18} />
                </button>
                <form action="/api/admin/auth/logout" method="post">
                  <button
                    type="submit"
                    className="hidden items-center justify-center border border-[#8b2f2b]/30 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#8b2f2b] sm:inline-flex"
                  >
                    Sair
                  </button>
                </form>
              </div>
            </div>
          </header>

          <div className="px-5 py-8 sm:px-8">{children}</div>
        </section>
      </div>
    </main>
  );
}

function formatRole(role: string) {
  const labels: Record<string, string> = {
    admin: "Administrador",
    editor: "Editor",
    midia: "Mídia",
    viewer: "Leitura",
  };

  return labels[role] ?? role;
}
