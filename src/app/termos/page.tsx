import Link from "next/link";
import { PublicLayout } from "@/components/site/PublicLayout";

export const metadata = {
  title: "Termos de Uso | COMIEADEPA",
};

export default function TermsPage() {
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
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F8D77B]">Portal institucional</p>
                <h1 className="mt-4 font-serif text-5xl font-black leading-[1.04] text-white sm:text-7xl">Termos de Uso</h1>
              </div>
              <p className="text-lg leading-8 text-white/80 border-l border-white/20 pl-6 lg:border-l-2">
                Ao acessar o portal da COMIEADEPA, o usuário concorda com as condições de uso, segurança e responsabilidade descritas nesta página.
              </p>
            </div>
          </div>
        </section>

        <article className="mx-auto max-w-4xl px-5 py-12 sm:px-8">

        <div className="mt-10 space-y-8 text-lg leading-8 text-[#6B7280]">
          <section>
            <h2 className="font-serif text-3xl font-black text-[#0F3B63]">Uso do portal</h2>
            <p className="mt-3">
              O portal tem finalidade institucional, informativa e de apoio à comunicação oficial da convenção, seus departamentos, eventos e serviços relacionados.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-black text-[#0F3B63]">Conteúdos</h2>
            <p className="mt-3">
              Textos, imagens, marcas, documentos e materiais publicados pertencem à COMIEADEPA ou são utilizados com autorização. A reprodução deve preservar a fonte e respeitar direitos aplicáveis.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-black text-[#0F3B63]">Serviços externos</h2>
            <p className="mt-3">
              O portal pode direcionar para sistemas de eventos, área do ministro, YouTube, redes sociais e outros serviços. Cada ambiente pode possuir regras e políticas próprias.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-black text-[#0F3B63]">Responsabilidades</h2>
            <p className="mt-3">
              O usuário deve utilizar o portal de forma adequada, sem tentar comprometer sua segurança, disponibilidade, integridade ou finalidade institucional.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-black text-[#0F3B63]">Atualizações</h2>
            <p className="mt-3">
              Estes termos podem ser atualizados a qualquer momento para refletir melhorias do portal, novos serviços, exigências legais ou diretrizes institucionais.
            </p>
          </section>
        </div>
      </article>
      </main>
    </PublicLayout>
  );
}
