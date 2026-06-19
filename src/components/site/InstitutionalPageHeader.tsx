import Link from "next/link";

interface InstitutionalPageHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
}

export function InstitutionalPageHeader({ badge, title, subtitle }: InstitutionalPageHeaderProps) {
  return (
    <section className="relative overflow-hidden bg-[#0F3B63] py-16 text-white md:py-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,59,99,0.98)_0%,rgba(29,90,140,0.88)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(212,162,76,0.12),transparent_50%)]" />
      <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(135deg,#fff_1px,transparent_1px)] [background-size:38px_38px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        <Link
          href="/"
          className="text-xs font-black uppercase tracking-[0.2em] text-[#F8D77B] transition hover:text-white"
        >
          COMIEADEPA
        </Link>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            {badge && (
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-[#F8D77B] sm:text-xs">
                {badge}
              </p>
            )}
            <h1 className="font-serif text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-sm leading-relaxed text-white/80 border-l border-white/20 pl-5 sm:text-base lg:border-l-2">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
