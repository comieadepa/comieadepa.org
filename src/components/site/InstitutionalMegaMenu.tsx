"use client";

import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  FileStack,
  FileText,
  FolderOpen,
  HelpCircle,
  Image as ImageIcon,
  Landmark,
  Mail,
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

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const CLOSE_ANIMATION_MS = 220;

export function InstitutionalMegaMenu({ contactHref, eventsPortalUrl, ministerPortalUrl, onClose, open }: InstitutionalMegaMenuProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  const sections = useMemo<MenuSection[]>(
    () => [
      {
        title: "Institucional",
        items: [
          { label: "Quem Somos", href: "/paginas/quem-somos", icon: Building2 },
          { label: "Mesa Diretora", href: "/paginas/mesa-diretora", icon: Users },
          { label: "Diretoria", href: "/paginas/diretoria", icon: BriefcaseBusiness },
          { label: "Estatuto", href: "/documentos", icon: FileText },
          { label: "Regimento Interno", href: "/documentos", icon: Scale },
          { label: "Departamentos", href: "/departamentos", icon: Landmark },
        ],
      },
      {
        title: "Conteúdos",
        items: [
          { label: "Notícias", href: "/noticias", icon: Newspaper },
          { label: "Vídeos", href: "/videos", icon: PlaySquare },
          { label: "Galeria de Fotos", href: "/galeria", icon: ImageIcon },
          { label: "Documentos", href: "/documentos", icon: FolderOpen },
          { label: "FAQ", href: "/paginas", icon: HelpCircle },
        ],
      },
      {
        title: "Eventos e Serviços",
        items: [
          { label: "Eventos", href: eventsPortalUrl || "/#eventos", icon: CalendarDays, external: true },
          { label: "Área do Ministro", href: ministerPortalUrl || "/paginas", icon: ShieldCheck, external: true },
          { label: "Contato", href: contactHref || "/#contato", icon: Mail },
          { label: "Privacidade", href: "/privacidade", icon: FileStack },
          { label: "Termos de Uso", href: "/termos", icon: FileText },
        ],
      },
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
    <div
      className={`fixed inset-0 z-[120] transition duration-200 ${visible ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-[#071a2d]/88 backdrop-blur-md transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      <div className="absolute inset-0 overflow-y-auto">
        <div className="flex min-h-full items-start justify-center px-4 py-6 sm:px-6 lg:px-10 lg:py-8" onClick={onClose}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu institucional"
            className={`relative w-full max-w-7xl border border-white/10 bg-[#0F2D4A] text-white shadow-[0_30px_90px_rgba(0,0,0,.35)] transition-all duration-200 ${
              visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8 sm:py-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="relative grid h-12 w-12 place-items-center">
                  <Image src="/assets/logo-comieadepa.png" alt="Brasão COMIEADEPA" width={48} height={48} className="object-contain" />
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#D4A24C]">COMIEADEPA</p>
                  <h2 className="mt-1 font-serif text-2xl font-black sm:text-3xl">Institucional</h2>
                </div>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="grid h-11 w-11 place-items-center border border-white/14 bg-white/5 text-white transition hover:bg-white/10"
                aria-label="Fechar menu institucional"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-8 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-3 lg:gap-10 lg:px-10 lg:py-10">
              {sections.map((section) => (
                <section key={section.title}>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#D4A24C]">{section.title}</p>
                  <div className="mt-5 grid gap-2">
                    {section.items.map((item) => (
                      <MenuLink key={`${section.title}-${item.label}`} item={item} onClose={onClose} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuLink({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const Icon = item.icon;
  const content = (
    <>
      <Icon size={16} className="mt-0.5 shrink-0 text-[#D4A24C]" />
      <span>{item.label}</span>
    </>
  );

  const className =
    "flex items-start gap-3 border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/88 transition hover:border-[#D4A24C]/40 hover:bg-white/[0.06] hover:text-white";

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
