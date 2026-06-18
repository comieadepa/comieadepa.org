"use client";

import { usePathname } from "next/navigation";

const navItems = ["A COMIEADEPA", "Eventos", "Notícias", "Departamentos"];
const webmailUrl = "https://sh-pro126.hostgator.com.br:2096/";

type NavigationProps = {
  mobile?: boolean;
  onNavigate?: () => void;
  onOpenInstitutionalMenu: () => void;
};

export function Navigation({ mobile = false, onNavigate, onOpenInstitutionalMenu }: NavigationProps) {
  const pathname = usePathname();
  const homePrefix = pathname === "/" ? "" : "/";

  return (
    <nav className={mobile ? "mx-auto flex max-w-7xl flex-col gap-4 text-sm font-semibold text-[#1F2937]" : "hidden items-center gap-7 text-sm font-semibold text-[#1F2937]/74 lg:flex"}>
      {navItems.map((item) => (
        <a
          key={item}
          href={`${homePrefix}#${slugify(item)}`}
          onClick={onNavigate}
          className={mobile ? undefined : "relative py-2 transition hover:text-[#1D5A8C]"}
        >
          {item}
        </a>
      ))}

      <button
        type="button"
        onClick={() => {
          onNavigate?.();
          onOpenInstitutionalMenu();
        }}
        className={mobile ? "text-left" : "relative py-2 transition hover:text-[#1D5A8C]"}
      >
        Institucional
      </button>

      <a
        href={webmailUrl}
        target="_blank"
        rel="noreferrer"
        onClick={onNavigate}
        className={mobile ? undefined : "relative py-2 transition hover:text-[#1D5A8C]"}
      >
        Webmail
      </a>
    </nav>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}
