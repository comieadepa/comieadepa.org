"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { PublicLayout } from "@/components/site/PublicLayout";
import { InstitutionalSection } from "@/components/site/InstitutionalSection";

export type BoardGroup = {
  id: string;
  nome: string;
  slug?: string | null;
  subtitulo?: string | null;
  descricao?: string | null;
  bg_image_url?: string | null;
  title_color?: string | null;
  layout: "hero" | "center" | "grid2" | "grid3" | "grid4";
};

export type BoardMember = {
  nome: string;
  cargo: string;
  grupo_id?: string | null;
  grupo?: string | null; // Compatibilidade legada
  campo?: string;
  foto: string;
  ordem: number;
};

interface MesaDiretoraClientProps {
  groups: BoardGroup[];
  boardMembers: BoardMember[];
}

export function MesaDiretoraClient({ groups, boardMembers }: MesaDiretoraClientProps) {
  const cardAnimation = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.6 }
  };

  return (
    <PublicLayout>
      <main className="min-h-screen bg-[#F8FAFC] text-[#1F2937]">
        {/* Parallax Hero Section */}
        <section className="relative overflow-hidden bg-slate-950 py-24 text-white md:py-32">
          <div 
            className="absolute inset-0 bg-[url('/assets/sede-aerea-comieadepa.jpg')] bg-cover bg-center opacity-30 md:bg-attachment-fixed"
            style={{ backgroundAttachment: 'fixed' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-[#F8FAFC]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(212,162,76,0.12),transparent_40%)]" />

          <div className="relative z-10 mx-auto max-w-6xl px-5 text-center sm:px-8">
            <Link href="/" className="text-xs font-black uppercase tracking-[0.25em] text-[#F8D77B] transition hover:text-white">
              COMIEADEPA
            </Link>
            <p className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-[#F8D77B] sm:text-xs">MESA DIRETORA</p>
            <h1 className="mt-3 font-serif text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl">
              MESA DIRETORA DA COMIEADEPA
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base md:text-lg">
              Liderança, unidade e serviço à obra de Deus. Pastores a serviço do avanço do Reino de Deus em todo o Pará.
            </p>
          </div>
        </section>

        {/* Dynamic Groups & Sections */}
        {groups.map((group, groupIndex) => {
          // Filtrar os membros deste grupo
          const groupMembers = boardMembers
            .filter((m) => m.grupo_id === group.id || m.grupo === group.slug || m.grupo === group.id)
            .sort((a, b) => a.ordem - b.ordem);

          if (groupMembers.length === 0) {
            return null;
          }

          // Custom styles for title and backgrounds
          const titleColorStyle = group.title_color ? { color: group.title_color } : { color: "#0F3B63" };
          const borderStyle = group.title_color ? { borderColor: `${group.title_color}22` } : { borderColor: "rgba(15,59,99,0.1)" };
          const bgSectionStyle = group.bg_image_url
            ? { backgroundImage: `url('${group.bg_image_url}')`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined;

          // Renderização condicional por layout
          const renderLayout = () => {
            switch (group.layout) {
              case "hero":
                return (
                  <div className="flex justify-center">
                    <motion.div className="w-full max-w-sm" {...cardAnimation}>
                      <div className="group overflow-hidden rounded-xl border bg-white shadow-[0_12px_40px_rgba(15,59,99,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_48px_rgba(15,59,99,0.12)]" style={borderStyle}>
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
                          <Image 
                            src={groupMembers[0].foto} 
                            alt={groupMembers[0].nome} 
                            fill 
                            priority={groupIndex === 0} 
                            className="object-cover object-top transition-transform duration-500 group-hover:scale-105" 
                          />
                        </div>
                        <div className="bg-[#0F3B63] px-5 py-3 text-center text-xs font-black uppercase tracking-[0.2em] text-[#F8D77B]">
                          {groupMembers[0].cargo}
                        </div>
                        <div className="p-6 text-center">
                          <h3 className="font-serif text-2xl font-bold leading-tight text-[#0F3B63] group-hover:text-[#4A86B8] transition-colors">
                            {groupMembers[0].nome}
                          </h3>
                          {groupMembers[0].campo && (
                            <p className="mt-2 text-xs font-semibold text-[#6B7280]">
                              {groupMembers[0].campo}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );

              case "center":
                return (
                  <div className="flex justify-center">
                    <motion.div className="w-full max-w-[320px]" {...cardAnimation}>
                      <div className="group overflow-hidden rounded-xl border bg-white shadow-[0_8px_32px_rgba(15,59,99,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(15,59,99,0.09)]" style={borderStyle}>
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
                          <Image 
                            src={groupMembers[0].foto} 
                            alt={groupMembers[0].nome} 
                            fill 
                            className="object-cover object-top transition-transform duration-500 group-hover:scale-105" 
                          />
                        </div>
                        <div className="bg-[#B8872D] px-4 py-2.5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white">
                          {groupMembers[0].cargo}
                        </div>
                        <div className="p-5 text-center">
                          <h3 className="font-serif text-xl font-bold leading-tight text-[#0F3B63] group-hover:text-[#4A86B8] transition-colors">
                            {groupMembers[0].nome}
                          </h3>
                          {groupMembers[0].campo && (
                            <p className="mt-1 text-xs font-semibold text-[#6B7280]">
                              {groupMembers[0].campo}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );

              case "grid2":
                return (
                  <div className="grid gap-6 sm:grid-cols-2 lg:max-w-4xl lg:mx-auto lg:gap-8 justify-items-center justify-center">
                    {groupMembers.map((member, index) => (
                      <motion.div 
                        key={member.nome} 
                        className="w-full max-w-[280px] group overflow-hidden rounded-xl border bg-white shadow-[0_6px_24px_rgba(15,59,99,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_36px_rgba(15,59,99,0.08)]"
                        style={borderStyle}
                        {...cardAnimation}
                        transition={{ ...cardAnimation.transition, delay: index * 0.05 }}
                      >
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
                          <Image 
                            src={member.foto} 
                            alt={member.nome} 
                            fill 
                            className="object-cover object-top transition-transform duration-500 group-hover:scale-105" 
                          />
                        </div>
                        <div className="bg-[#0F3B63] px-4 py-2 text-center text-[10px] font-black uppercase tracking-[0.18em] text-[#F8D77B]">
                          {member.cargo}
                        </div>
                        <div className="p-5 text-center">
                          <h3 className="font-serif text-lg font-bold leading-tight text-[#0F3B63] group-hover:text-[#4A86B8] transition-colors">
                            {member.nome}
                          </h3>
                          {member.campo && (
                            <p className="mt-1.5 text-xs font-semibold text-[#6B7280]">
                              {member.campo}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                );

              case "grid4":
                return (
                  <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6 justify-items-center justify-center">
                    {groupMembers.map((member, index) => (
                      <motion.div 
                        key={member.nome} 
                        className="w-full max-w-[260px] group overflow-hidden rounded-xl border bg-white shadow-[0_6px_24px_rgba(15,59,99,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_36px_rgba(15,59,99,0.08)]"
                        style={borderStyle}
                        {...cardAnimation}
                        transition={{ ...cardAnimation.transition, delay: index * 0.05 }}
                      >
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
                          <Image 
                            src={member.foto} 
                            alt={member.nome} 
                            fill 
                            className="object-cover object-top transition-transform duration-500 group-hover:scale-105" 
                          />
                        </div>
                        <div className="bg-[#0F3B63] px-4 py-2 text-center text-[10px] font-black uppercase tracking-[0.18em] text-[#F8D77B]">
                          {member.cargo}
                        </div>
                        <div className="p-5 text-center">
                          <h3 className="font-serif text-lg font-bold leading-tight text-[#0F3B63] group-hover:text-[#4A86B8] transition-colors">
                            {member.nome}
                          </h3>
                          {member.campo && (
                            <p className="mt-1.5 text-xs font-semibold text-[#6B7280]">
                              {member.campo}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                );

              case "grid3":
              default:
                return (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 justify-items-center justify-center">
                    {groupMembers.map((member, index) => (
                      <motion.div 
                        key={member.nome} 
                        className="w-full max-w-[280px] group overflow-hidden rounded-xl border bg-white shadow-[0_6px_24px_rgba(15,59,99,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_36px_rgba(15,59,99,0.08)]"
                        style={borderStyle}
                        {...cardAnimation}
                        transition={{ ...cardAnimation.transition, delay: index * 0.05 }}
                      >
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
                          <Image 
                            src={member.foto} 
                            alt={member.nome} 
                            fill 
                            className="object-cover object-top transition-transform duration-500 group-hover:scale-105" 
                          />
                        </div>
                        <div className="bg-[#0F3B63] px-4 py-2 text-center text-[10px] font-black uppercase tracking-[0.18em] text-[#F8D77B]">
                          {member.cargo}
                        </div>
                        <div className="p-5 text-center">
                          <h3 className="font-serif text-lg font-bold leading-tight text-[#0F3B63] group-hover:text-[#4A86B8] transition-colors">
                            {member.nome}
                          </h3>
                          {member.campo && (
                            <p className="mt-1.5 text-xs font-semibold text-[#6B7280]">
                              {member.campo}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                );
            }
          };

          return (
            <InstitutionalSection key={group.id} className="py-12" style={bgSectionStyle}>
              <div className="mx-auto max-w-6xl px-5 sm:px-8">
                <div className="text-center mb-10">
                  <p className="text-xs font-black uppercase tracking-[0.25em] border-b pb-4 mb-2" style={{ ...titleColorStyle, ...borderStyle }}>
                    {group.nome}
                  </p>
                  {group.subtitulo && (
                    <p className="mt-2 text-sm italic text-gray-500 max-w-2xl mx-auto">
                      {group.subtitulo}
                    </p>
                  )}
                  {group.descricao && (
                    <p className="mt-3 text-sm text-gray-600 max-w-3xl mx-auto leading-relaxed">
                      {group.descricao}
                    </p>
                  )}
                </div>
                {renderLayout()}
              </div>
            </InstitutionalSection>
          );
        })}
      </main>
    </PublicLayout>
  );
}
