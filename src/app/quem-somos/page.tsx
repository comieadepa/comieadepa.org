import { ArrowRight, GalleryHorizontal, Landmark, Newspaper, ShieldCheck, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicLayout } from "@/components/site/PublicLayout";
import { buildSeoMetadata } from "@/lib/seo";
import { InstitutionalSection } from "@/components/site/InstitutionalSection";

export const metadata: Metadata = buildSeoMetadata({
  title: "Quem Somos | COMIEADEPA",
  description: "Conheça a história, missão, visão e valores da COMIEADEPA.",
  path: "/quem-somos",
  image: "/assets/logo-comieadepa.png",
});

const institutionalHighlights = [
  {
    title: "Nossa Missão",
    text: "Promover comunhão, orientação e fortalecimento ministerial, servindo às igrejas e ministros filiados com zelo, responsabilidade e compromisso cristão.",
  },
  {
    title: "Nossa Visão",
    text: "Ser uma convenção de referência na organização ministerial, na preservação dos valores bíblicos e no apoio ao crescimento saudável da obra de Deus.",
  },
  {
    title: "Nossos Valores",
    text: "Fé, unidade, transparência, serviço, ética, zelo doutrinário, responsabilidade institucional e compromisso com a missão evangelizadora.",
  },
];

const institutionalLinks = [
  { title: "Mesa Diretora", href: "/mesa-diretora", icon: Users },
  { title: "Conselhos", href: "/conselhos", icon: ShieldCheck },
  { title: "Comissões", href: "/comissoes", icon: Users },
  { title: "Órgãos", href: "/orgaos", icon: Landmark },
  { title: "Memória", href: "/memoria", icon: GalleryHorizontal },
  { title: "Notícias", href: "/noticias", icon: Newspaper },
];

const documentLinks = [
  { title: "Estatuto", href: "/documentos" },
  { title: "Regimento Interno", href: "/documentos" },
  { title: "Declaração de Fé", href: "/declaracao-de-fe" },
  { title: "Central de Documentos", href: "/documentos" },
];

export default function QuemSomosPage() {
  return (
    <PublicLayout>
      <main className="min-h-screen bg-white text-[#1F2937]">
        {/* Harmonized Hero Section */}
        <section className="relative overflow-hidden bg-[#0F3B63] py-16 text-white md:py-20">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,59,99,0.98)_0%,rgba(29,90,140,0.88)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(212,162,76,0.12),transparent_50%)]" />
          <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(135deg,#fff_1px,transparent_1px)] [background-size:38px_38px]" />

          <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
            <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
              <div>
                <Link href="/" className="text-xs font-black uppercase tracking-[0.2em] text-[#F8D77B] transition hover:text-white">
                  COMIEADEPA
                </Link>
                <p className="mt-8 text-[10px] font-black uppercase tracking-[0.25em] text-[#F8D77B] sm:text-xs">INSTITUCIONAL</p>
                <h1 className="mt-3 font-serif text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">Conheça a COMIEADEPA</h1>
                <p className="mt-5 text-sm leading-relaxed text-white/80 border-l border-white/20 pl-5 sm:text-base lg:border-l-2">
                  Convenção Interestadual de Ministros e Igrejas Evangélicas Assembleias de Deus do Estado do Pará.
                </p>
              </div>

              <div className="flex justify-center lg:justify-end">
                <div className="relative flex h-[200px] w-full max-w-[260px] items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(212,162,76,0.1),transparent_62%)]" />
                  <Image
                    src="/assets/logo-comieadepa.png"
                    alt="Brasão COMIEADEPA"
                    width={180}
                    height={180}
                    priority
                    className="relative h-auto w-[140px] object-contain drop-shadow-[0_12px_24px_rgba(255,255,255,0.08)] sm:w-[180px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <InstitutionalSection>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="font-serif text-3xl font-bold leading-tight text-[#0F3B63] sm:text-4xl">
                Uma história de fé, unidade e compromisso com a obra de Deus
              </h2>
            </div>

            <div className="space-y-5 text-base leading-relaxed text-[#4B5563]">
              <p>
                A COMIEADEPA é uma convenção assembleiana com trajetória histórica marcada pela comunhão ministerial,
                defesa da doutrina bíblica, fortalecimento das igrejas filiadas e compromisso com a expansão do Reino de
                Deus.
              </p>
              <p>
                Fundada sobre princípios de fé, organização e serviço cristão, a COMIEADEPA reúne ministros, igrejas e
                lideranças comprometidas com a Palavra de Deus, com a valorização da família ministerial e com o avanço
                da obra evangelística no Estado do Pará.
              </p>
            </div>
          </div>

          {/* Harmonized Mission/Vision/Values layout (3 columns) */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 border-t border-[#0F3B63]/10 pt-10">
            {institutionalHighlights.map((item) => (
              <article key={item.title} className="border-l-2 border-[#D4A24C] pl-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0F3B63]">{item.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">{item.text}</p>
              </article>
            ))}
          </div>
        </InstitutionalSection>

        {/* Sections & Navigation Links */}
        <section className="border-y border-[#0F3B63]/10 bg-[#F8FAFC]">
          <InstitutionalSection className="py-12 md:py-14">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B8872D]">Estrutura</p>
                <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-[#0F3B63]">
                  Áreas e conteúdos da COMIEADEPA
                </h2>
              </div>

              {/* Grid responsivo de links institucionais (3 colunas no desktop) */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {institutionalLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="group flex items-center gap-3 border border-[#0F3B63]/10 bg-white p-4 shadow-[0_2px_10px_rgba(15,59,99,0.02)] transition hover:-translate-y-0.5 hover:border-[#B8872D] hover:shadow-[0_8px_20px_rgba(15,59,99,0.06)]"
                    >
                      <Icon size={16} className="shrink-0 text-[#B8872D]" />
                      <span className="text-sm font-semibold text-[#0F3B63] transition group-hover:text-[#B8872D]">{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </InstitutionalSection>
        </section>

        {/* Documentation Section */}
        <InstitutionalSection>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B8872D]">Documentação</p>
              <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-[#0F3B63]">
                Documentação Oficial
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">
                Acesse estatuto, regimento interno, declarações, formulários e demais documentos oficiais da Convenção.
              </p>

              {/* Grid responsivo de documentos */}
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {documentLinks.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group inline-flex items-center justify-between gap-3 border border-[#0F3B63]/10 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#0F3B63] transition hover:border-[#B8872D] hover:text-[#B8872D]"
                  >
                    <span>{item.title}</span>
                    <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden border border-[#0F3B63]/10 bg-[#F8FAFC] shadow-[0_12px_36px_rgba(15,59,99,0.06)]">
              <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(15,59,99,0.03),rgba(212,162,76,0.06))]" />
              <div className="relative flex min-h-[220px] items-center justify-center p-8">
                <Image
                  src="/assets/logo-comieadepa.png"
                  alt="Identidade institucional COMIEADEPA"
                  width={180}
                  height={180}
                  className="h-auto w-[140px] object-contain drop-shadow-[0_12px_24px_rgba(15,59,99,0.08)] sm:w-[160px]"
                />
              </div>
            </div>
          </div>
        </InstitutionalSection>
      </main>
    </PublicLayout>
  );
}
