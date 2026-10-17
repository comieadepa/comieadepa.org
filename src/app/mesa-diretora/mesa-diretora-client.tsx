"use client";

import Image from "next/image";
import Link from "next/link";
import { Users } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";

// ──────────────────────────────────────────────────────────────────────────────
// TIPOS
// ──────────────────────────────────────────────────────────────────────────────

export type BoardGroup = {
  id: string;
  nome: string;
  slug?: string | null;
  subtitulo?: string | null;
  descricao?: string | null;
  bg_image_url?: string | null;
  title_color?: string | null;
  layout: "hero" | "center" | "grid2" | "grid3" | "grid4" | "grid5" | "grid6" | "conselho_fiscal";
};

export type BoardMember = {
  nome: string;
  cargo: string;
  grupo_id?: string | null;
  grupo?: string | null;
  subgrupo?: string | null; // 'titular' | 'suplente'
  campo?: string;
  foto: string;
  ordem: number;
};

interface MesaDiretoraClientProps {
  groups: BoardGroup[];
  boardMembers: BoardMember[];
  isDemoData?: boolean;
}


// ──────────────────────────────────────────────────────────────────────────────
// COMPONENTE: FOTO DO DIRIGENTE (com fallback elegante)
// ──────────────────────────────────────────────────────────────────────────────

