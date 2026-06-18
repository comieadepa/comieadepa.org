"use client";

import { usePathname } from "next/navigation";

const webmailUrl = "https://sh-pro126.hostgator.com.br:2096/";

const primaryNavItems = [
  { label: "A COMIEADEPA", type: "mega-menu" as const },
  { label: "Eventos", type: "anchor" as const },
  { label: "Notícias", type: "anchor" as const },
  { label: "Departamentos", type: "anchor" as const },
];

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
      {primaryNavItems.map((item) =>
        item.type === "mega-menu" ? (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              onNavigate?.();
              onOpenInstitutionalMenu();
            }}
            className={mobile ? "text-left" : "relative py-2 transition hover:text-[#1D5A8C]"}
          >
            {item.label}
          </button>
        ) : (
          <a
            key={item.label}
            href={`${homePrefix}#${slugify(item.label)}`}
            onClick={onNavigate}
            className={mobile ? undefined : "relative py-2 transition hover:text-[#1D5A8C]"}
          >
            {item.label}
          </a>
        ),
      )}

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
