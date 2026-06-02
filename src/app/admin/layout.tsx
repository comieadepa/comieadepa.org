import { adminNavItems, adminSecondaryNavItems } from "@/lib/cms";
import { filterAdminNavByRole, normalizeAdminRole } from "@/lib/admin-permissions";
import { ArrowLeft, Bell, Search } from "lucide-react";
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

  if (currentPath.startsWith("/admin/login")) {
    return <main className="min-h-screen bg-[#f4efe1] text-[#171006]">{children}</main>;
  }
  const visibleNavItems = filterAdminNavByRole(adminNavItems, role);
  const visibleSecondaryNavItems = filterAdminNavByRole(adminSecondaryNavItems, role);

  return (
    <main className="min-h-screen bg-[#f4efe1] text-[#171006]">
      <div className="grid min-h-screen lg:grid-cols-[292px_1fr]">
        <aside className="border-r border-[#d8c38b] bg-[#120f0a] px-5 py-6 text-white">
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

          <nav className="mt-8 grid gap-2">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-sm border border-transparent px-4 py-3 text-sm font-bold text-white/76 transition hover:border-[#f4cf6a]/35 hover:bg-[#f4cf6a]/10 hover:text-white"
              >
                <item.icon size={19} className="text-[#f4cf6a]" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-9 border-t border-white/10 pt-6">
            <p className="px-4 text-xs font-black uppercase tracking-[0.18em] text-white/38">Módulos ativos</p>
            <div className="mt-4 grid gap-2">
              {visibleSecondaryNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-sm px-4 py-2 text-sm text-white/60 transition hover:bg-white/[0.055] hover:text-white"
                >
                  <item.icon size={17} className="text-white/42" />
                  <span className="flex-1">{item.label}</span>
                  <span className="text-[10px] uppercase tracking-[0.12em] text-[#f4cf6a]/70">{item.status}</span>
                </Link>
              ))}
            </div>
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
