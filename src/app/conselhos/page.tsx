import { ArrowRight, BookOpenCheck, GraduationCap, Scale, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PublicLayout } from "@/components/site/PublicLayout";
import { buildSeoMetadata } from "@/lib/seo";

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
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <Link href="/" className="text-sm font-black uppercase tracking-[0.18em] text-[#0F3B63] transition hover:text-[#4A86B8]">
            COMIEADEPA
          </Link>

          <div className="mt-10 grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#B8872D]">INSTITUCIONAL</p>
              <h1 className="mt-5 font-serif text-5xl font-black leading-[1.04] text-[#0F3B63] sm:text-7xl">Conselhos</h1>
            </div>
            <p className="text-xl leading-8 text-[#6B7280]">
              Estruturas de orientação, apoio e fortalecimento da vida ministerial e institucional da COMIEADEPA.
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
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[#B8872D]">Conselho em destaque</p>
                  <h2 className="mt-4 font-serif text-4xl font-black leading-tight text-[#0F3B63] sm:text-5xl">{featuredCouncil.name}</h2>
                  <p className="mt-4 text-lg font-semibold text-[#1F2937]">{featuredCouncil.title}</p>
                  <p className="mt-5 max-w-3xl text-lg leading-8 text-[#6B7280]">{featuredCouncil.summary}</p>
                </div>

                <span className="mt-8 inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.16em] text-[#0F3B63]">
                  Conselho estratégico
                  <ArrowRight size={18} />
                </span>
              </div>
            </div>
          </article>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-4 sm:px-8 lg:py-8">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {remainingCouncils.map((council) => {
              const Icon = council.icon;
              return (
                <article
                  key={council.name}
                  className="border border-[#0F3B63]/10 bg-white p-7 shadow-[0_18px_48px_rgba(15,59,99,.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,59,99,.14)]"
                >
                  <span className="grid h-12 w-12 place-items-center bg-[#F8FAFC] text-[#B8872D]">
                    <Icon size={22} />
                  </span>
                  <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-[#B8872D]">{council.name}</p>
                  <h3 className="mt-4 font-serif text-3xl font-black leading-tight text-[#0F3B63]">{council.title}</h3>
                  <p className="mt-4 text-base leading-8 text-[#6B7280]">{council.summary}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="border-t border-[#0F3B63]/10 pt-10">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#B8872D]">Serviço institucional</p>
            <h2 className="mt-5 font-serif text-4xl font-black leading-tight text-[#0F3B63] sm:text-5xl">
              Conselhos a serviço da unidade e da edificação da obra
            </h2>
            <p className="mt-6 max-w-4xl text-lg leading-8 text-[#6B7280]">
              Os conselhos da COMIEADEPA cooperam para o fortalecimento da Convenção, contribuindo com orientação,
              acompanhamento e apoio em áreas estratégicas da vida ministerial e institucional.
            </p>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
