import { ArrowRight, Quote } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicLayout } from "@/components/site/PublicLayout";
import { buildSeoMetadata } from "@/lib/seo";
import { InstitutionalPageHeader } from "@/components/site/InstitutionalPageHeader";
import { InstitutionalSection } from "@/components/site/InstitutionalSection";

const president = {
  name: "Pr. Océlio Nauar",
  role: "Presidente COMIEADEPA",
  image: "/assets/presidente-comieadepa.png",
  badge: "Palavra do Presidente",
  titleLine1: "Servindo com",
  titleHighlight: "Integridade",
  titleLine2: "e Fidelidade",
  paragraphs: [
    "A COMIEADEPA segue firme no propósito de servir a Deus com integridade, unidade e compromisso com a Palavra.",
    "A cada pastor, líder e membro, reafirmamos: sua dedicação não é em vão. Deus sustenta e honra os que O servem com fidelidade.",
    "Sigamos em oração, com visão espiritual e amor pelas almas. O Senhor é conosco e maiores ainda são as obras que Ele realizará!",
  ],
};

const leadershipLinks = [
  { title: "Mesa Diretora", href: "/mesa-diretora" },
  { title: "Quem Somos", href: "/quem-somos" },
  { title: "Declaração de Fé", href: "/declaracao-de-fe" },
  { title: "Documentos Oficiais", href: "/documentos" },
];

export const metadata: Metadata = buildSeoMetadata({
  title: "Presidente | COMIEADEPA",
  description: "Conheça a mensagem institucional do presidente da COMIEADEPA.",
  path: "/presidente",
  image: president.image,
});

export default function PresidentePage() {
  return (
    <PublicLayout>
      <main className="min-h-screen bg-white text-[#1F2937]">
        <InstitutionalPageHeader
          badge="PRESIDÊNCIA"
          title="Presidente"
          subtitle="Conheça a liderança e a mensagem institucional da presidência da COMIEADEPA."
        />

        <InstitutionalSection className="pb-8">
          <article className="overflow-hidden border border-[#0F3B63]/10 bg-[#F8FAFC] shadow-[0_12px_40px_rgba(15,59,99,0.06)]">
            <div className="grid lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="relative min-h-[360px] bg-[linear-gradient(160deg,rgba(15,59,99,0.12),rgba(212,162,76,0.18))]">
                <Image src={president.image} alt={president.name} fill priority className="object-cover object-top" />
              </div>

              <div className="flex flex-col justify-between p-6 sm:p-8 md:p-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B8872D]">{president.badge}</p>
                  <h2 className="mt-2 font-serif text-3xl font-bold leading-tight text-[#0F3B63]">{president.name}</h2>
                  <p className="mt-2 text-sm font-semibold text-[#1F2937]">{president.role}</p>

                  <div className="mt-6 border-t border-[#0F3B63]/10 pt-6">
                    <p className="font-serif text-2xl font-black leading-tight text-[#0F3B63]">
                      {president.titleLine1} <span className="text-[#B8872D]">{president.titleHighlight}</span> {president.titleLine2}
                    </p>
                  </div>
                </div>

                <div className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#0F3B63]">
                  Liderança institucional
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </article>
        </InstitutionalSection>

        <InstitutionalSection className="py-4 md:py-6">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4 text-base leading-relaxed text-[#4B5563]">
              {president.paragraphs.map((paragraph, index) => (
                <p key={paragraph} className={index === 0 ? "font-semibold text-[#1F2937]" : undefined}>
                  {paragraph}
                </p>
              ))}
            </div>

            <aside className="border border-[#0F3B63]/10 bg-white p-6 shadow-[0_4px_20px_rgba(15,59,99,0.04)]">
              <div className="inline-flex h-10 w-10 items-center justify-center bg-[#F8FAFC] text-[#B8872D]">
                <Quote size={18} />
              </div>
              <p className="mt-4 font-serif text-xl font-bold leading-snug text-[#0F3B63]">
                Uma liderança comprometida com a comunhão, a verdade bíblica e o fortalecimento da obra de Deus.
              </p>
            </aside>
          </div>
        </InstitutionalSection>

        <InstitutionalSection>
          <div className="border-t border-[#0F3B63]/10 pt-10">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B8872D]">Presidência</p>
                <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-[#0F3B63]">
                  Unidade Ministerial
                </h2>
              </div>

              {/* Responsive Links Grid (3 columns) */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {leadershipLinks.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group flex items-center justify-between border border-[#0F3B63]/10 bg-white p-4 shadow-[0_2px_10px_rgba(15,59,99,0.02)] transition hover:-translate-y-0.5 hover:border-[#B8872D] hover:shadow-[0_8px_20px_rgba(15,59,99,0.06)]"
                  >
                    <span className="text-sm font-semibold text-[#0F3B63] transition group-hover:text-[#B8872D]">{item.title}</span>
                    <ArrowRight size={14} className="text-[#B8872D] transition group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </InstitutionalSection>
      </main>
    </PublicLayout>
  );
}
