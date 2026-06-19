/**
 * SectionPageHeader — shared hero section for all public listing/index pages.
 * Renders the full-width navy hero with badge, title, description and an
 * optional back-link breadcrumb. Matches the pattern used in
 * Documentos, Galeria, Notícias, Vídeos etc.
 *
 * @param badge      Small uppercase label above the title (e.g. "DOCUMENTOS")
 * @param title      Page title rendered as <h1>
 * @param description Longer description rendered in the right column
 * @param backHref   Optional breadcrumb href (defaults to "/")
 * @param backLabel  Optional breadcrumb text (defaults to "COMIEADEPA")
 * @param icon       Optional ReactNode icon to prefix the badge
 */
import Link from "next/link";
import type { ReactNode } from "react";

export interface SectionPageHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  icon?: ReactNode;
}

export function SectionPageHeader({
  badge,
  title,
  description,
  backHref = "/",
  backLabel = "COMIEADEPA",
  icon,
}: SectionPageHeaderProps) {
  return (
    <section className="relative overflow-hidden bg-[#0F3B63] py-20 text-white md:py-24">
      {/* Layered backgrounds */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,59,99,0.98)_0%,rgba(29,90,140,0.88)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(212,162,76,0.15),transparent_50%)]" />
      <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(135deg,#fff_1px,transparent_1px)] [background-size:38px_38px]" />
      {/* Gold bottom accent */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#B8872D]/60 to-transparent" />

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        {/* Breadcrumb */}
        <Link
          href={backHref}
          className="text-xs font-black uppercase tracking-[0.2em] text-[#F8D77B] transition hover:text-white"
        >
          {backLabel}
        </Link>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            {badge && (
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-[#F8D77B]">
                {icon && <span className="opacity-80">{icon}</span>}
                {badge}
              </p>
            )}
            <h1 className="mt-4 font-serif text-5xl font-black leading-[1.04] text-white sm:text-7xl">
              {title}
            </h1>
          </div>
          {description && (
            <p className="border-l border-white/20 pl-6 text-lg leading-8 text-white/80 lg:border-l-2">
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
