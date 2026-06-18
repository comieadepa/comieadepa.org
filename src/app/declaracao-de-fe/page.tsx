import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PublicLayout } from "@/components/site/PublicLayout";
import { buildSeoMetadata } from "@/lib/seo";

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
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <Link href="/" className="text-sm font-black uppercase tracking-[0.18em] text-[#0F3B63] transition hover:text-[#4A86B8]">
            COMIEADEPA
          </Link>

          <div className="mt-10 grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#B8872D]">INSTITUCIONAL</p>
              <h1 className="mt-5 font-serif text-5xl font-black leading-[1.04] text-[#0F3B63] sm:text-7xl">Declaração de Fé</h1>
            </div>
            <p className="text-xl leading-8 text-[#6B7280]">
              Princípios doutrinários que orientam a fé, a comunhão e o testemunho cristão da COMIEADEPA.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-12 sm:px-8 lg:pb-16">
          <div className="grid gap-10 lg:grid-cols-[.95fr_1.05fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#B8872D]">Fundamento bíblico</p>
              <h2 className="mt-5 font-serif text-4xl font-black leading-tight text-[#0F3B63] sm:text-5xl">
                Uma confissão de fé centrada na Palavra de Deus
              </h2>
            </div>

            <div className="space-y-6 text-lg leading-8 text-[#4B5563]">
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
        </section>

        <section className="border-y border-[#0F3B63]/10 bg-[#F8FAFC] px-5 py-16 sm:px-8 lg:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-5 lg:grid-cols-2">
              {declarations.map((item, index) => (
                <article
                  key={item}
                  className="flex gap-4 border border-[#0F3B63]/10 bg-white p-7 shadow-[0_18px_48px_rgba(15,59,99,.08)]"
                >
                  <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center bg-[#F8FAFC] text-[#B8872D]">
                    <CheckCircle2 size={20} />
                  </span>
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.16em] text-[#B8872D]">Princípio {index + 1}</p>
                    <p className="mt-4 text-base leading-8 text-[#4B5563]">{item}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="border-t border-[#0F3B63]/10 pt-10">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#B8872D]">Comunhão e fidelidade</p>
            <h2 className="mt-5 font-serif text-4xl font-black leading-tight text-[#0F3B63] sm:text-5xl">
              Doutrina, unidade e compromisso com a verdade
            </h2>
            <p className="mt-6 max-w-4xl text-lg leading-8 text-[#6B7280]">
              A Declaração de Fé da COMIEADEPA serve como referência para a unidade ministerial, a pregação fiel do
              Evangelho e o fortalecimento das igrejas e ministros filiados em sua missão cristã.
            </p>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
