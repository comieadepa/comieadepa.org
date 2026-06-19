"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef } from "react";

type HeroAlignment = "left" | "center" | "right";

export type InstitutionalHeroProps = {
  /** Título principal */
  title: string;
  /** Subtítulo exibido abaixo do título em itálico */
  subtitle?: string | null;
  /** Descrição curta exibida abaixo do subtítulo */
  description?: string | null;
  /** URL da imagem de fundo */
  backgroundImage?: string | null;
  /** Opacidade do overlay escuro (0–1). Padrão: 0.5 */
  overlayOpacity?: number | null;
  /** Badge opcional exibido acima do título (ex: "INSTITUCIONAL", "PRESIDENTE") */
  badge?: string | null;
  /** Alinhamento do conteúdo: left | center | right. Padrão: left */
  alignment?: HeroAlignment | null;
  /** Breadcrumb link de volta */
  backHref?: string;
  backLabel?: string;
};

const alignClass: Record<HeroAlignment, string> = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
};

export function InstitutionalHero({
  title,
  subtitle,
  description,
  backgroundImage,
  overlayOpacity,
  badge,
  alignment,
  backHref = "/",
  backLabel = "Voltar ao portal",
}: InstitutionalHeroProps) {
  const align: HeroAlignment = alignment && ["left", "center", "right"].includes(alignment)
    ? (alignment as HeroAlignment)
    : "left";

  const opacity = typeof overlayOpacity === "number"
    ? Math.min(1, Math.max(0, overlayOpacity))
    : 0.5;

  // Parallax ref
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bgRef.current;
    if (!el || !backgroundImage) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const ratio = Math.max(0, rect.top / window.innerHeight);
      el.style.transform = `translateY(${ratio * 30}px)`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [backgroundImage]);

  return (
    <header
      className="institutional-hero relative overflow-hidden"
      style={{ minHeight: "420px", maxHeight: "520px", height: "50vw" }}
    >
      {/* Background image with parallax */}
      {backgroundImage ? (
        <div
          ref={bgRef}
          className="absolute inset-0 scale-110 transition-transform duration-100 ease-linear will-change-transform"
        >
          <Image
            src={backgroundImage}
            alt={title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      ) : (
        /* Fallback gradient */
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F3B63] via-[#1a5fa0] to-[#0a2640]" />
      )}

      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-[#05101f]"
        style={{ opacity }}
      />

      {/* Gold bottom gradient accent */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[#B8872D] to-transparent opacity-60" />

      {/* Subtle grain texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')] bg-repeat" />

      {/* Content */}
      <div
        className={`institutional-hero__content relative z-10 mx-auto flex h-full max-w-5xl flex-col justify-end px-5 pb-14 pt-10 sm:px-8 sm:pb-16 fade-in-hero ${alignClass[align]}`}
      >
        {/* Breadcrumb */}
        <div className={`mb-8 ${align === "center" ? "flex justify-center" : align === "right" ? "flex justify-end" : ""}`}>
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-white/60 transition hover:text-[#f4cf6a]"
          >
            <ArrowLeft size={14} />
            {backLabel}
          </Link>
        </div>

        {/* Badge */}
        {badge && (
          <div
            className={`mb-4 ${align === "center" ? "flex justify-center" : align === "right" ? "flex justify-end" : ""}`}
          >
            <span className="inline-flex items-center border border-[#B8872D]/60 bg-[#B8872D]/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#f4cf6a] backdrop-blur-sm">
              {badge}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="font-serif text-4xl font-black leading-[1.04] text-white drop-shadow-lg sm:text-5xl lg:text-6xl max-w-3xl">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="mt-4 max-w-2xl font-serif text-xl italic leading-8 text-[#f4cf6a]/90 sm:text-2xl">
            {subtitle}
          </p>
        )}

        {/* Description */}
        {description && (
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
            {description}
          </p>
        )}

        {/* Bottom gold separator */}
        <div className={`mt-8 h-px w-20 bg-[#B8872D] ${align === "center" ? "mx-auto" : align === "right" ? "ml-auto" : ""}`} />
      </div>

      {/* Inline animation styles */}
      <style>{`
        .fade-in-hero {
          animation: heroFadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .fade-in-hero { animation: none; }
        }
      `}</style>
    </header>
  );
}
