import { Archive, ArrowRight, BookMarked, Landmark, ScrollText } from "lucide-react";
import type { Metadata } from "next";
import { PublicLayout } from "@/components/site/PublicLayout";
import { buildSeoMetadata } from "@/lib/seo";
import { InstitutionalPageHeader } from "@/components/site/InstitutionalPageHeader";
import { InstitutionalSection } from "@/components/site/InstitutionalSection";
import { InstitutionalCard } from "@/components/site/InstitutionalCard";

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
        <InstitutionalPageHeader
          badge="INSTITUCIONAL"
          title="Memória"
          subtitle="Um espaço dedicado à preservação da história, do acervo e do museu da Convenção, honrando a trajetória da COMIEADEPA."
        />

        <InstitutionalSection className="pb-8">
          <article className="overflow-hidden border border-[#0F3B63]/10 bg-[#F8FAFC] shadow-[0_12px_40px_rgba(15,59,99,0.06)]">
            <div className="grid lg:grid-cols-[240px_minmax(0,1fr)]">
              <div className="flex min-h-[200px] items-center justify-center bg-[linear-gradient(160deg,rgba(15,59,99,0.12),rgba(212,162,76,0.18))] p-6">
                <div className="grid h-20 w-20 place-items-center rounded-full border border-[#0F3B63]/10 bg-white/80 text-[#B8872D] shadow-[0_8px_16px_rgba(15,59,99,0.06)]">
                  <Landmark size={36} />
                </div>
              </div>

              <div className="flex flex-col justify-between p-6 sm:p-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B8872D]">Museu da Convenção</p>
                  <h2 className="mt-2 font-serif text-3xl font-bold leading-tight text-[#0F3B63]">
                    Preservando a história que fortalece nossa identidade
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">
                    A página Memória será o espaço institucional voltado ao registro do museu da Convenção, reunindo fatos,
                    documentos, imagens e marcos que contam a caminhada da COMIEADEPA e celebram o legado daqueles que
                    serviram à obra de Deus ao longo do tempo.
                  </p>
                </div>

                <span className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#0F3B63]">
                  Patrimônio institucional
                  <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </article>
        </InstitutionalSection>

        {/* Highlights grid (3 columns desktop, 2 tablet, 1 mobile) */}
        <InstitutionalSection className="py-4 md:py-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((item) => (
              <InstitutionalCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.summary}
              />
            ))}
          </div>
        </InstitutionalSection>

        <InstitutionalSection>
          <div className="border-t border-[#0F3B63]/10 pt-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B8872D]">Legado e preservação</p>
            <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-[#0F3B63] sm:text-4xl">
              Guardando a memória da Convenção para as próximas gerações
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
              A preservação da memória institucional contribui para manter viva a identidade da COMIEADEPA, valorizar sua
              história ministerial e reconhecer o testemunho de fé, serviço e unidade construído ao longo de sua jornada.
            </p>
          </div>
        </InstitutionalSection>
      </main>
    </PublicLayout>
  );
}
