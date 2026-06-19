import { Archive, ArrowRight, BookMarked, Landmark, ScrollText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PublicLayout } from "@/components/site/PublicLayout";
import { buildSeoMetadata } from "@/lib/seo";

type MemoryHighlight = {
  title: string;
  summary: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const highlights: MemoryHighlight[] = [
  {
    title: "Acervo histórico",
    summary:
      "Reúne registros, documentos, fotografias e materiais que preservam a trajetória da COMIEADEPA e de sua atuação ao longo das gerações.",
    icon: Archive,
  },
  {
    title: "Museu da Convenção",
    summary:
      "Espaço dedicado à memória institucional, com peças, referências históricas e marcos que testemunham a caminhada da Convenção e de seus líderes.",
    icon: Landmark,
  },
  {
    title: "Documentação e pesquisa",
    summary:
      "Organiza conteúdos que ajudam a compreender a formação ministerial, os acontecimentos convencionais e a identidade assembleiana da COMIEADEPA.",
    icon: BookMarked,
  },
  {
    title: "Registro de legado",
    summary:
      "Valoriza histórias, assembleias, decisões e contribuições que fortaleceram a unidade da Convenção e o avanço da obra de Deus.",
    icon: ScrollText,
  },
];

export const metadata: Metadata = buildSeoMetadata({
  title: "Memória | COMIEADEPA",
  description: "Conheça o espaço de memória e o museu da Convenção da COMIEADEPA.",
  path: "/memoria",
  image: "/assets/logo-comieadepa.png",
});

export default function MemoriaPage() {
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
              <h1 className="mt-5 font-serif text-5xl font-black leading-[1.04] text-[#0F3B63] sm:text-7xl">Memória</h1>
            </div>
            <p className="text-xl leading-8 text-[#6B7280]">
              Um espaço dedicado à preservação da história, do acervo e do museu da Convenção, honrando a trajetória da COMIEADEPA.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-12 sm:px-8 lg:pb-16">
          <article className="overflow-hidden border border-[#0F3B63]/10 bg-[#F8FAFC] shadow-[0_24px_70px_rgba(15,59,99,.10)]">
            <div className="grid lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="flex min-h-[320px] items-center justify-center bg-[linear-gradient(160deg,rgba(15,59,99,.12),rgba(212,162,76,.18))] p-10">
                <div className="grid h-28 w-28 place-items-center rounded-full border border-[#0F3B63]/10 bg-white/80 text-[#B8872D] shadow-[0_18px_36px_rgba(15,59,99,.12)]">
                  <Landmark size={54} />
                </div>
              </div>

              <div className="flex flex-col justify-between p-8 sm:p-10">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[#B8872D]">Museu da Convenção</p>
                  <h2 className="mt-4 font-serif text-4xl font-black leading-tight text-[#0F3B63] sm:text-5xl">
                    Preservando a história que fortalece nossa identidade
                  </h2>
                  <p className="mt-5 max-w-3xl text-lg leading-8 text-[#6B7280]">
                    A página Memória será o espaço institucional voltado ao registro do museu da Convenção, reunindo fatos,
                    documentos, imagens e marcos que contam a caminhada da COMIEADEPA e celebram o legado daqueles que
                    serviram à obra de Deus ao longo do tempo.
                  </p>
                </div>

                <span className="mt-8 inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.16em] text-[#0F3B63]">
                  Patrimônio institucional
                  <ArrowRight size={18} />
                </span>
              </div>
            </div>
          </article>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-4 sm:px-8 lg:py-8">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="border border-[#0F3B63]/10 bg-white p-7 shadow-[0_18px_48px_rgba(15,59,99,.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,59,99,.14)]"
                >
                  <span className="grid h-12 w-12 place-items-center bg-[#F8FAFC] text-[#B8872D]">
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-6 font-serif text-3xl font-black leading-tight text-[#0F3B63]">{item.title}</h3>
                  <p className="mt-4 text-base leading-8 text-[#6B7280]">{item.summary}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="border-t border-[#0F3B63]/10 pt-10">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#B8872D]">Legado e preservação</p>
            <h2 className="mt-5 font-serif text-4xl font-black leading-tight text-[#0F3B63] sm:text-5xl">
              Guardando a memória da Convenção para as próximas gerações
            </h2>
            <p className="mt-6 max-w-4xl text-lg leading-8 text-[#6B7280]">
              A preservação da memória institucional contribui para manter viva a identidade da COMIEADEPA, valorizar sua
              história ministerial e reconhecer o testemunho de fé, serviço e unidade construído ao longo de sua jornada.
            </p>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
