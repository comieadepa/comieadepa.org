import Link from "next/link";

export const metadata = {
  title: "Política de Privacidade | COMIEADEPA",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#120f0a] px-5 py-16 text-[#fff7e5] sm:px-8">
      <article className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a] transition hover:text-white">
          COMIEADEPA
        </Link>
        <header className="mt-10 border-b border-white/12 pb-10">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#f4cf6a]">LGPD</p>
          <h1 className="mt-5 font-serif text-4xl font-black leading-[1.04] text-white sm:text-6xl">Política de Privacidade.</h1>
          <p className="mt-6 text-lg leading-8 text-white/62">
            Esta política explica como a COMIEADEPA trata dados pessoais em seus canais digitais, em conformidade com a Lei Geral de Proteção de Dados.
          </p>
        </header>

        <div className="mt-10 space-y-8 text-lg leading-8 text-white/72">
          <section>
            <h2 className="font-serif text-3xl font-black text-white">Dados que podemos coletar</h2>
            <p className="mt-3">Podemos tratar dados fornecidos em formulários, inscrições, contatos institucionais, navegação no portal e interações com conteúdos oficiais.</p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-black text-white">Finalidades</h2>
            <p className="mt-3">
              Os dados são utilizados para comunicação institucional, gestão de eventos, atendimento, segurança, melhoria da experiência no portal e cumprimento de obrigações legais.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-black text-white">Cookies</h2>
            <p className="mt-3">
              Utilizamos cookies e tecnologias semelhantes para funcionamento do site, segurança, medição de desempenho e melhoria da navegação. O usuário pode gerenciar cookies pelo navegador.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-black text-white">Compartilhamento</h2>
            <p className="mt-3">
              Dados pessoais podem ser compartilhados com operadores técnicos, plataformas de hospedagem, sistemas de eventos e autoridades públicas quando houver obrigação legal.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-black text-white">Direitos do titular</h2>
            <p className="mt-3">
              O titular pode solicitar confirmação de tratamento, acesso, correção, eliminação, portabilidade e informações sobre compartilhamento, conforme previsto na LGPD.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-black text-white">Contato</h2>
            <p className="mt-3">
              Solicitações relacionadas à privacidade podem ser encaminhadas para o canal institucional da COMIEADEPA. Esta página poderá ser atualizada para refletir melhorias e novas obrigações.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
