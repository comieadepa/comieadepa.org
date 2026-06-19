import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { PublicLayout } from "@/components/site/PublicLayout";
import { buildSeoMetadata } from "@/lib/seo";
import { InstitutionalPageHeader } from "@/components/site/InstitutionalPageHeader";
import { InstitutionalSection } from "@/components/site/InstitutionalSection";

const declarations = [
  "Cremos em um só Deus, eternamente subsistente em três pessoas: Pai, Filho e Espírito Santo.",
  "Cremos na inspiração divina e autoridade suprema das Sagradas Escrituras como regra de fé e prática cristã.",
  "Cremos na divindade de nosso Senhor Jesus Cristo, em seu nascimento virginal, morte expiatória, ressurreição e gloriosa volta.",
  "Cremos na salvação mediante a graça de Deus, por meio da fé em Jesus Cristo, com arrependimento sincero e nova vida.",
  "Cremos no batismo no Espírito Santo e na atualidade dos dons espirituais para a edificação da Igreja.",
  "Cremos na santificação como obra contínua de Deus na vida do crente, chamando-o à fidelidade, pureza e consagração.",
  "Cremos na ressurreição dos mortos, no juízo final e na vida eterna com Deus para os salvos em Cristo.",
];

export const metadata: Metadata = buildSeoMetadata({
  title: "Declaração de Fé | COMIEADEPA",
  description: "Conheça a declaração de fé da COMIEADEPA.",
  path: "/declaracao-de-fe",
  image: "/assets/logo-comieadepa.png",
});

export default function DeclaracaoDeFePage() {
  return (
    <PublicLayout>
      <main className="min-h-screen bg-white text-[#1F2937]">
        <InstitutionalPageHeader
          badge="INSTITUCIONAL"
          title="Declaração de Fé"
          subtitle="Princípios doutrinários que orientam a fé, a comunhão e o testemunho cristão da COMIEADEPA."
        />

        <InstitutionalSection>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B8872D]">Fundamento bíblico</p>
              <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-[#0F3B63] sm:text-4xl">
                Uma confissão de fé centrada na Palavra de Deus
              </h2>
            </div>

            <div className="space-y-5 text-base leading-relaxed text-[#4B5563]">
              <p>
                A Declaração de Fé da COMIEADEPA expressa convicções bíblicas que sustentam a vida cristã, a prática
                ministerial e o testemunho da Igreja. Ela afirma nossa confiança na revelação das Escrituras, na obra
                redentora de Jesus Cristo e na ação presente do Espírito Santo.
              </p>
              <p>
                Esses princípios fortalecem a unidade doutrinária da Convenção, orientam a comunhão entre ministros e
                igrejas e preservam a identidade assembleiana no serviço ao Reino de Deus.
              </p>
            </div>
          </div>
        </InstitutionalSection>

        {/* Declarations Grid - Desktop 3 columns, Tablet 2, Mobile 1, matching visual layout rules */}
        <section className="border-y border-[#0F3B63]/10 bg-[#F8FAFC]">
          <InstitutionalSection className="py-12 md:py-16">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {declarations.map((item, index) => (
                <article
                  key={item}
                  className="flex flex-col justify-between border border-[#0F3B63]/10 bg-white p-6 shadow-[0_4px_20px_rgba(15,59,99,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(15,59,99,0.08)]"
                >
                  <div>
                    <span className="mb-4 inline-grid h-8 w-8 place-items-center bg-[#F8FAFC] text-[#B8872D]">
                      <CheckCircle2 size={16} />
                    </span>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#B8872D]">Princípio {index + 1}</p>
                    <p className="mt-3 text-sm leading-relaxed text-[#4B5563]">{item}</p>
                  </div>
                </article>
              ))}
            </div>
          </InstitutionalSection>
        </section>

        <InstitutionalSection>
          <div className="border-t border-[#0F3B63]/10 pt-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B8872D]">Comunhão e fidelidade</p>
            <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-[#0F3B63] sm:text-4xl">
              Doutrina, unidade e compromisso com a verdade
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
              A Declaração de Fé da COMIEADEPA serve como referência para a unidade ministerial, a pregação fiel do
              Evangelho e o fortalecimento das igrejas e ministros filiados em sua missão cristã.
            </p>
          </div>
        </InstitutionalSection>
      </main>
    </PublicLayout>
  );
}
