"use client";

import { ArrowRight, ExternalLink, ImageIcon, Sparkles } from "lucide-react";
import Image from "next/image";

export type HeroSlideData = {
  dataLabel?: string | null;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  buttonText?: string | null;
  buttonUrl?: string | null;
  openInNewTab?: boolean;
};

type HeroSlideCanvasProps = {
  slide: HeroSlideData;
  secondaryButtonUrl?: string;
  secondaryButtonLabel?: string;
  isPreview?: boolean;
};

export function HeroSlideCanvas({
  slide,
  secondaryButtonUrl = "https://eventos.siscomieadepa.org/eventos-publicos",
  secondaryButtonLabel = "Eventos Oficiais",
  isPreview = false,
}: HeroSlideCanvasProps) {
  const hasImage = Boolean(slide.imageUrl && slide.imageUrl.trim().length > 0);

  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#071c30]">
      {/* 1. Imagem de Fundo (100% no canvas 16:9, sem corte da arte 1920x1080) */}
      {hasImage ? (
        <Image
          src={slide.imageUrl!}
          alt={slide.title || "Hero Banner"}
          fill
          priority={!isPreview}
          className="object-cover object-center"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30">
          <ImageIcon size={48} className="stroke-1" />
          <span className="mt-2 text-xs font-bold uppercase tracking-wider">Aguardando banner (16:9)...</span>
        </div>
      )}

      {/* 2. Gradiente Vertical no Rodapé: Preserva 50–60% superiores da foto limpos e cria faixa escura profunda de alto contraste (#030c17) na base */}
      <div className="absolute inset-x-0 bottom-0 h-[68%] sm:h-[58%] lg:h-[52%] bg-[linear-gradient(0deg,#030c17_0%,rgba(4,14,26,0.98)_25%,rgba(7,28,48,0.85)_48%,rgba(15,59,99,0.38)_72%,rgba(15,59,99,0.06)_88%,transparent_100%)] pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#030c17] to-transparent pointer-events-none z-10" />
      <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(135deg,#fff_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

      {/* 3. Faixa Editorial Inferior Ancorada na Base com Z-Index Alto (z-30) e Espaçamento Seguro */}
      <div className="absolute inset-x-0 bottom-0 z-30 w-full min-w-0 px-5 sm:px-8 md:px-10 lg:px-14 pb-6 sm:pb-8 md:pb-10 lg:pb-12 pt-12">
        <div className="w-full min-w-0 max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 sm:gap-5 lg:gap-8">
          {/* Bloco Textual */}
          <div className="w-full min-w-0 flex-1 space-y-1.5 sm:space-y-2 lg:space-y-2.5">
            {slide.dataLabel ? (
              <div className="inline-flex items-center gap-1.5 rounded-md border border-[#D4A24C]/60 bg-white/12 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-[#F8D77B] shadow-sm backdrop-blur-md">
                <Sparkles size={12} className="shrink-0 text-[#F8D77B]" />
                <span className="truncate">{slide.dataLabel}</span>
              </div>
            ) : null}

            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-[2.2rem] font-black leading-[1.05] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] line-clamp-2">
              {slide.title || "Título do Slide"}
            </h2>

            {slide.subtitle ? (
              <p className="font-semibold text-xs sm:text-sm md:text-base lg:text-lg text-[#F8D77B] drop-shadow-sm leading-snug line-clamp-1">
                {slide.subtitle}
              </p>
            ) : null}

            {slide.description ? (
              <p className="hidden sm:block text-[11px] sm:text-xs md:text-sm leading-relaxed text-white/90 drop-shadow-sm line-clamp-2 max-w-2xl">
                {slide.description}
              </p>
            ) : null}
          </div>

          {/* Bloco de Ações (CTA) — Destaque visual total à frente dos demais elementos com tamanho ampliado */}
          <div className="shrink-0 max-w-full flex flex-wrap items-center gap-3 sm:gap-3.5 pt-1 lg:pt-0 lg:pb-1">
            {slide.buttonText ? (
              isPreview ? (
                <div className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#D4A24C] via-[#DFB15B] to-[#C2903B] px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm md:text-base font-black uppercase tracking-[0.14em] text-[#051423] shadow-[0_6px_22px_rgba(212,162,76,0.5)] whitespace-nowrap">
                  <span>{slide.buttonText}</span>
                  <ArrowRight size={17} className="shrink-0" />
                  {slide.openInNewTab && <ExternalLink size={13} className="shrink-0 opacity-75" />}
                </div>
              ) : (
                <a
                  href={slide.buttonUrl || "#"}
                  target={slide.openInNewTab ? "_blank" : undefined}
                  rel={slide.openInNewTab ? "noreferrer" : undefined}
                  className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#D4A24C] via-[#DFB15B] to-[#C2903B] px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm md:text-base font-black uppercase tracking-[0.14em] text-[#051423] shadow-[0_6px_22px_rgba(212,162,76,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(212,162,76,0.7)] whitespace-nowrap"
                >
                  <span>{slide.buttonText}</span>
                  <ArrowRight size={17} className="shrink-0 transition group-hover:translate-x-1" />
                </a>
              )
            ) : null}

            {secondaryButtonLabel ? (
              isPreview ? (
                <div className="hidden sm:inline-flex items-center rounded-xl border border-white/30 bg-[#0F3B63]/90 px-5 sm:px-7 py-3.5 sm:py-4 text-xs sm:text-sm md:text-base font-black uppercase tracking-[0.12em] text-white shadow-md backdrop-blur-md whitespace-nowrap">
                  {secondaryButtonLabel}
                </div>
              ) : (
                <a
                  href={secondaryButtonUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:inline-flex items-center justify-center rounded-xl border border-white/30 bg-[#0F3B63]/90 px-5 sm:px-7 py-3.5 sm:py-4 text-xs sm:text-sm md:text-base font-black uppercase tracking-[0.12em] !text-white shadow-md backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#D4A24C] hover:bg-[#1D5A8C] whitespace-nowrap"
                >
                  {secondaryButtonLabel}
                </a>
              )
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}