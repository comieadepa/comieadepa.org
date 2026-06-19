import { ArrowRight, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicLayout } from "@/components/site/PublicLayout";
import { buildSeoMetadata } from "@/lib/seo";

type BoardMember = {
  name: string;
  role: string;
  church?: string;
  photo?: string;
  order: number;
};

const boardMembers: BoardMember[] = [
  {
    name: "Pr. Océlio Nauar",
    role: "Presidente",
    church: "Belém - PA",
    photo: "/assets/presidente-comieadepa.png",
    order: 1,
  },
  {
    name: "Pr. José Almeida",
    role: "1º Vice-Presidente",
    church: "Ananindeua - PA",
    order: 2,
  },
  {
    name: "Pr. Samuel Ferreira",
    role: "2º Vice-Presidente",
    church: "Castanhal - PA",
    order: 3,
  },
  {
    name: "Pr. Marcos Ribeiro",
    role: "1º Secretário",
    church: "Marabá - PA",
    order: 4,
  },
  {
    name: "Pr. Daniel Sousa",
    role: "2º Secretário",
    church: "Santarém - PA",
    order: 5,
  },
  {
    name: "Pr. Eliabe Costa",
    role: "1º Tesoureiro",
    church: "Parauapebas - PA",
    order: 6,
  },
  {
    name: "Pr. João Batista",
    role: "2º Tesoureiro",
    church: "Altamira - PA",
    order: 7,
  },
];

export const metadata: Metadata = buildSeoMetadata({
  title: "Mesa Diretora | COMIEADEPA",
  description: "Conheça a Mesa Diretora da COMIEADEPA.",
  path: "/mesa-diretora",
  image: "/assets/logo-comieadepa.png",
});

export default function MesaDiretoraPage() {
  const [president, ...members] = [...boardMembers].sort((a, b) => a.order - b.order);

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
                <h1 className="mt-4 font-serif text-5xl font-black leading-[1.04] text-white sm:text-7xl">Mesa Diretora</h1>
              </div>
              <p className="text-lg leading-8 text-white/80 border-l border-white/20 pl-6 lg:border-l-2">Conheça a liderança da COMIEADEPA</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-12 sm:px-8 lg:pb-16">
          <article className="overflow-hidden border border-[#0F3B63]/10 bg-[#F8FAFC] shadow-[0_24px_70px_rgba(15,59,99,.10)]">
            <div className="grid lg:grid-cols-[360px_minmax(0,1fr)]">
              <div className="relative min-h-[360px] bg-[linear-gradient(160deg,rgba(15,59,99,.12),rgba(212,162,76,.18))]">
                <MemberPhoto member={president} featured />
              </div>

              <div className="flex flex-col justify-between p-8 sm:p-10">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[#B8872D]">Presidente</p>
                  <h2 className="mt-4 font-serif text-4xl font-black leading-tight text-[#0F3B63] sm:text-5xl">{president.name}</h2>
                  <p className="mt-4 text-lg font-semibold text-[#1F2937]">{president.role}</p>
                  {president.church ? <p className="mt-2 text-base leading-7 text-[#6B7280]">{president.church}</p> : null}
                </div>

                <span className="mt-8 inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.16em] text-[#0F3B63]">
                  Liderança institucional
                  <ArrowRight size={18} />
                </span>
              </div>
            </div>
          </article>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-4 sm:px-8 lg:py-8">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => (
              <article
                key={member.name}
                className="overflow-hidden border border-[#0F3B63]/10 bg-white shadow-[0_18px_48px_rgba(15,59,99,.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,59,99,.14)]"
              >
                <div className="relative min-h-[240px] bg-[linear-gradient(160deg,rgba(15,59,99,.08),rgba(212,162,76,.14))]">
                  <MemberPhoto member={member} />
                </div>

                <div className="p-6">
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[#B8872D]">{member.role}</p>
                  <h3 className="mt-4 font-serif text-3xl font-black leading-tight text-[#0F3B63]">{member.name}</h3>
                  {member.church ? <p className="mt-3 text-base leading-7 text-[#6B7280]">{member.church}</p> : null}

                  <span className="mt-6 inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.14em] text-[#0F3B63]">
                    Ver perfil
                    <ArrowRight size={17} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="border-t border-[#0F3B63]/10 pt-10">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#B8872D]">Serviço institucional</p>
            <h2 className="mt-5 font-serif text-4xl font-black leading-tight text-[#0F3B63] sm:text-5xl">
              Liderança a serviço da obra de Deus
            </h2>
            <p className="mt-6 max-w-4xl text-lg leading-8 text-[#6B7280]">
              A Mesa Diretora da COMIEADEPA atua na condução institucional da Convenção, zelando pela unidade ministerial,
              organização administrativa e fortalecimento das igrejas e ministros filiados.
            </p>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}

function MemberPhoto({ member, featured = false }: { member: BoardMember; featured?: boolean }) {
  if (member.photo) {
    return (
      <Image
        src={member.photo}
        alt={member.name}
        fill
        className={`object-cover ${featured ? "object-top" : "object-center"}`}
      />
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-[#0F3B63]">
      <div className="grid h-20 w-20 place-items-center rounded-full border border-[#0F3B63]/10 bg-white/70">
        <UserRound size={36} className="text-[#B8872D]" />
      </div>
      <Image src="/assets/logo-comieadepa.png" alt="COMIEADEPA" width={72} height={72} className="h-16 w-16 object-contain opacity-80" />
    </div>
  );
}
