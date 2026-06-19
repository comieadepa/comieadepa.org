import { ArrowRight, Cpu, RadioTower, Shield, Workflow } from "lucide-react";
import type { Metadata } from "next";
import { PublicLayout } from "@/components/site/PublicLayout";
import { buildSeoMetadata } from "@/lib/seo";
import { InstitutionalPageHeader } from "@/components/site/InstitutionalPageHeader";
import { InstitutionalSection } from "@/components/site/InstitutionalSection";
import { InstitutionalCard } from "@/components/site/InstitutionalCard";

type Commission = {
  name: string;
  title: string;
  summary: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  featured?: boolean;
};

const commissions: Commission[] = [
  {
    name: "Comissão de Tecnologia",
    title: "Inovação, suporte digital e comunicação institucional",
    summary:
      "A Comissão de Tecnologia apoia a COMIEADEPA no desenvolvimento de soluções digitais, organização de fluxos tecnológicos, presença institucional e suporte às iniciativas de comunicação e gestão.",
    icon: Cpu,
    featured: true,
  },
  {
    name: "Comissão de Comunicação",
    title: "Conteúdo, informação e identidade institucional",
    summary:
      "Coopera na divulgação de ações, eventos e comunicados oficiais, fortalecendo a presença pública da Convenção com clareza, unidade e responsabilidade.",
    icon: RadioTower,
  },
  {
    name: "Comissão de Apoio Administrativo",
    title: "Processos internos e organização operacional",
    summary:
      "Contribui com o acompanhamento de rotinas, demandas internas e apoio às frentes administrativas que sustentam o funcionamento institucional da COMIEADEPA.",
    icon: Workflow,
  },
  {
    name: "Comissão de Ética e Suporte",
    title: "Cuidado institucional e acompanhamento responsável",
    summary:
      "Auxilia em temas sensíveis da vida convencional, promovendo escuta, zelo relacional e suporte em processos que exigem responsabilidade e equilíbrio.",
    icon: Shield,
  },
];

export const metadata: Metadata = buildSeoMetadata({
  title: "Comissões | COMIEADEPA",
  description: "Conheça as comissões da COMIEADEPA.",
  path: "/comissoes",
  image: "/assets/logo-comieadepa.png",
});

export default function ComissoesPage() {
  const featuredCommission = commissions.find((commission) => commission.featured) ?? commissions[0];
  const remainingCommissions = commissions.filter((commission) => commission !== featuredCommission);
  const FeaturedIcon = featuredCommission.icon;

  return (
    <PublicLayout>
      <main className="min-h-screen bg-white text-[#1F2937]">
        <InstitutionalPageHeader
          badge="INSTITUCIONAL"
          title="Comissões"
          subtitle="Frentes de apoio que cooperam com organização, comunicação e desenvolvimento institucional da COMIEADEPA."
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
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B8872D]">Comissão em destaque</p>
                  <h2 className="mt-2 font-serif text-3xl font-bold leading-tight text-[#0F3B63]">{featuredCommission.name}</h2>
                  <p className="mt-2 text-sm font-semibold text-[#1F2937]">{featuredCommission.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">{featuredCommission.summary}</p>
                </div>

                <span className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#0F3B63]">
                  Atuação estratégica
                  <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </article>
        </InstitutionalSection>

        {/* Remaining Commissions grid (3 columns desktop, 2 tablet, 1 mobile) */}
        <InstitutionalSection className="py-4 md:py-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {remainingCommissions.map((commission) => (
              <InstitutionalCard
                key={commission.name}
                icon={commission.icon}
                badge={commission.name}
                title={commission.title}
                description={commission.summary}
              />
            ))}
          </div>
        </InstitutionalSection>

        <InstitutionalSection>
          <div className="border-t border-[#0F3B63]/10 pt-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B8872D]">Serviço institucional</p>
            <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-[#0F3B63] sm:text-4xl">
              Comissões a serviço da organização e do avanço da obra
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
              As comissões da COMIEADEPA apoiam áreas estratégicas da Convenção, contribuindo com planejamento,
              execução, acompanhamento e fortalecimento das ações institucionais em diferentes frentes de serviço.
            </p>
          </div>
        </InstitutionalSection>
      </main>
    </PublicLayout>
  );
}
