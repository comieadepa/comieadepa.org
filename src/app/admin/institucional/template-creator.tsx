"use client";

import { useState } from "react";
import { LayoutTemplate, X, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

/* ─── Template Definitions ──────────────────────────────────────── */

type SecaoTemplate = {
  tipo: string;
  titulo: string | null;
  subtitulo: string | null;
  conteudo: string | null;
  ordem: number;
};

type CardTemplate = {
  secaoIndex: number; // index within secoes array
  titulo: string;
  subtitulo: string | null;
  descricao: string | null;
  icone: string | null;
  ordem: number;
};

type Template = {
  key: string;
  titulo: string;
  slug: string;
  subtitulo: string;
  descricao: string;
  heroBadge: string;
  seoTitle: string;
  seoDescription: string;
  secoes: SecaoTemplate[];
  cards: CardTemplate[];
};

const TEMPLATES: Template[] = [
  {
    key: "quem-somos",
    titulo: "Quem Somos",
    slug: "quem-somos",
    subtitulo: "A história e a missão da COMIEADEPA",
    descricao:
      "Conheça a Convenção das Igrejas e Ministérios Evangélicos Assembleianos do Estado do Pará.",
    heroBadge: "INSTITUCIONAL",
    seoTitle: "Quem Somos | COMIEADEPA",
    seoDescription:
      "Saiba mais sobre a história, missão e valores da COMIEADEPA – Convenção das Igrejas e Ministérios Evangélicos Assembleianos do Estado do Pará.",
    secoes: [
      {
        tipo: "texto",
        titulo: "Nossa História",
        subtitulo: "As raízes que sustentam nossa missão",
        conteudo:
          "Escreva aqui a história da COMIEADEPA. Utilize markdown para formatar o texto:\n\n## Fundação\n\nDescreva o início da convenção.\n\n## Crescimento\n\nDescreva como a convenção cresceu ao longo dos anos.",
        ordem: 0,
      },
      {
        tipo: "texto",
        titulo: "Nossa Missão",
        subtitulo: "O propósito que nos move",
        conteudo:
          "Descreva aqui a missão da COMIEADEPA e seus valores fundamentais.\n\n- Evangelização\n- Discipulado\n- Missões\n- Assistência Social",
        ordem: 1,
      },
      {
        tipo: "cards",
        titulo: "Nossos Valores",
        subtitulo: "Princípios que guiam cada decisão",
        conteudo: null,
        ordem: 2,
      },
    ],
    cards: [
      { secaoIndex: 2, titulo: "Fidelidade", subtitulo: null, descricao: "Compromisso com a Palavra de Deus em todos os aspectos.", icone: "BookOpen", ordem: 0 },
      { secaoIndex: 2, titulo: "Unidade", subtitulo: null, descricao: "Cooperação entre igrejas e ministérios em harmonia.", icone: "Users", ordem: 1 },
      { secaoIndex: 2, titulo: "Missão", subtitulo: null, descricao: "Alcançar o maior número de pessoas com o Evangelho.", icone: "Globe", ordem: 2 },
    ],
  },
  {
    key: "declaracao-de-fe",
    titulo: "Declaração de Fé",
    slug: "declaracao-de-fe",
    subtitulo: "Os fundamentos da fé assembleiana",
    descricao:
      "Nossa declaração de fé expressa as verdades bíblicas que fundamentam a vida e o ministério da COMIEADEPA.",
    heroBadge: "DOUTRINA",
    seoTitle: "Declaração de Fé | COMIEADEPA",
    seoDescription:
      "Conheça os fundamentos doutrinários e a declaração de fé da COMIEADEPA.",
    secoes: [
      {
        tipo: "texto",
        titulo: "A Sagrada Escritura",
        subtitulo: "A Bíblia como autoridade máxima",
        conteudo:
          "Cremos que a Bíblia Sagrada, composta dos 66 livros do Antigo e Novo Testamentos, é a Palavra de Deus inspirada, infalível e inerrante.",
        ordem: 0,
      },
      {
        tipo: "texto",
        titulo: "A Divindade",
        subtitulo: "Deus em três pessoas",
        conteudo:
          "Cremos no único Deus vivo e verdadeiro, eterno, infinito em poder, sabedoria, santidade, justiça, bondade e verdade; existindo em três pessoas: Pai, Filho e Espírito Santo.",
        ordem: 1,
      },
      {
        tipo: "texto",
        titulo: "A Salvação",
        subtitulo: "A graça que transforma",
        conteudo:
          "Cremos que o homem foi criado à imagem e semelhança de Deus, mas caiu pelo pecado. A salvação é pela graça mediante a fé em Jesus Cristo.",
        ordem: 2,
      },
      {
        tipo: "texto",
        titulo: "O Batismo no Espírito Santo",
        subtitulo: "O poder para testemunhar",
        conteudo:
          "Cremos no batismo no Espírito Santo com a evidência inicial do falar em outras línguas, conforme Atos 2:4.",
        ordem: 3,
      },
    ],
    cards: [],
  },
  {
    key: "presidente",
    titulo: "Presidente",
    slug: "presidente",
    subtitulo: "Liderança e visão para o Reino de Deus",
    descricao: "Conheça o presidente da COMIEADEPA e sua visão para o ministério.",
    heroBadge: "LIDERANÇA",
    seoTitle: "Presidente | COMIEADEPA",
    seoDescription:
      "Conheça o presidente da COMIEADEPA, sua trajetória ministerial e visão para a Convenção.",
    secoes: [
      {
        tipo: "imagem_texto",
        titulo: "Rev. [Nome do Presidente]",
        subtitulo: "Presidente da COMIEADEPA",
        conteudo:
          "Escreva aqui a biografia do presidente. Inclua:\n\n- Data e local de nascimento\n- Chamado ministerial\n- Trajetória na COMIEADEPA\n- Visão para a convenção",
        ordem: 0,
      },
      {
        tipo: "texto",
        titulo: "Mensagem Presidencial",
        subtitulo: "Uma palavra de edificação",
        conteudo:
          "> Escreva aqui a mensagem do presidente para as igrejas e ministérios.",
        ordem: 1,
      },
    ],
    cards: [],
  },
  {
    key: "conselhos",
    titulo: "Conselhos",
    slug: "conselhos",
    subtitulo: "Os conselhos que assessoram a liderança da convenção",
    descricao: "Conheça os conselhos que compõem a estrutura administrativa da COMIEADEPA.",
    heroBadge: "GOVERNANÇA",
    seoTitle: "Conselhos | COMIEADEPA",
    seoDescription:
      "Conheça os conselhos administrativos e consultivos da COMIEADEPA e suas atribuições.",
    secoes: [
      {
        tipo: "texto",
        titulo: "Sobre os Conselhos",
        subtitulo: "Estrutura de governança transparente",
        conteudo:
          "Descreva aqui o papel dos conselhos na estrutura da COMIEADEPA e como são compostos.",
        ordem: 0,
      },
      {
        tipo: "cards",
        titulo: "Nossos Conselhos",
        subtitulo: null,
        conteudo: null,
        ordem: 1,
      },
    ],
    cards: [
      { secaoIndex: 1, titulo: "Conselho Deliberativo", subtitulo: null, descricao: "Responsável pelas decisões estratégicas da convenção.", icone: "Scale", ordem: 0 },
      { secaoIndex: 1, titulo: "Conselho Fiscal", subtitulo: null, descricao: "Responsável pela fiscalização das finanças e patrimônio.", icone: "ClipboardCheck", ordem: 1 },
      { secaoIndex: 1, titulo: "Conselho Consultivo", subtitulo: null, descricao: "Assessora a diretoria com expertise e experiência ministerial.", icone: "MessageSquare", ordem: 2 },
    ],
  },
  {
    key: "comissoes",
    titulo: "Comissões",
    slug: "comissoes",
    subtitulo: "Grupos de trabalho dedicados ao serviço",
    descricao: "As comissões da COMIEADEPA coordenam as diferentes áreas de atuação ministerial.",
    heroBadge: "MINISTÉRIO",
    seoTitle: "Comissões | COMIEADEPA",
    seoDescription:
      "Conheça as comissões de trabalho da COMIEADEPA e suas áreas de atuação.",
    secoes: [
      {
        tipo: "texto",
        titulo: "Sobre as Comissões",
        subtitulo: "Trabalho coordenado em equipe",
        conteudo:
          "Descreva aqui o papel das comissões no trabalho da COMIEADEPA.",
        ordem: 0,
      },
      {
        tipo: "cards",
        titulo: "Nossas Comissões",
        subtitulo: null,
        conteudo: null,
        ordem: 1,
      },
    ],
    cards: [
      { secaoIndex: 1, titulo: "Comissão de Evangelismo", subtitulo: null, descricao: "Coordena as ações evangelísticas da convenção.", icone: "Megaphone", ordem: 0 },
      { secaoIndex: 1, titulo: "Comissão de Missões", subtitulo: null, descricao: "Apoia e envia missionários nacionais e internacionais.", icone: "Globe", ordem: 1 },
      { secaoIndex: 1, titulo: "Comissão de Educação", subtitulo: null, descricao: "Promove a capacitação ministerial e teológica.", icone: "GraduationCap", ordem: 2 },
      { secaoIndex: 1, titulo: "Comissão Social", subtitulo: null, descricao: "Coordena a assistência social às comunidades.", icone: "Heart", ordem: 3 },
    ],
  },
  {
    key: "orgaos",
    titulo: "Órgãos",
    slug: "orgaos",
    subtitulo: "Os órgãos auxiliares da COMIEADEPA",
    descricao: "Conheça os órgãos que compõem a estrutura ministerial da convenção.",
    heroBadge: "ESTRUTURA",
    seoTitle: "Órgãos | COMIEADEPA",
    seoDescription:
      "Conheça os órgãos auxiliares que compõem a estrutura da COMIEADEPA.",
    secoes: [
      {
        tipo: "texto",
        titulo: "Sobre os Órgãos",
        subtitulo: "Organizações que ampliam o alcance do ministério",
        conteudo:
          "Descreva aqui o papel de cada órgão na estrutura da COMIEADEPA.",
        ordem: 0,
      },
      {
        tipo: "cards",
        titulo: "Nossos Órgãos",
        subtitulo: null,
        conteudo: null,
        ordem: 1,
      },
    ],
    cards: [
      { secaoIndex: 1, titulo: "Departamento Feminino", subtitulo: null, descricao: "Ministério dedicado às mulheres das igrejas convencionadas.", icone: "Users", ordem: 0 },
      { secaoIndex: 1, titulo: "Departamento de Jovens", subtitulo: null, descricao: "Alcançando e discipulando a juventude assembleiana.", icone: "Zap", ordem: 1 },
      { secaoIndex: 1, titulo: "Departamento Infantil", subtitulo: null, descricao: "Formando crianças na fé desde os primeiros anos.", icone: "Star", ordem: 2 },
    ],
  },
  {
    key: "memoria",
    titulo: "Memória",
    slug: "memoria",
    subtitulo: "A história que nos formou",
    descricao: "Um registro da trajetória histórica da COMIEADEPA e seu legado no Pará.",
    heroBadge: "HISTÓRIA",
    seoTitle: "Memória Histórica | COMIEADEPA",
    seoDescription:
      "Conheça a memória histórica da COMIEADEPA e a trajetória do movimento assembleiano no Pará.",
    secoes: [
      {
        tipo: "texto",
        titulo: "Linha do Tempo",
        subtitulo: "Marcos históricos da nossa jornada",
        conteudo:
          "## Início do Movimento\n\nDescreva os primeiros passos do movimento assembleiano no Pará.\n\n## Fundação da Convenção\n\nDescreva a criação da COMIEADEPA.\n\n## Crescimento e Expansão\n\nDescreva o crescimento ao longo das décadas.",
        ordem: 0,
      },
      {
        tipo: "cta",
        titulo: "Contribua com a Nossa Memória",
        subtitulo: "Você tem registros históricos?",
        conteudo:
          "Se você possui fotos, documentos ou relatos históricos sobre a COMIEADEPA, entre em contato conosco. Juntos preservamos nossa herança.",
        ordem: 1,
      },
    ],
    cards: [],
  },
];

/* ─── Component ─────────────────────────────────────────────────── */

type Status = "idle" | "loading" | "success" | "error";

type TemplateCreatorProps = {
  canCreate: boolean;
  existingSlugs: string[];
};

export function TemplateCreator({ canCreate, existingSlugs }: TemplateCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  if (!canCreate) return null;

  async function handleCreate(template: Template) {
    if (existingSlugs.includes(template.slug)) {
      setStatus("error");
      setMessage(`O slug "/${template.slug}" já existe. Edite a página existente ou escolha outro template.`);
      return;
    }

    setStatus("loading");
    setMessage(`Criando "${template.titulo}"…`);

    try {
      // 1. Create the page
      const pageRes = await fetch("/api/admin/institucional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: template.titulo,
          slug: template.slug,
          subtitulo: template.subtitulo,
          descricao: template.descricao,
          hero_badge: template.heroBadge,
          hero_overlay_opacity: 0.55,
          hero_alignment: "left",
          seo_title: template.seoTitle,
          seo_description: template.seoDescription,
          status: "rascunho",
          ordem: 99,
        }),
      });

      if (!pageRes.ok) {
        const err = await pageRes.json();
        throw new Error(err.error || "Erro ao criar página.");
      }

      const { id: pageId } = await pageRes.json();

      // 2. Create sections sequentially, tracking IDs for card linking
      const secaoIds: string[] = [];
      for (const secao of template.secoes) {
        const sRes = await fetch("/api/admin/institucional/secoes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            institucional_id: pageId,
            tipo: secao.tipo,
            titulo: secao.titulo,
            subtitulo: secao.subtitulo,
            conteudo: secao.conteudo,
            ordem: secao.ordem,
            ativo: true,
          }),
        });
        if (!sRes.ok) throw new Error("Erro ao criar seção.");
        const { id: secaoId } = await sRes.json();
        secaoIds.push(secaoId);
      }

      // 3. Create cards linked to the correct section IDs
      for (const card of template.cards) {
        const secaoId = secaoIds[card.secaoIndex];
        if (!secaoId) continue;
        const cRes = await fetch("/api/admin/institucional/cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            secao_id: secaoId,
            titulo: card.titulo,
            subtitulo: card.subtitulo,
            descricao: card.descricao,
            icone: card.icone,
            ordem: card.ordem,
            ativo: true,
          }),
        });
        if (!cRes.ok) throw new Error("Erro ao criar card.");
      }

      setStatus("success");
      setMessage(`"${template.titulo}" criada com sucesso como rascunho!`);
      setTimeout(() => window.location.reload(), 1800);
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Erro inesperado.");
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => { setIsOpen(true); setStatus("idle"); setMessage(""); }}
        className="inline-flex items-center gap-2 border border-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white/80 transition hover:border-[#f4cf6a]/60 hover:text-[#f4cf6a]"
      >
        <LayoutTemplate size={14} />
        Criar por Template
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl border border-[#d8c38b] bg-white shadow-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#ead9a6] bg-[#fffaf0] px-6 py-4 shrink-0">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#171006]">
                  Criar por Template
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Escolha um modelo para criar a página com conteúdo inicial em rascunho.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-black transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Status feedback */}
            {status !== "idle" && (
              <div
                className={`mx-6 mt-4 flex items-center gap-3 rounded-lg px-4 py-3 text-sm ${
                  status === "loading" ? "bg-blue-50 text-blue-700" :
                  status === "success" ? "bg-green-50 text-green-700" :
                  "bg-red-50 text-red-700"
                }`}
              >
                {status === "loading" && <Loader2 size={16} className="animate-spin shrink-0" />}
                {status === "success" && <CheckCircle size={16} className="shrink-0" />}
                {status === "error" && <AlertTriangle size={16} className="shrink-0" />}
                <span>{message}</span>
              </div>
            )}

            {/* Template list */}
            <div className="overflow-y-auto p-6 flex-1 grid gap-3">
              {TEMPLATES.map((template) => {
                const alreadyExists = existingSlugs.includes(template.slug);
                const cardCount = template.cards.length;
                const secaoCount = template.secoes.length;

                return (
                  <button
                    key={template.key}
                    disabled={status === "loading" || alreadyExists}
                    onClick={() => handleCreate(template)}
                    className={`group flex items-center justify-between gap-4 rounded-lg border px-5 py-4 text-left transition disabled:cursor-not-allowed ${
                      alreadyExists
                        ? "border-slate-200 bg-slate-50 opacity-50"
                        : "border-[#d8c38b] bg-[#fffaf0] hover:border-[#8b2f2b] hover:bg-white"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-base font-bold text-[#171006]">
                          {template.titulo}
                        </span>
                        {alreadyExists && (
                          <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-700">
                            Já existe
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                        {template.subtitulo}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-[11px] text-slate-400 font-semibold">
                      <span>{secaoCount} seções</span>
                      {cardCount > 0 && <span>{cardCount} cards</span>}
                      <span className="font-mono text-[10px] text-slate-300">/{template.slug}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-[#ead9a6] px-6 py-3 shrink-0">
              <p className="text-[11px] text-slate-400">
                Todas as páginas são criadas como <strong>rascunho</strong>. Publique manualmente após revisar o conteúdo.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
