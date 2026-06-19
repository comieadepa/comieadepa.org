import Link from "next/link";

export const metadata = {
  title: "Política de Privacidade | COMIEADEPA",
};

export default function PrivacyPage() {
  return (
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
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F8D77B]">LGPD</p>
                <h1 className="mt-4 font-serif text-5xl font-black leading-[1.04] text-white sm:text-7xl">Política de Privacidade</h1>
              </div>
              <p className="text-lg leading-8 text-white/80 border-l border-white/20 pl-6 lg:border-l-2">
                Esta política explica como a COMIEADEPA trata dados pessoais em seus canais digitais, em conformidade com a Lei Geral de Proteção de Dados.
              </p>
            </div>
          </div>
        </section>

        <article className="mx-auto max-w-4xl px-5 py-12 sm:px-8">

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
