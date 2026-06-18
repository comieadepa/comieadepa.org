"use client";

import {
  CalendarDays,
  ChevronRight,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Landmark,
  Newspaper,
  PlaySquare,
  Scale,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type InstitutionalMegaMenuProps = {
  contactHref: string;
  eventsPortalUrl: string;
  ministerPortalUrl: string;
  onClose: () => void;
  open: boolean;
};

type MenuItem = {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  external?: boolean;
};

const CLOSE_ANIMATION_MS = 220;

export function InstitutionalMegaMenu({ contactHref, eventsPortalUrl, ministerPortalUrl, onClose, open }: InstitutionalMegaMenuProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  const institutionalLinks = useMemo<MenuItem[]>(
    () => [
      { label: "COMIEADEPA - Quem Somos", href: "/paginas/quem-somos", icon: Landmark },
      { label: "Mesa Diretora", href: "/paginas/mesa-diretora", icon: Users },
      { label: "Conselhos e Comissões", href: "/paginas/conselhos-e-comissoes", icon: Users },
      { label: "Estatuto", href: "/documentos", icon: FileText },
      { label: "Regimento Interno", href: "/documentos", icon: Scale },
      { label: "Declaração de Fé", href: "/paginas/declaracao-de-fe", icon: ShieldCheck },
      { label: "Departamentos", href: "/departamentos", icon: Landmark },
    ],
    [],
  );

  const featuredLinks = useMemo<MenuItem[]>(
    () => [
      { label: "Documentos Oficiais", href: "/documentos", icon: FolderOpen },
      { label: "Galeria de Fotos", href: "/galeria", icon: ImageIcon },
      { label: "Notícias", href: "/noticias", icon: Newspaper },
      { label: "Vídeos", href: "/videos", icon: PlaySquare },
      { label: "Eventos", href: eventsPortalUrl || "/#eventos", icon: CalendarDays, external: true },
      { label: "Área do Ministro", href: ministerPortalUrl || "/paginas", icon: ShieldCheck, external: true },
      { label: "Contato", href: contactHref || "/#contato", icon: Users },
    ],
    [contactHref, eventsPortalUrl, ministerPortalUrl],
  );

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = window.requestAnimationFrame(() => setVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timer = window.setTimeout(() => setMounted(false), CLOSE_ANIMATION_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!mounted) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-[120] transition duration-200 ${visible ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-[#071a2d]/94 backdrop-blur-sm transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      <div className="absolute inset-0 overflow-y-auto">
        <div className="min-h-full px-5 py-6 sm:px-8 lg:px-12 lg:py-8" onClick={onClose}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu COMIEADEPA"
            className={`mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col transition-all duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-end py-2">
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                aria-label="Fechar menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-1 items-center">
              <div className="grid w-full gap-12 py-6 lg:grid-cols-[1.1fr_1fr_.9fr] lg:gap-16">
                <section>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#D4A24C]">Institucional</p>
                  <h2 className="mt-4 font-serif text-4xl font-black leading-tight text-white sm:text-5xl">A COMIEADEPA</h2>
                  <div className="mt-8 grid gap-3">
                    {institutionalLinks.map((item) => (
                      <MegaMenuLink key={item.label} item={item} onClose={onClose} />
                    ))}
                  </div>
                </section>

                <section className="lg:pt-14">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#D4A24C]">Portal COMIEADEPA</p>
                  <p className="mt-5 max-w-md text-lg leading-8 text-white/76">
                    Acesse informações institucionais, documentos oficiais, notícias, eventos e serviços da Convenção.
                  </p>
                  <div className="mt-8 grid gap-3">
                    {featuredLinks.map((item) => (
                      <MegaMenuLink key={item.label} item={item} onClose={onClose} />
                    ))}
                  </div>
                </section>

                <section className="flex items-center justify-center lg:justify-end">
                  <div className="flex flex-col items-center text-center lg:items-end lg:text-right">
                    <span className="relative block h-48 w-48 sm:h-56 sm:w-56 lg:h-72 lg:w-72">
                      <Image src="/assets/logo-comieadepa.png" alt="Brasão COMIEADEPA" fill className="object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,.28)]" />
                    </span>
                    <p className="mt-6 text-xs font-black uppercase tracking-[0.28em] text-[#D4A24C]">Desde 1921</p>
                    <p className="mt-3 max-w-xs text-sm leading-7 text-white/58">Portal institucional da primeira convenção assembleiana do Brasil.</p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MegaMenuLink({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const Icon = item.icon;
  const className = "group flex items-center gap-3 py-1 text-base text-white/82 transition hover:text-white";

  const content = (
    <>
      <Icon size={15} className="shrink-0 text-[#D4A24C]" />
      <span>{item.label}</span>
      <ChevronRight size={15} className="ml-auto shrink-0 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
    </>
  );

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noreferrer" onClick={onClose} className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={item.href} onClick={onClose} className={className}>
      {content}
    </Link>
  );
}
