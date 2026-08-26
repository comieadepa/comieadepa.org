"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { InstitutionalMegaMenu } from "./InstitutionalMegaMenu";
import { Navigation } from "./Navigation";

type HeaderProps = {
  eventsPortalUrl: string;
  ministerPortalUrl: string;
};

export function Header({ eventsPortalUrl, ministerPortalUrl }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [institutionalMenuOpen, setInstitutionalMenuOpen] = useState(false);
  const pathname = usePathname();
  const contactHref = pathname === "/" ? "#contato" : "/#contato";
  const targetMinisterUrl = ministerPortalUrl || "https://www.siscomieadepa.org/portal-ministro/login";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#0F3B63]/10 bg-white/92 shadow-[0_10px_32px_rgba(15,59,99,.08)] backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href={pathname === "/" ? "#" : "/"} className="group flex items-center gap-3">
            <span className="relative grid h-12 w-12 place-items-center overflow-visible">
              <Image src="/assets/logo-comieadepa.png" alt="Brasão COMIEADEPA" width={48} height={48} className="object-contain drop-shadow-[0_0_18px_rgba(15,59,99,.18)]" />
            </span>
            <span className="leading-tight">
              <span className="block font-serif text-2xl font-bold text-[#0F3B63]">COMIEADEPA</span>
              <span className="block text-xs uppercase tracking-[0.24em] text-[#D4A24C]">Desde 1921</span>
            </span>
          </Link>

          <Navigation onOpenInstitutionalMenu={() => setInstitutionalMenuOpen(true)} />

          <a
            href={targetMinisterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-lg bg-[#0F3B63] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] !text-white shadow-[0_16px_34px_rgba(15,59,99,.20)] transition hover:-translate-y-0.5 hover:bg-[#4A86B8] hover:!text-white lg:inline-flex"
          >
            Área do Ministro
          </a>

          <button
            type="button"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
            className="grid h-11 w-11 place-items-center rounded-lg border border-[#0F3B63]/15 bg-[#F4F6F8] text-[#0F3B63] lg:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-[#0F3B63]/10 bg-white px-5 py-5 shadow-[0_20px_50px_rgba(15,59,99,.10)] lg:hidden">
            <Navigation
              mobile
              onNavigate={() => setMenuOpen(false)}
              onOpenInstitutionalMenu={() => {
                setMenuOpen(false);
                setInstitutionalMenuOpen(true);
              }}
            />
            <div className="mx-auto mt-4 max-w-7xl">
              <a
                href={targetMinisterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg bg-[#0F3B63] px-4 py-3 text-center text-sm font-black uppercase !text-white hover:!text-white"
              >
                Área do Ministro
              </a>
            </div>
          </div>
        ) : null}
      </header>

      <InstitutionalMegaMenu
        open={institutionalMenuOpen}
        onClose={() => setInstitutionalMenuOpen(false)}
        ministerPortalUrl={targetMinisterUrl}
        eventsPortalUrl={eventsPortalUrl}
        contactHref={contactHref}
      />
    </>
  );
}
