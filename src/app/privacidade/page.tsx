import Link from "next/link";

export const metadata = {
  title: "Política de Privacidade | COMIEADEPA",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-16 text-[#1F2937] sm:px-8">
      <article className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-black uppercase tracking-[0.18em] text-[#0F3B63] transition hover:text-[#4A86B8]">
          COMIEADEPA
        </Link>
        <header className="mt-10 border-b border-[#0F3B63]/10 pb-10">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#B8872D]">LGPD</p>
          <h1 className="mt-5 font-serif text-4xl font-black leading-[1.04] text-[#0F3B63] sm:text-6xl">Política de Privacidade.</h1>
          <p className="mt-6 text-lg leading-8 text-[#6B7280]">
            Esta política explica como a COMIEADEPA trata dados pessoais em seus canais digitais, em conformidade com a Lei Geral de Proteção de Dados.
          </p>
        </header>

        <div className="mt-10 space-y-8 text-lg leading-8 text-[#6B7280]">
          <section>
            <h2 className="font-serif text-3xl font-black text-[#0F3B63]">Dados que podemos coletar</h2>
            <p className="mt-3">Podemos tratar dados fornecidos em formulários, inscrições, contatos institucionais, navegação no portal e interações com conteúdos oficiais.</p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-black text-[#0F3B63]">Finalidades</h2>
            <p className="mt-3">
              Os dados são utilizados para comunicação institucional, gestão de eventos, atendimento, segurança, melhoria da experiência no portal e cumprimento de obrigações legais.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-black text-[#0F3B63]">Cookies</h2>
            <p className="mt-3">
              Utilizamos cookies e tecnologias semelhantes para funcionamento do site, segurança, medição de desempenho e melhoria da navegação. O usuário pode gerenciar cookies pelo navegador.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-black text-[#0F3B63]">Compartilhamento</h2>
            <p className="mt-3">
              Dados pessoais podem ser compartilhados com operadores técnicos, plataformas de hospedagem, sistemas de eventos e autoridades públicas quando houver obrigação legal.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-black text-[#0F3B63]">Direitos do titular</h2>
            <p className="mt-3">
              O titular pode solicitar confirmação de tratamento, acesso, correção, eliminação, portabilidade e informações sobre compartilhamento, conforme previsto na LGPD.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-black text-[#0F3B63]">Contato</h2>
            <p className="mt-3">
              Solicitações relacionadas à privacidade podem ser encaminhadas para o canal institucional da COMIEADEPA. Esta página poderá ser atualizada para refletir melhorias e novas obrigações.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
