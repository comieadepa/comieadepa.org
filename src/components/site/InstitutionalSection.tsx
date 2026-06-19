import type { ReactNode, CSSProperties } from "react";

interface InstitutionalSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  style?: CSSProperties;
}

export function InstitutionalSection({ children, className = "", id, style }: InstitutionalSectionProps) {
  return (
    <section id={id} style={style} className={`mx-auto max-w-6xl px-5 py-12 sm:px-8 md:py-16 ${className}`}>
      {children}
    </section>
  );
}
