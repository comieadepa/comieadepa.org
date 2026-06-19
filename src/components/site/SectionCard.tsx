import type { ReactNode } from "react";
import Link from "next/link";

export interface SectionCardProps {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  target?: string;
  rel?: string;
}

export function SectionCard({
  children,
  className = "",
  href,
  onClick,
  target,
  rel,
}: SectionCardProps) {
  // Shared base card classes (border, border-radius, background, shadows, transitions, hover translation, etc.)
  const cardClasses = `
    group block flex flex-col justify-between 
    rounded-xl border border-[#0F3B63]/10 bg-[#F4F6F8] p-6 
    shadow-[0_18px_50px_rgba(15,59,99,.08)] 
    transition-all duration-300 ease-out 
    hover:-translate-y-1 hover:border-[#D4A24C]/60 hover:bg-white 
    hover:shadow-[0_24px_60px_rgba(15,59,99,.14)] 
    ${className}
  `.trim();

  if (href) {
    if (href.startsWith("http") || target === "_blank") {
      return (
        <a
          href={href}
          className={cardClasses}
          target={target}
          rel={rel ?? (target === "_blank" ? "noreferrer" : undefined)}
          onClick={onClick}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={cardClasses} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
}
