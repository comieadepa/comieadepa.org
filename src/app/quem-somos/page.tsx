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

const institutionalCards = [
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
        <section className="relative overflow-hidden border-b border-[#0F3B63]/10 px-5 py-16 sm:px-8 lg:py-20">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,59,99,.06),transparent_40%,rgba(212,162,76,.12))]" />
          <div className="absolute inset-y-0 right-0 w-[42%] bg-[radial-gradient(circle_at_center,rgba(15,59,99,.10),transparent_70%)]" />
          <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_.75fr] lg:items-center">
            <div>
              <Link href="/" className="text-sm font-black uppercase tracking-[0.18em] text-[#0F3B63] transition hover:text-[#4A86B8]">
                COMIEADEPA
              </Link>
              <p className="mt-10 text-sm font-black uppercase tracking-[0.22em] text-[#B8872D]">Institucional</p>
              <h1 className="mt-5 max-w-4xl font-serif text-5xl font-black leading-[1.02] text-[#0F3B63] sm:text-7xl">Conheça a COMIEADEPA</h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-[#6B7280]">
                Convenção Interestadual de Ministros e Igrejas Evangélicas Assembleias de Deus do Estado do Pará
              </p>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative flex h-[320px] w-full max-w-[360px] items-center justify-center overflow-hidden border border-[#0F3B63]/10 bg-[#F8FAFC] shadow-[0_24px_70px_rgba(15,59,99,.12)]">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(212,162,76,.10),transparent_38%,rgba(15,59,99,.06))]" />
                <Image
                  src="/assets/logo-comieadepa.png"
                  alt="Brasão COMIEADEPA"
                  width={260}
                  height={260}
                  priority
                  className="relative h-auto w-[220px] object-contain drop-shadow-[0_20px_40px_rgba(15,59,99,.18)] sm:w-[260px]"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#B8872D]">História institucional</p>
              <h2 className="mt-5 font-serif text-4xl font-black leading-tight text-[#0F3B63] sm:text-5xl">
                Uma história de fé, unidade e compromisso com a obra de Deus
              </h2>
            </div>

            <div className="space-y-6 text-lg leading-8 text-[#4B5563]">
              <p>
                A COMIEADEPA é uma convenção assembleiana com trajetória histórica marcada pela comunhão ministerial,
                defesa da doutrina bíblica, fortalecimento das igrejas filiadas e compromisso com a expansão do Reino
                de Deus.
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
        </section>

        <section className="border-y border-[#0F3B63]/10 bg-[#F8FAFC] px-5 py-16 sm:px-8 lg:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-5 lg:grid-cols-3">
              {institutionalCards.map((card) => (
                <article
                  key={card.title}
                  className="border border-[#0F3B63]/10 bg-white p-7 shadow-[0_18px_48px_rgba(15,59,99,.08)]"
                >
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[#B8872D]">{card.title}</p>
                  <p className="mt-5 text-base leading-8 text-[#4B5563]">{card.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#B8872D]">Acesso institucional</p>
              <h2 className="mt-5 font-serif text-4xl font-black leading-tight text-[#0F3B63] sm:text-5xl">
                Áreas e conteúdos importantes da Convenção
              </h2>
            </div>
            <p className="text-lg leading-8 text-[#6B7280]">
              Navegue pelas páginas institucionais, documentos oficiais e conteúdos públicos da COMIEADEPA a partir
              deste hub.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {institutionalLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex min-h-[190px] flex-col justify-between border border-[#0F3B63]/10 bg-white p-7 shadow-[0_18px_48px_rgba(15,59,99,.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,59,99,.14)]"
                >
                  <div>
                    <span className="grid h-12 w-12 place-items-center bg-[#F8FAFC] text-[#B8872D]">
                      <Icon size={20} />
                    </span>
                    <h3 className="mt-6 font-serif text-3xl font-black leading-tight text-[#0F3B63]">{item.title}</h3>
                  </div>
                  <span className="mt-8 inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.16em] text-[#0F3B63]">
                    Acessar
                    <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="border-t border-[#0F3B63]/10 bg-[#0F3B63] px-5 py-16 text-white sm:px-8 lg:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#F8D77B]">Documentação</p>
              <h2 className="mt-5 font-serif text-4xl font-black leading-tight sm:text-5xl">Documentação da COMIEADEPA</h2>
              <p className="mt-6 text-lg leading-8 text-white/78">
                Acesse estatuto, regimento interno, declarações, formulários e demais documentos oficiais da Convenção.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {documentLinks.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="inline-flex items-center justify-between gap-3 border border-white/12 bg-white/[0.06] px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:border-[#F8D77B] hover:text-[#F8D77B]"
                >
                  <span>{item.title}</span>
                  <ArrowRight size={17} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
