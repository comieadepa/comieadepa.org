import Link from "next/link";

export const metadata = {
  title: "Termos de Uso | COMIEADEPA",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#120f0a] px-5 py-16 text-[#fff7e5] sm:px-8">
      <article className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a] transition hover:text-white">
          COMIEADEPA
        </Link>
        <header className="mt-10 border-b border-white/12 pb-10">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#f4cf6a]">Portal institucional</p>
          <h1 className="mt-5 font-serif text-4xl font-black leading-[1.04] text-white sm:text-6xl">Termos de Uso.</h1>
          <p className="mt-6 text-lg leading-8 text-white/62">
            Ao acessar o portal da COMIEADEPA, o usuário concorda com as condições de uso, segurança e responsabilidade descritas nesta página.
          </p>
        </header>

        <div className="mt-10 space-y-8 text-lg leading-8 text-white/72">
          <section>
            <h2 className="font-serif text-3xl font-black text-white">Uso do portal</h2>
            <p className="mt-3">
              O portal tem finalidade institucional, informativa e de apoio à comunicação oficial da convenção, seus departamentos, eventos e serviços relacionados.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-black text-white">Conteúdos</h2>
            <p className="mt-3">
              Textos, imagens, marcas, documentos e materiais publicados pertencem à COMIEADEPA ou são utilizados com autorização. A reprodução deve preservar a fonte e respeitar direitos aplicáveis.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-black text-white">Serviços externos</h2>
            <p className="mt-3">
              O portal pode direcionar para sistemas de eventos, área do ministro, YouTube, redes sociais e outros serviços. Cada ambiente pode possuir regras e políticas próprias.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-black text-white">Responsabilidades</h2>
            <p className="mt-3">
              O usuário deve utilizar o portal de forma adequada, sem tentar comprometer sua segurança, disponibilidade, integridade ou finalidade institucional.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-black text-white">Atualizações</h2>
            <p className="mt-3">
              Estes termos podem ser atualizados a qualquer momento para refletir melhorias do portal, novos serviços, exigências legais ou diretrizes institucionais.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
