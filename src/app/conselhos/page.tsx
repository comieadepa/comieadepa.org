import { ArrowRight, BookOpenCheck, GraduationCap, Scale, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { PublicLayout } from "@/components/site/PublicLayout";
import { buildSeoMetadata } from "@/lib/seo";
import { InstitutionalPageHeader } from "@/components/site/InstitutionalPageHeader";
import { InstitutionalSection } from "@/components/site/InstitutionalSection";
import { InstitutionalCard } from "@/components/site/InstitutionalCard";

type Council = {
  name: string;
  title: string;
  summary: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  featured?: boolean;
};

const councils: Council[] = [
  {
    name: "CONEC",
    title: "Conselho de Educação Cristã",
    summary:
      "O CONEC contribui para a organização pedagógica e doutrinária da educação cristã, apoiando líderes, professores e departamentos locais.",
    icon: GraduationCap,
    featured: true,
  },
  {
    name: "Conselho Doutrinário",
    title: "Zelo bíblico e orientação teológica",
    summary:
      "Atua no acompanhamento de temas doutrinários, oferecendo apoio e discernimento à Convenção em assuntos relacionados à fé e à prática cristã.",
    icon: BookOpenCheck,
  },
  {
    name: "Conselho Ministerial",
    title: "Comunhão e fortalecimento pastoral",
    summary:
      "Coopera para a unidade ministerial, acompanha demandas da liderança e contribui com a edificação das igrejas e dos ministros filiados.",
    icon: ShieldCheck,
  },
  {
    name: "Conselho Administrativo",
    title: "Organização e suporte institucional",
    summary:
      "Contribui para o bom andamento dos processos internos, apoiando a organização administrativa e a condução institucional da COMIEADEPA.",
    icon: Scale,
  },
];

export const metadata: Metadata = buildSeoMetadata({
  title: "Conselhos | COMIEADEPA",
  description: "Conheça os conselhos da COMIEADEPA.",
  path: "/conselhos",
  image: "/assets/logo-comieadepa.png",
});

export default function ConselhosPage() {
  const featuredCouncil = councils.find((council) => council.featured) ?? councils[0];
  const remainingCouncils = councils.filter((council) => council !== featuredCouncil);
  const FeaturedIcon = featuredCouncil.icon;

  return (
    <PublicLayout>
      <main className="min-h-screen bg-white text-[#1F2937]">
        <InstitutionalPageHeader
          badge="INSTITUCIONAL"
          title="Conselhos"
          subtitle="Estruturas de orientação, apoio e fortalecimento da vida ministerial e institucional da COMIEADEPA."
        />

        <InstitutionalSection className="pb-8">
          <article className="overflow-hidden border border-[#0F3B63]/10 bg-[#F8FAFC] shadow-[0_12px_40px_rgba(15,59,99,0.06)]">
            <div className="grid lg:grid-cols-[240px_minmax(0,1fr)]">
              <div className="flex min-h-[200px] items-center justify-center bg-[linear-gradient(160deg,rgba(15,59,99,0.12),rgba(212,162,76,0.18))] p-6">
                <div className="grid h-20 w-20 place-items-center rounded-full border border-[#0F3B63]/10 bg-white/80 text-[#B8872D] shadow-[0_8px_16px_rgba(15,59,99,0.06)]">
                  <FeaturedIcon size={36} />
                </div>
              </div>

              <div className="flex flex-col justify-between p-6 sm:p-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B8872D]">Conselho em destaque</p>
                  <h2 className="mt-2 font-serif text-3xl font-bold leading-tight text-[#0F3B63]">{featuredCouncil.name}</h2>
                  <p className="mt-2 text-sm font-semibold text-[#1F2937]">{featuredCouncil.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">{featuredCouncil.summary}</p>
                </div>

                <span className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#0F3B63]">
                  Conselho estratégico
                  <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </article>
        </InstitutionalSection>

        {/* Remaning Councils grid (3 columns desktop, 2 tablet, 1 mobile) */}
        <InstitutionalSection className="py-4 md:py-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {remainingCouncils.map((council) => (
              <InstitutionalCard
                key={council.name}
                icon={council.icon}
                badge={council.name}
                title={council.title}
                description={council.summary}
              />
            ))}
          </div>
        </InstitutionalSection>

        <InstitutionalSection>
          <div className="border-t border-[#0F3B63]/10 pt-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B8872D]">Serviço institucional</p>
            <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-[#0F3B63] sm:text-4xl">
              Conselhos a serviço da unidade e da edificação da obra
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
              Os conselhos da COMIEADEPA cooperam para o fortalecimento da Convenção, contribuindo com orientação,
              acompanhamento e apoio em áreas estratégicas da vida ministerial e institucional.
            </p>
          </div>
        </InstitutionalSection>
      </main>
    </PublicLayout>
  );
}
