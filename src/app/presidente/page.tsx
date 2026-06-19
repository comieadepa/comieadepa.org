import { ArrowRight, Quote } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicLayout } from "@/components/site/PublicLayout";
import { buildSeoMetadata } from "@/lib/seo";

const president = {
  name: "Pr. Océlio Nauar",
  role: "Presidente COMIEADEPA",
  image: "/assets/presidente-comieadepa.png",
  badge: "Palavra do Presidente",
  titleLine1: "Servindo com",
  titleHighlight: "Integridade",
  titleLine2: "e Fidelidade",
  paragraphs: [
    "A COMIEADEPA segue firme no propósito de servir a Deus com integridade, unidade e compromisso com a Palavra.",
    "A cada pastor, líder e membro, reafirmamos: sua dedicação não é em vão. Deus sustenta e honra os que O servem com fidelidade.",
    "Sigamos em oração, com visão espiritual e amor pelas almas. O Senhor é conosco e maiores ainda são as obras que Ele realizará!",
  ],
};

const leadershipLinks = [
  { title: "Mesa Diretora", href: "/mesa-diretora" },
  { title: "Quem Somos", href: "/quem-somos" },
  { title: "Declaração de Fé", href: "/declaracao-de-fe" },
  { title: "Documentos Oficiais", href: "/documentos" },
];

export const metadata: Metadata = buildSeoMetadata({
  title: "Presidente | COMIEADEPA",
  description: "Conheça a mensagem institucional do presidente da COMIEADEPA.",
  path: "/presidente",
  image: president.image,
});

export default function PresidentePage() {
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

            <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F8D77B]">INSTITUCIONAL</p>
                <h1 className="mt-4 font-serif text-5xl font-black leading-[1.04] text-white sm:text-7xl">Presidente</h1>
              </div>
              <p className="text-lg leading-8 text-white/80 border-l border-white/20 pl-6 lg:border-l-2">
                Conheça a liderança e a mensagem institucional da presidência da COMIEADEPA.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-12 sm:px-8 lg:pb-16">
          <article className="overflow-hidden border border-[#0F3B63]/10 bg-[#F8FAFC] shadow-[0_24px_70px_rgba(15,59,99,.10)]">
            <div className="grid lg:grid-cols-[380px_minmax(0,1fr)]">
              <div className="relative min-h-[420px] bg-[linear-gradient(160deg,rgba(15,59,99,.12),rgba(212,162,76,.18))]">
                <Image src={president.image} alt={president.name} fill priority className="object-cover object-top" />
              </div>

              <div className="flex flex-col justify-between p-8 sm:p-10 lg:p-12">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[#B8872D]">{president.badge}</p>
                  <h2 className="mt-4 font-serif text-4xl font-black leading-tight text-[#0F3B63] sm:text-5xl">{president.name}</h2>
                  <p className="mt-4 text-lg font-semibold text-[#1F2937]">{president.role}</p>

                  <div className="mt-8">
                    <p className="font-serif text-4xl font-black leading-tight text-[#0F3B63] sm:text-5xl">
                      {president.titleLine1} <span className="text-[#B8872D]">{president.titleHighlight}</span> {president.titleLine2}
                    </p>
                  </div>
                </div>

                <div className="mt-8 inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.16em] text-[#0F3B63]">
                  Liderança institucional
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>
          </article>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-4 sm:px-8 lg:py-8">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr]">
            <div className="space-y-6 text-lg leading-8 text-[#4B5563]">
              {president.paragraphs.map((paragraph, index) => (
                <p key={paragraph} className={index === 0 ? "text-[#1F2937]" : undefined}>
                  {paragraph}
                </p>
              ))}
            </div>

            <aside className="border border-[#0F3B63]/10 bg-white p-7 shadow-[0_18px_48px_rgba(15,59,99,.08)]">
              <div className="inline-flex h-12 w-12 items-center justify-center bg-[#F8FAFC] text-[#B8872D]">
                <Quote size={22} />
              </div>
              <p className="mt-6 font-serif text-3xl font-black leading-tight text-[#0F3B63]">
                Uma liderança comprometida com a comunhão, a verdade bíblica e o fortalecimento da obra de Deus.
              </p>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="border-t border-[#0F3B63]/10 pt-10">
            <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-[#B8872D]">Presidência</p>
                <h2 className="mt-5 font-serif text-4xl font-black leading-tight text-[#0F3B63] sm:text-5xl">
                  Liderança a serviço da unidade ministerial
                </h2>
              </div>

              <div className="grid gap-3">
                {leadershipLinks.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group flex items-center gap-4 border-b border-[#0F3B63]/10 py-4 text-[#0F3B63] transition hover:text-[#B8872D]"
                  >
                    <span className="text-lg font-semibold">{item.title}</span>
                    <ArrowRight size={18} className="ml-auto transition group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
