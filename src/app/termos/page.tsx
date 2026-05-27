import Link from "next/link";

export const metadata = {
  title: "Termos de Uso | COMIEADEPA",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-16 text-[#1F2937] sm:px-8">
      <article className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-black uppercase tracking-[0.18em] text-[#0F3B63] transition hover:text-[#4A86B8]">
          COMIEADEPA
        </Link>
        <header className="mt-10 border-b border-[#0F3B63]/10 pb-10">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#B8872D]">Portal institucional</p>
          <h1 className="mt-5 font-serif text-4xl font-black leading-[1.04] text-[#0F3B63] sm:text-6xl">Termos de Uso.</h1>
          <p className="mt-6 text-lg leading-8 text-[#6B7280]">
            Ao acessar o portal da COMIEADEPA, o usuário concorda com as condições de uso, segurança e responsabilidade descritas nesta página.
          </p>
        </header>

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
  );
}
