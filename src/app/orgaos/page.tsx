import { ArrowRight, Building2, FileCog, Landmark, Network, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PublicLayout } from "@/components/site/PublicLayout";
import { buildSeoMetadata } from "@/lib/seo";

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
        <section className="relative overflow-hidden bg-[#0F3B63] py-20 text-white md:py-24">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,59,99,0.98)_0%,rgba(29,90,140,0.88)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(212,162,76,0.15),transparent_50%)]" />
          <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(135deg,#fff_1px,transparent_1px)] [background-size:38px_38px]" />

          <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
            <Link href="/" className="text-sm font-black uppercase tracking-[0.18em] text-[#F8D77B] transition hover:text-white">
              COMIEADEPA
            </Link>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F8D77B]">INSTITUCIONAL</p>
                <h1 className="mt-4 font-serif text-5xl font-black leading-[1.04] text-white sm:text-7xl">Órgãos</h1>
              </div>
              <p className="text-lg leading-8 text-white/80 border-l border-white/20 pl-6 lg:border-l-2">
                Estruturas de apoio que cooperam com a organização, a governança e o funcionamento institucional da COMIEADEPA.
              </p>
            </div>
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
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[#B8872D]">Órgão em destaque</p>
                  <h2 className="mt-4 font-serif text-4xl font-black leading-tight text-[#0F3B63] sm:text-5xl">{featuredOrgan.name}</h2>
                  <p className="mt-4 text-lg font-semibold text-[#1F2937]">{featuredOrgan.title}</p>
                  <p className="mt-5 max-w-3xl text-lg leading-8 text-[#6B7280]">{featuredOrgan.summary}</p>
                </div>

                <span className="mt-8 inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.16em] text-[#0F3B63]">
                  Suporte institucional
                  <ArrowRight size={18} />
                </span>
              </div>
            </div>
          </article>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-4 sm:px-8 lg:py-8">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {remainingOrgans.map((organ) => {
              const Icon = organ.icon;
              return (
                <article
                  key={organ.name}
                  className="border border-[#0F3B63]/10 bg-white p-7 shadow-[0_18px_48px_rgba(15,59,99,.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,59,99,.14)]"
                >
                  <span className="grid h-12 w-12 place-items-center bg-[#F8FAFC] text-[#B8872D]">
                    <Icon size={22} />
                  </span>
                  <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-[#B8872D]">{organ.name}</p>
                  <h3 className="mt-4 font-serif text-3xl font-black leading-tight text-[#0F3B63]">{organ.title}</h3>
                  <p className="mt-4 text-base leading-8 text-[#6B7280]">{organ.summary}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="border-t border-[#0F3B63]/10 pt-10">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#B8872D]">Serviço institucional</p>
            <h2 className="mt-5 font-serif text-4xl font-black leading-tight text-[#0F3B63] sm:text-5xl">
              Órgãos a serviço da ordem, da unidade e da boa condução da Convenção
            </h2>
            <p className="mt-6 max-w-4xl text-lg leading-8 text-[#6B7280]">
              Os órgãos da COMIEADEPA cooperam para o bom andamento da vida convencional, oferecendo suporte técnico,
              administrativo e estratégico às áreas que sustentam o funcionamento institucional e o avanço da obra.
            </p>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
