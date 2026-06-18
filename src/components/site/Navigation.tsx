"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = ["A COMIEADEPA", "Presidência", "Eventos", "Notícias", "Departamentos", "Contato"];
const webmailUrl = "https://sh-pro126.hostgator.com.br:2096/";

type NavigationProps = {
  mobile?: boolean;
  onNavigate?: () => void;
};

export function Navigation({ mobile = false, onNavigate }: NavigationProps) {
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
      <Link href="/paginas" onClick={onNavigate} className={mobile ? undefined : "relative py-2 transition hover:text-[#1D5A8C]"}>
        Institucional
      </Link>
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