function MemberPhoto({
  src,
  alt,
  priority = false,
  size = "md",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  size?: "lg" | "md" | "sm";
}) {
  const hasPhoto = Boolean(src && src.trim().length > 0 && !src.includes("placeholder"));

  if (!hasPhoto) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#0F3B63]/8 to-[#0F3B63]/4">
        <Users
          size={size === "lg" ? 56 : size === "md" ? 40 : 28}
          className="text-[#0F3B63]/25"
          strokeWidth={1}
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      className="object-cover object-top"
      unoptimized
    />
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// COMPONENTE: CARD — PRESIDENTE (card grande, horizontal)
// ──────────────────────────────────────────────────────────────────────────────

function CardPresidente({ member }: { member: BoardMember }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl overflow-hidden rounded-sm border border-[#C9993B]/30 bg-white shadow-[0_8px_40px_rgba(15,59,99,0.14)]">
      {/* Foto lado esquerdo */}
      <div className="relative hidden w-56 shrink-0 overflow-hidden bg-[#E8EDF2] sm:block lg:w-64">
        {/* marca d'água discreta */}
        <div
          className="absolute inset-0 opacity-[0.04] bg-center bg-no-repeat bg-contain pointer-events-none"
          style={{ backgroundImage: "url('/assets/logo-comieadepa.png')" }}
          aria-hidden
        />
        <MemberPhoto src={member.foto} alt={member.nome} priority size="lg" />
        {/* gradiente inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0F3B63]/60 to-transparent" />
      </div>

      {/* Conteúdo lado direito */}
      <div className="flex flex-1 flex-col justify-center px-6 py-7 sm:px-8">
        {/* Badge de função */}
        <span className="inline-block w-fit rounded-sm bg-[#FDF6E3] px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#C9993B] border border-[#C9993B]/30">
          {member.cargo || "Presidente"}
        </span>

        {/* Foto mobile (aparece só em telas pequenas) */}
        <div className="relative mx-auto mt-4 h-40 w-36 shrink-0 overflow-hidden rounded-sm border border-[#C9993B]/20 bg-[#E8EDF2] sm:hidden">
          <MemberPhoto src={member.foto} alt={member.nome} priority size="lg" />
        </div>

        {/* Nome */}
        <h3 className="mt-4 font-serif text-2xl font-black leading-tight text-[#0F3B63] sm:text-3xl lg:text-4xl">
          {member.nome}
        </h3>

        {/* Cargo destaque */}
        <div className="mt-4 flex items-center gap-4">
          {member.campo && (
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
              {member.campo}
            </span>
          )}
        </div>

        {/* Divisor decorativo */}
        <div className="mt-5 h-[2px] w-16 rounded-full bg-gradient-to-r from-[#C9993B] to-[#F4CF6A]" />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// COMPONENTE: CARD — DIRIGENTE PADRÃO (retrato + faixa + nome)
// ──────────────────────────────────────────────────────────────────────────────

function CardDirigente({
  member,
  delay = 0,
  showSubgrupo = false,
}: {
  member: BoardMember;
  delay?: number;
  showSubgrupo?: boolean;
}) {
  return (
    <div
      className="group relative w-full max-w-[175px] sm:max-w-[185px] md:max-w-[195px] overflow-hidden rounded-sm border border-[#C9993B]/20 bg-white shadow-[0_4px_20px_rgba(15,59,99,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(15,59,99,0.14)]"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Marca-d'água discreta do brasão */}
      <div
        className="absolute inset-0 opacity-[0.025] bg-center bg-no-repeat bg-contain pointer-events-none z-10"
        style={{ backgroundImage: "url('/assets/logo-comieadepa.png')" }}
        aria-hidden
      />

      {/* Foto */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-b from-[#E8EDF2] to-[#D0D8E2]">
        <MemberPhoto src={member.foto} alt={member.nome} size="md" />
        {/* Gradiente inferior sobre a foto */}
        <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-[#0F3B63]/90 via-[#0F3B63]/60 to-transparent z-20 pointer-events-none" />
        {/* Cargo na faixa sobre a foto (parte inferior) */}
        <div className="absolute bottom-0 left-0 right-0 z-30 px-2 pb-2 text-center">
          <span className="text-[9px] font-black uppercase tracking-[0.16em] text-[#F4CF6A] drop-shadow-sm leading-tight line-clamp-2">
            {member.cargo}
          </span>
        </div>
      </div>

      {/* Nome */}
      <div className="relative z-10 border-t border-[#C9993B]/20 bg-white px-2.5 py-3 text-center">
        {showSubgrupo && member.subgrupo && (
          <span className="mb-1 block text-[8px] font-black uppercase tracking-[0.18em] text-[#C9993B]">
            {member.subgrupo === "titular" ? "Titular" : "Suplente"}
          </span>
        )}
        <h3 className="font-serif text-[13px] font-bold leading-snug text-[#0F3B63] group-hover:text-[#1A5A96] transition-colors line-clamp-2">
          {member.nome}
        </h3>
        {member.campo && (
          <p className="mt-0.5 text-[10px] font-medium text-[#9CA3AF] truncate">{member.campo}</p>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// COMPONENTE: SEPARADOR DE SEÇÃO (linha divisória dourada com título)
// ──────────────────────────────────────────────────────────────────────────────

function SectionDivider({ title, subtitle }: { title: string; subtitle?: string | null }) {
  return (
    <div className="mb-8 text-center">
      <div className="flex items-center gap-3 justify-center mb-3">
        <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent via-[#C9993B]/50 to-[#C9993B]" />
        <h2 className="font-serif text-base font-black uppercase tracking-[0.24em] text-[#0F3B63]">
          {title}
        </h2>
        <div className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent via-[#C9993B]/50 to-[#C9993B]" />
      </div>
      {subtitle && (
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">{subtitle}</p>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// COMPONENTE: GRID ADAPTÁVEL POR LAYOUT
// ──────────────────────────────────────────────────────────────────────────────

function MembersGrid({ members, layout }: { members: BoardMember[]; layout: BoardGroup["layout"] }) {
  const isConselhoFiscal = layout === "conselho_fiscal";

  if (isConselhoFiscal) {
    const titulares = members.filter((m) => m.subgrupo === "titular" || (!m.subgrupo && m.ordem <= 3));
    const suplentes = members.filter((m) => m.subgrupo === "suplente" || (!m.subgrupo && m.ordem > 3));

    return (
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
        {/* Titulares */}
        {titulares.length > 0 && (
          <div className="flex flex-col items-center">
            <div className="mb-4 flex items-center gap-2 self-start sm:self-center">
              <span className="h-4 w-1 rounded-full bg-[#0F3B63]" />
              <span className="text-xs font-black uppercase tracking-[0.22em] text-[#0F3B63]">Titulares</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-5 w-full">
              {titulares.map((m, i) => (
                <CardDirigente key={m.nome + m.ordem} member={m} delay={i * 60} showSubgrupo={false} />
              ))}
            </div>
          </div>
        )}

        {/* Suplentes */}
        {suplentes.length > 0 && (
          <div className="flex flex-col items-center">
            <div className="mb-4 flex items-center gap-2 self-start sm:self-center">
              <span className="h-4 w-1 rounded-full bg-[#C9993B]" />
              <span className="text-xs font-black uppercase tracking-[0.22em] text-[#C9993B]">Suplentes</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-5 w-full">
              {suplentes.map((m, i) => (
                <CardDirigente key={m.nome + m.ordem} member={m} delay={i * 60} showSubgrupo={false} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 w-full max-w-6xl mx-auto">
      {members.map((m, i) => (
        <CardDirigente key={m.nome + m.ordem} member={m} delay={i * 60} />
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// COMPONENTE: BANNER HERO INSTITUCIONAL
// ──────────────────────────────────────────────────────────────────────────────

function HeroBanner() {
  return (
    <section className="relative overflow-hidden pt-20" aria-label="Mesa Diretora — Cabeçalho">
      {/* Fundo: imagem da sede */}
      <div className="absolute inset-0">
        <Image
          src="/assets/sede-aerea-comieadepa.jpg"
          alt="Sede da COMIEADEPA"
          fill
          priority
          className="object-cover object-center"
          unoptimized
        />
        {/* Overlay azul-marinho + dourado diagonal */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A2744]/95 via-[#0F3B63]/88 to-[#0F3B63]/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#F8F4EC]/20" />
        {/* Faixa dourada diagonal decorativa */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(201,153,59,0.15)_0%,transparent_50%,rgba(201,153,59,0.06)_100%)] pointer-events-none" />
      </div>

      {/* Conteúdo do banner */}
      <div className="relative z-10 mx-auto flex min-h-[220px] max-w-7xl items-center gap-6 px-6 py-10 sm:min-h-[260px] sm:px-10 md:gap-10 md:px-14">
        {/* Brasão */}
        <div className="hidden shrink-0 sm:block">
          <div className="relative h-28 w-28 drop-shadow-[0_4px_20px_rgba(201,153,59,0.5)] lg:h-36 lg:w-36">
            <Image
              src="/assets/logo-comieadepa.png"
              alt="Brasão COMIEADEPA"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F4CF6A]/70">
            <Link href="/" className="hover:text-[#F4CF6A] transition-colors">Início</Link>
            <span aria-hidden>›</span>
            <span>Institucional</span>
            <span aria-hidden>›</span>
            <span className="text-[#F4CF6A]">Mesa Diretora</span>
          </nav>

          <h1 className="font-serif font-black leading-none text-white">
            <span className="block text-4xl sm:text-5xl lg:text-7xl">MESA</span>
            <span className="block text-4xl sm:text-5xl lg:text-7xl text-[#F4CF6A]">DIRETORA</span>
          </h1>

          <p className="mt-3 max-w-xl text-xs font-semibold uppercase tracking-[0.16em] leading-relaxed text-white/70 sm:text-sm">
            Convenção Interestadual de Ministros<br className="hidden sm:block" /> e Igrejas Evangélicas Assembleias de Deus no Pará
          </p>

          {/* Versículo */}
          <p className="mt-4 text-xs italic text-[#F4CF6A]/80 font-medium">
            &ldquo;Servindo à Igreja, para a Glória de Deus&rdquo; — 1 Pedro 5.2
          </p>
        </div>

        {/* Imagem da sede (direita, visível em desktop) */}
        <div className="relative hidden shrink-0 overflow-hidden rounded-sm border border-[#C9993B]/30 shadow-[0_0_32px_rgba(0,0,0,0.4)] lg:block lg:h-44 lg:w-64 xl:h-52 xl:w-80">
          <Image
            src="/assets/sede-comieadepa.png"
            alt="Sede COMIEADEPA"
            fill
            className="object-cover object-center"
            unoptimized
          />
          <div className="absolute inset-0 border border-[#C9993B]/20 rounded-sm pointer-events-none" />
        </div>
      </div>

      {/* Faixa dourada inferior */}
      <div className="relative h-2 bg-gradient-to-r from-[#7A5A1E] via-[#C9993B] to-[#F4CF6A]" />
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────────────────────────────────────

export function MesaDiretoraClient({ groups, boardMembers, isDemoData = false }: MesaDiretoraClientProps) {
  const hasGroups = groups.length > 0;
  const hasMembers = boardMembers.length > 0;

  return (
    <PublicLayout>
      <main className="min-h-screen bg-[#F8F4EC] text-[#1F2937]">
        {/* Banner hero */}
        <HeroBanner />

        {/* Aviso de dados de demonstração */}
        {isDemoData && (
          <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 text-center">
            <p className="text-xs font-semibold text-amber-700">
              ⚠️ <strong>Prévia visual com dados de demonstração.</strong> Os nomes e fotos abaixo não representam registros oficiais. Aplique a migration SQL e cadastre os dirigentes no painel administrativo para exibir os dados reais.
            </p>
          </div>
        )}

        {/* Conteúdo dos grupos */}
        {hasGroups && hasMembers ? (
          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 md:py-14 space-y-14">
            {groups.map((group) => {
              const groupMembers = boardMembers
                .filter((m) =>
                  m.grupo_id === group.id ||
                  m.grupo === group.slug ||
                  m.grupo === group.id
                )
                .sort((a, b) => a.ordem - b.ordem);

              if (groupMembers.length === 0) return null;

              return (
                <section key={group.id} aria-labelledby={`section-${group.id}`}>
                  <SectionDivider title={group.nome} subtitle={group.subtitulo} />

                  {group.layout === "hero" ? (
                    <CardPresidente member={groupMembers[0]} />
                  ) : (
                    <MembersGrid members={groupMembers} layout={group.layout} />
                  )}

                  {group.descricao && (
                    <p className="mt-6 text-center text-xs leading-relaxed text-[#9CA3AF]">
                      {group.descricao}
                    </p>
                  )}
                </section>
              );
            })}
          </div>
        ) : (
          /* Estado vazio */
          <div className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8">
            <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-[#0F3B63]/5 flex items-center justify-center">
              <Users size={36} className="text-[#0F3B63]/30" strokeWidth={1} />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#0F3B63]">
              Informações em atualização
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">
              Os dados da Mesa Diretora estão sendo preparados. Em breve estarão disponíveis nesta página.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-sm bg-[#0F3B63] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#F4CF6A] transition hover:bg-[#1A5A96]"
            >
              Voltar ao Início
            </Link>
          </div>
        )}

        {/* Rodapé decorativo da seção */}
        {hasGroups && hasMembers && (
          <div className="border-t border-[#C9993B]/20 bg-[#0F3B63]/[0.02] py-8 text-center">
            <div className="mx-auto flex w-fit items-center gap-3">
              <div className="h-px w-12 bg-[#C9993B]/40" />
              <Image
                src="/assets/logo-comieadepa.png"
                alt="COMIEADEPA"
                width={32}
                height={32}
                className="object-contain opacity-40"
              />
              <div className="h-px w-12 bg-[#C9993B]/40" />
            </div>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9CA3AF]">
              COMIEADEPA — Desde 1921
            </p>
          </div>
        )}
      </main>
    </PublicLayout>
  );
}
