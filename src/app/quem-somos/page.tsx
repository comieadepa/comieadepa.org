import { ArrowRight, FileText, GalleryHorizontal, Landmark, Newspaper, ShieldCheck, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicLayout } from "@/components/site/PublicLayout";
import { buildSeoMetadata } from "@/lib/seo";

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
  { title: "Mesa Diretora", href: "/paginas/mesa-diretora", icon: Users },
  { title: "Conselhos e Comissões", href: "/paginas/conselhos-e-comissoes", icon: ShieldCheck },
  { title: "Departamentos", href: "/departamentos", icon: Landmark },
  { title: "Documentos Oficiais", href: "/documentos", icon: FileText },
  { title: "Galeria de Fotos", href: "/galeria", icon: GalleryHorizontal },
  { title: "Notícias", href: "/noticias", icon: Newspaper },
];

const documentLinks = [
  { title: "Estatuto", href: "/documentos" },
  { title: "Regimento Interno", href: "/documentos" },
  { title: "Declaração de Fé", href: "/documentos" },
  { title: "Central de Documentos", href: "/documentos" },
];

export default function QuemSomosPage() {
  return (
    <PublicLayout>
      <main className="min-h-screen bg-white text-[#1F2937]">
        <section className="relative overflow-hidden bg-[#0F3B63] py-20 text-white md:py-24">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,59,99,0.98)_0%,rgba(29,90,140,0.88)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(212,162,76,0.15),transparent_50%)]" />
          <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(135deg,#fff_1px,transparent_1px)] [background-size:38px_38px]" />

          <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
            <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
              <div>
                <Link href="/" className="text-sm font-black uppercase tracking-[0.18em] text-[#F8D77B] transition hover:text-white">
                  COMIEADEPA
                </Link>
                <p className="mt-10 text-xs font-black uppercase tracking-[0.22em] text-[#F8D77B]">INSTITUCIONAL</p>
                <h1 className="mt-4 font-serif text-5xl font-black leading-[1.02] text-white sm:text-7xl">Conheça a COMIEADEPA</h1>
                <p className="mt-6 max-w-3xl text-xl leading-8 text-white/80 border-l border-white/20 pl-6 lg:border-l-2">
                  Convenção Interestadual de Ministros e Igrejas Evangélicas Assembleias de Deus do Estado do Pará
                </p>
              </div>

              <div className="flex justify-center lg:justify-end">
                <div className="relative flex h-[300px] w-full max-w-[360px] items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(212,162,76,.12),transparent_62%)]" />
                  <Image
                    src="/assets/logo-comieadepa.png"
                    alt="Brasão COMIEADEPA"
                    width={280}
                    height={280}
                    priority
                    className="relative h-auto w-[220px] object-contain drop-shadow-[0_22px_45px_rgba(255,255,255,.12)] sm:w-[280px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-6 sm:px-8 lg:pb-20">
          <div className="grid gap-12 lg:grid-cols-[1.08fr_.92fr]">
            <div>
              <h2 className="font-serif text-4xl font-black leading-tight text-[#0F3B63] sm:text-5xl">
                Uma história de fé, unidade e compromisso com a obra de Deus
              </h2>
            </div>

            <div className="space-y-6 text-lg leading-8 text-[#4B5563]">
              <p>
                A COMIEADEPA é uma convenção assembleiana com trajetória histórica marcada pela comunhão ministerial,
                defesa da doutrina bíblica, fortalecimento das igrejas filiadas e compromisso com a expansão do Reino de
                Deus.
              </p>
              <p>
                Fundada sobre princípios de fé, organização e serviço cristão, a COMIEADEPA reúne ministros, igrejas e
                lideranças comprometidas com a Palavra de Deus, com a valorização da família ministerial e com o avanço
                da obra evangelística no Estado do Pará e em regiões alcançadas por sua atuação.
              </p>
              <p>
                Ao longo de sua caminhada, a Convenção tem atuado na orientação espiritual, no apoio institucional aos
                ministros, na promoção de assembleias, congressos, reuniões, ações administrativas, eventos de formação
                e fortalecimento da identidade assembleiana.
              </p>
            </div>
          </div>

          <div className="mt-14 grid gap-6 border-t border-[#0F3B63]/10 pt-10 lg:grid-cols-3">
            {institutionalHighlights.map((item) => (
              <article key={item.title} className="border-l-2 border-[#D4A24C] pl-5">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#0F3B63]">{item.title}</p>
                <p className="mt-4 text-base leading-8 text-[#6B7280]">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-[#0F3B63]/10 bg-[#F8FAFC] px-5 py-16 sm:px-8 lg:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-[#B8872D]">Institucional</p>
                <h2 className="mt-5 font-serif text-4xl font-black leading-tight text-[#0F3B63] sm:text-5xl">
                  Áreas e conteúdos da COMIEADEPA
                </h2>
              </div>

              <div className="grid gap-3">
                {institutionalLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="group flex items-center gap-4 border-b border-[#0F3B63]/10 py-4 text-[#0F3B63] transition hover:text-[#B8872D]"
                    >
                      <Icon size={18} className="shrink-0 text-[#B8872D]" />
                      <span className="text-lg font-semibold">{item.title}</span>
                      <ArrowRight size={18} className="ml-auto transition group-hover:translate-x-1" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_.9fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#B8872D]">Documentação</p>
              <h2 className="mt-5 font-serif text-4xl font-black leading-tight text-[#0F3B63] sm:text-5xl">
                Documentação da COMIEADEPA
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6B7280]">
                Acesse estatuto, regimento interno, declarações, formulários e demais documentos oficiais da Convenção.
              </p>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {documentLinks.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group inline-flex items-center justify-between gap-3 border border-[#0F3B63]/10 bg-white px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#0F3B63] transition hover:border-[#B8872D] hover:text-[#B8872D]"
                  >
                    <span>{item.title}</span>
                    <ArrowRight size={17} className="transition group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden border border-[#0F3B63]/10 bg-[#F8FAFC] shadow-[0_24px_70px_rgba(15,59,99,.10)]">
              <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(15,59,99,.06),rgba(212,162,76,.10))]" />
              <div className="relative flex min-h-[340px] items-center justify-center p-10">
                <Image
                  src="/assets/logo-comieadepa.png"
                  alt="Identidade institucional COMIEADEPA"
                  width={260}
                  height={260}
                  className="h-auto w-[210px] object-contain drop-shadow-[0_20px_40px_rgba(15,59,99,.16)] sm:w-[260px]"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
