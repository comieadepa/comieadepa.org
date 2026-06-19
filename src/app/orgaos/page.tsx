import { ArrowRight, Building2, FileCog, Landmark, Network, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { PublicLayout } from "@/components/site/PublicLayout";
import { buildSeoMetadata } from "@/lib/seo";
import { InstitutionalPageHeader } from "@/components/site/InstitutionalPageHeader";
import { InstitutionalSection } from "@/components/site/InstitutionalSection";
import { InstitutionalCard } from "@/components/site/InstitutionalCard";

type Organ = {
  name: string;
  title: string;
  summary: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  featured?: boolean;
};

const organs: Organ[] = [
  {
    name: "Secretaria Geral",
    title: "Coordenação documental e suporte institucional",
    summary:
      "A Secretaria Geral coopera com a organização administrativa da COMIEADEPA, apoiando registros, comunicações internas, documentação oficial e fluxo institucional da Convenção.",
    icon: FileCog,
    featured: true,
  },
  {
    name: "Tesouraria",
    title: "Responsabilidade financeira e acompanhamento operacional",
    summary:
      "Atua no suporte às rotinas financeiras e no acompanhamento de processos que exigem controle, transparência e responsabilidade institucional.",
    icon: Landmark,
  },
  {
    name: "Coordenação Institucional",
    title: "Integração entre áreas e frentes de trabalho",
    summary:
      "Contribui para a conexão entre setores, lideranças e equipes de apoio, fortalecendo a unidade de atuação e o alinhamento institucional da COMIEADEPA.",
    icon: Network,
  },
  {
    name: "Assessoria Executiva",
    title: "Acompanhamento estratégico e apoio à presidência",
    summary:
      "Auxilia a liderança convencional no acompanhamento de pautas estratégicas, organização de demandas e suporte à condução administrativa.",
    icon: Building2,
  },
  {
    name: "Controle e Integridade",
    title: "Zelo institucional e conformidade interna",
    summary:
      "Coopera com práticas de acompanhamento, responsabilidade e integridade, fortalecendo a boa condução dos processos internos da Convenção.",
    icon: ShieldCheck,
  },
];

export const metadata: Metadata = buildSeoMetadata({
  title: "Órgãos | COMIEADEPA",
  description: "Conheça os órgãos de apoio e organização institucional da COMIEADEPA.",
  path: "/orgaos",
  image: "/assets/logo-comieadepa.png",
});

export default function OrgaosPage() {
  const featuredOrgan = organs.find((organ) => organ.featured) ?? organs[0];
  const remainingOrgans = organs.filter((organ) => organ !== featuredOrgan);
  const FeaturedIcon = featuredOrgan.icon;

  return (
    <PublicLayout>
      <main className="min-h-screen bg-white text-[#1F2937]">
        <InstitutionalPageHeader
          badge="INSTITUCIONAL"
          title="Órgãos"
          subtitle="Estruturas de apoio que cooperam com a organização, a governança e o funcionamento institucional da COMIEADEPA."
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
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B8872D]">Órgão em destaque</p>
                  <h2 className="mt-2 font-serif text-3xl font-bold leading-tight text-[#0F3B63]">{featuredOrgan.name}</h2>
                  <p className="mt-2 text-sm font-semibold text-[#1F2937]">{featuredOrgan.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">{featuredOrgan.summary}</p>
                </div>

                <span className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#0F3B63]">
                  Suporte institucional
                  <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </article>
        </InstitutionalSection>

        {/* Remaining Organs grid (3 columns desktop, 2 tablet, 1 mobile) */}
        <InstitutionalSection className="py-4 md:py-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {remainingOrgans.map((organ) => (
              <InstitutionalCard
                key={organ.name}
                icon={organ.icon}
                badge={organ.name}
                title={organ.title}
                description={organ.summary}
              />
            ))}
          </div>
        </InstitutionalSection>

        <InstitutionalSection>
          <div className="border-t border-[#0F3B63]/10 pt-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B8872D]">Serviço institucional</p>
            <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-[#0F3B63] sm:text-4xl">
              Órgãos a serviço da ordem, da unidade e da boa condução da Convenção
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
              Os órgãos da COMIEADEPA cooperam para o bom andamento da vida convencional, oferecendo suporte técnico,
              administrativo e estratégico às áreas que sustentam o funcionamento institucional e o avanço da obra.
            </p>
          </div>
        </InstitutionalSection>
      </main>
    </PublicLayout>
  );
}
