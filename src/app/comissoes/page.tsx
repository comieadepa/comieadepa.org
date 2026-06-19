import { ArrowRight, Cpu, RadioTower, Shield, Workflow } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PublicLayout } from "@/components/site/PublicLayout";
import { buildSeoMetadata } from "@/lib/seo";

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
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <Link href="/" className="text-sm font-black uppercase tracking-[0.18em] text-[#0F3B63] transition hover:text-[#4A86B8]">
            COMIEADEPA
          </Link>

          <div className="mt-10 grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#B8872D]">INSTITUCIONAL</p>
              <h1 className="mt-5 font-serif text-5xl font-black leading-[1.04] text-[#0F3B63] sm:text-7xl">Comissões</h1>
            </div>
            <p className="text-xl leading-8 text-[#6B7280]">
              Frentes de apoio que cooperam com organização, comunicação e desenvolvimento institucional da COMIEADEPA.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-12 sm:px-8 lg:pb-16">
          <article className="overflow-hidden border border-[#0F3B63]/10 bg-[#F8FAFC] shadow-[0_24px_70px_rgba(15,59,99,.10)]">
            <div className="grid lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="flex min-h-[320px] items-center justify-center bg-[linear-gradient(160deg,rgba(15,59,99,.12),rgba(212,162,76,.18))] p-10">
                <div className="grid h-28 w-28 place-items-center rounded-full border border-[#0F3B63]/10 bg-white/80 text-[#B8872D] shadow-[0_18px_36px_rgba(15,59,99,.12)]">
                  <FeaturedIcon size={54} />
                </div>
              </div>

              <div className="flex flex-col justify-between p-8 sm:p-10">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[#B8872D]">Comissão em destaque</p>
                  <h2 className="mt-4 font-serif text-4xl font-black leading-tight text-[#0F3B63] sm:text-5xl">
                    {featuredCommission.name}
                  </h2>
                  <p className="mt-4 text-lg font-semibold text-[#1F2937]">{featuredCommission.title}</p>
                  <p className="mt-5 max-w-3xl text-lg leading-8 text-[#6B7280]">{featuredCommission.summary}</p>
                </div>

                <span className="mt-8 inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.16em] text-[#0F3B63]">
                  Atuação estratégica
                  <ArrowRight size={18} />
                </span>
              </div>
            </div>
          </article>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-4 sm:px-8 lg:py-8">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {remainingCommissions.map((commission) => {
              const Icon = commission.icon;
              return (
                <article
                  key={commission.name}
                  className="border border-[#0F3B63]/10 bg-white p-7 shadow-[0_18px_48px_rgba(15,59,99,.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,59,99,.14)]"
                >
                  <span className="grid h-12 w-12 place-items-center bg-[#F8FAFC] text-[#B8872D]">
                    <Icon size={22} />
                  </span>
                  <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-[#B8872D]">{commission.name}</p>
                  <h3 className="mt-4 font-serif text-3xl font-black leading-tight text-[#0F3B63]">{commission.title}</h3>
                  <p className="mt-4 text-base leading-8 text-[#6B7280]">{commission.summary}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="border-t border-[#0F3B63]/10 pt-10">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#B8872D]">Serviço institucional</p>
            <h2 className="mt-5 font-serif text-4xl font-black leading-tight text-[#0F3B63] sm:text-5xl">
              Comissões a serviço da organização e do avanço da obra
            </h2>
            <p className="mt-6 max-w-4xl text-lg leading-8 text-[#6B7280]">
              As comissões da COMIEADEPA apoiam áreas estratégicas da Convenção, contribuindo com planejamento,
              execução, acompanhamento e fortalecimento das ações institucionais em diferentes frentes de serviço.
            </p>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
