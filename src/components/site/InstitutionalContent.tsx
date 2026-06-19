import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  FileText,
  Download,
  ArrowRight,
  Quote,
} from "lucide-react";
import type { CmsInstitucionalSecao } from "@/app/api/admin/institucional/secoes/route";
import type { CmsInstitucionalCard } from "@/app/api/admin/institucional/cards/route";
import type { CmsInstitucionalDocumento } from "@/app/api/admin/institucional/documentos/route";
import {
  buildDocumentDownloadPath,
  formatDocumentSize,
  inferDocumentType,
} from "@/lib/documentos";

/* ─── Types ───────────────────────────────────────────────────── */

type LucideIconMap = Record<string, React.ComponentType<{ size?: number; className?: string }>>;

export type InstitutionalContentProps = {
  descricao?: string | null;
  conteudo?: string | null;
  secoes?: CmsInstitucionalSecao[];
  cards?: CmsInstitucionalCard[];
  linkedDocs?: CmsInstitucionalDocumento[];
};

/* ─── Section heading helpers ─────────────────────────────────── */

function SectionTitle({ children, center = false }: { children: ReactNode; center?: boolean }) {
  return (
    <h2
      className={`font-serif text-3xl font-black leading-tight text-[#0F3B63] sm:text-4xl ${center ? "text-center" : ""}`}
    >
      {children}
    </h2>
  );
}

function SectionSubtitle({ children, center = false }: { children: ReactNode; center?: boolean }) {
  return (
    <p
      className={`font-serif text-lg italic leading-7 text-[#B8872D] ${center ? "text-center" : ""}`}
    >
      {children}
    </p>
  );
}

/* ─── Markdown renderer ───────────────────────────────────────── */

function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);

  return parts.map((part, i) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <a
          key={i}
          href={link[2]}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-[#0F3B63] underline underline-offset-4 hover:text-[#B8872D] transition-colors"
        >
          {link[1]}
        </a>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-black text-[#1F2937]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic text-[#374151]">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

function renderContent(content: string): ReactNode[] {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  function flushParagraph() {
    if (!paragraph.length) return;
    const text = paragraph.join(" ").trim();
    blocks.push(
      <p key={`p-${blocks.length}`} className="text-[17px] leading-[1.85] text-[#374151]">
        {renderInline(text)}
      </p>
    );
    paragraph = [];
  }

  function flushList() {
    if (!list.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="space-y-3 border-l-2 border-[#D4A24C]/40 pl-6">
        {list.map((item, idx) => (
          <li
            key={idx}
            className="relative pl-5 text-[17px] leading-[1.8] text-[#374151] before:absolute before:left-0 before:top-[0.55em] before:h-[7px] before:w-[7px] before:rounded-full before:bg-[#B8872D]"
          >
            {renderInline(item)}
          </li>
        ))}
      </ul>
    );
    list = [];
  }

  lines.forEach((line) => {
    const t = line.trim();

    if (!t) {
      flushParagraph();
      flushList();
      return;
    }

    const img = t.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (img) {
      flushParagraph();
      flushList();
      blocks.push(
        <figure key={`img-${blocks.length}`} className="overflow-hidden rounded-2xl border border-[#0F3B63]/8 bg-[#F4F6F8] shadow-sm">
          <div
            role="img"
            aria-label={img[1]}
            className="aspect-video w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${img[2]})` }}
          />
          {img[1] && (
            <figcaption className="px-5 py-3 text-sm italic text-[#6B7280] border-t border-slate-100">
              {img[1]}
            </figcaption>
          )}
        </figure>
      );
      return;
    }

    if (t.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <h2
          key={`h2-${blocks.length}`}
          className="pt-6 pb-1 font-serif text-3xl font-black leading-tight text-[#0F3B63] sm:text-4xl"
        >
          {renderInline(t.slice(3))}
        </h2>
      );
      return;
    }

    if (t.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <h3
          key={`h3-${blocks.length}`}
          className="pt-4 pb-0.5 font-serif text-2xl font-black leading-tight text-[#0F3B63]"
        >
          {renderInline(t.slice(4))}
        </h3>
      );
      return;
    }

    if (t.startsWith("> ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <blockquote
          key={`bq-${blocks.length}`}
          className="relative flex gap-4 rounded-xl border border-[#D4A24C]/30 bg-[#fffaf0] px-6 py-5 font-serif text-xl italic leading-8 text-[#0F3B63]"
        >
          <Quote size={24} className="mt-1 shrink-0 text-[#D4A24C]/60" />
          <span>{renderInline(t.slice(2))}</span>
        </blockquote>
      );
      return;
    }

    if (/^[-*]\s+/.test(t)) {
      flushParagraph();
      list.push(t.replace(/^[-*]\s+/, ""));
      return;
    }

    flushList();
    paragraph.push(t);
  });

  flushParagraph();
  flushList();
  return blocks;
}

/* ─── Section renderers ───────────────────────────────────────── */

function SecaoTexto({ secao }: { secao: CmsInstitucionalSecao }) {
  return (
    <div className="space-y-5">
      {secao.titulo && <SectionTitle>{secao.titulo}</SectionTitle>}
      {secao.subtitulo && <SectionSubtitle>{secao.subtitulo}</SectionSubtitle>}
      {secao.conteudo && (
        <div className="space-y-6 pt-2">{renderContent(secao.conteudo)}</div>
      )}
    </div>
  );
}

function SecaoImagemTexto({ secao }: { secao: CmsInstitucionalSecao }) {
  const hasImage = !!secao.imagem_url;
  return (
    <div className={`grid gap-10 items-center ${hasImage ? "md:grid-cols-2" : ""}`}>
      {hasImage && (
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#0F3B63]/8 bg-[#F4F6F8] shadow-sm">
          <Image
            src={secao.imagem_url!}
            alt={secao.titulo || "Imagem de seção"}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="space-y-5">
        {secao.titulo && <SectionTitle>{secao.titulo}</SectionTitle>}
        {secao.subtitulo && <SectionSubtitle>{secao.subtitulo}</SectionSubtitle>}
        {secao.conteudo && (
          <div className="space-y-6 pt-2">{renderContent(secao.conteudo)}</div>
        )}
      </div>
    </div>
  );
}

function SecaoCta({ secao }: { secao: CmsInstitucionalSecao }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#B8872D]/20 bg-gradient-to-br from-[#0F3B63] via-[#15508a] to-[#0a2640] px-8 py-14 text-center shadow-xl sm:px-14 sm:py-16">
      {secao.imagem_url && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.08]"
          style={{ backgroundImage: `url(${secao.imagem_url})` }}
        />
      )}
      {/* Gold top accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#B8872D] to-transparent opacity-70" />

      <div className="relative z-10 mx-auto max-w-2xl space-y-5">
        {secao.titulo && (
          <h2 className="font-serif text-3xl font-black text-white sm:text-4xl">
            {secao.titulo}
          </h2>
        )}
        {secao.subtitulo && (
          <p className="font-serif text-lg italic text-[#f4cf6a]/90">{secao.subtitulo}</p>
        )}
        {secao.conteudo && (
          <div className="space-y-4 pt-2 text-white/85 text-[17px] leading-[1.8]">
            {renderContent(secao.conteudo)}
          </div>
        )}
      </div>
    </div>
  );
}

function SecaoCards({
  secao,
  cards,
}: {
  secao: CmsInstitucionalSecao;
  cards: CmsInstitucionalCard[];
}) {
  const sectionCards = cards.filter((c) => c.secao_id === secao.id);

  return (
    <div>
      {(secao.titulo || secao.subtitulo) && (
        <div className="mb-10 text-center space-y-3">
          {secao.titulo && <SectionTitle center>{secao.titulo}</SectionTitle>}
          {secao.subtitulo && <SectionSubtitle center>{secao.subtitulo}</SectionSubtitle>}
        </div>
      )}
      {secao.conteudo && (
        <div className="mx-auto mb-10 max-w-2xl text-center space-y-4">
          {renderContent(secao.conteudo)}
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {sectionCards.map((card) => {
          // Dynamic Lucide icon resolution
          let IconComponent: React.ComponentType<{ size?: number; className?: string }> | null = null;
          if (card.icone) {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const Lucide = require("lucide-react") as LucideIconMap;
            IconComponent = Lucide[card.icone] ?? null;
          }

          return (
            <div
              key={card.id}
              className="group flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#B8872D]/30 hover:shadow-lg"
            >
              {/* Card image */}
              {card.imagem_url && (
                <div className="relative mb-5 aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-[#F4F6F8]">
                  <Image
                    src={card.imagem_url}
                    alt={card.titulo}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              )}

              {/* Icon + title */}
              <div className="flex items-start gap-3">
                {IconComponent && (
                  <div className="shrink-0 rounded-xl bg-[#fffaf0] p-2.5 text-[#B8872D] transition duration-300 group-hover:bg-[#B8872D] group-hover:text-white">
                    <IconComponent size={20} />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-serif text-xl font-bold leading-snug text-[#0F3B63] transition duration-300 group-hover:text-[#B8872D]">
                    {card.titulo}
                  </h3>
                  {card.subtitulo && (
                    <p className="mt-0.5 text-xs font-semibold text-slate-400">{card.subtitulo}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              {card.descricao && (
                <p className="mt-4 flex-1 text-sm leading-6 text-slate-600">{card.descricao}</p>
              )}

              {/* Link */}
              {card.link_url && (
                <div className="mt-5 border-t border-slate-50 pt-4">
                  <Link
                    href={card.link_url}
                    className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#0F3B63] transition hover:text-[#B8872D]"
                  >
                    {card.link_texto || "Saiba mais"}
                    <ArrowRight size={12} />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SecaoDocumentos({
  secao,
  linkedDocs,
}: {
  secao: CmsInstitucionalSecao;
  linkedDocs: CmsInstitucionalDocumento[];
}) {
  const docs = linkedDocs.filter((ld) => ld.secao_id === secao.id);

  return (
    <div>
      {(secao.titulo || secao.subtitulo) && (
        <div className="mb-10 text-center space-y-3">
          {secao.titulo && <SectionTitle center>{secao.titulo}</SectionTitle>}
          {secao.subtitulo && <SectionSubtitle center>{secao.subtitulo}</SectionSubtitle>}
        </div>
      )}
      {secao.conteudo && (
        <div className="mx-auto mb-10 max-w-2xl text-center space-y-4">
          {renderContent(secao.conteudo)}
        </div>
      )}

      <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
        {docs.map((ld) => {
          const doc = ld.cms_documentos;
          if (!doc) return null;

          const downloadUrl = buildDocumentDownloadPath(doc.slug);
          const fileType = inferDocumentType(doc.tipo_arquivo);
          const fileSize = formatDocumentSize(doc.tamanho);

          const typeColors: Record<string, string> = {
            PDF: "bg-red-50 text-red-600",
            DOC: "bg-blue-50 text-blue-600",
            XLS: "bg-green-50 text-green-600",
            PPT: "bg-orange-50 text-orange-600",
            ZIP: "bg-purple-50 text-purple-600",
          };
          const iconColor = typeColors[fileType] ?? "bg-slate-100 text-slate-500";

          return (
            <div
              key={ld.id}
              className="group flex items-start gap-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:border-[#B8872D]/25 hover:shadow-md"
            >
              {/* File icon */}
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconColor}`}
              >
                <FileText size={22} />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <h3 className="font-serif text-base font-bold leading-snug text-[#0F3B63] line-clamp-2 group-hover:text-[#B8872D] transition-colors">
                  {doc.titulo}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  {doc.categoria && (
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-500">
                      {doc.categoria}
                    </span>
                  )}
                  <span>{fileType}</span>
                  {fileSize && <span>· {fileSize}</span>}
                </div>

                {/* Download button */}
                <a
                  href={downloadUrl}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0F3B63] px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white transition duration-300 hover:bg-[#B8872D]"
                >
                  <Download size={13} />
                  Baixar
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main exported component ─────────────────────────────────── */

export function InstitutionalContent({
  descricao,
  conteudo,
  secoes = [],
  cards = [],
  linkedDocs = [],
}: InstitutionalContentProps) {
  return (
    <div className="mx-auto w-full max-w-[1120px] px-5 py-14 sm:px-8 sm:py-16">
      {/* Short description */}
      {descricao && (
        <div className="mb-10 flex gap-5 rounded-r-2xl border-l-4 border-[#B8872D] bg-[#fffaf0] px-6 py-5">
          <p className="text-lg font-semibold leading-8 text-[#4B5563]">{descricao}</p>
        </div>
      )}

      {/* Main content */}
      {conteudo && (
        <div className="mb-12 space-y-7">{renderContent(conteudo)}</div>
      )}

      {/* Sections */}
      {secoes.length > 0 && (
        <div className="mt-4 space-y-20 border-t border-slate-100/80 pt-16">
          {secoes.map((secao) => (
            <section key={secao.id} id={`secao-${secao.id}`} className="scroll-mt-24">
              {secao.tipo === "texto" && <SecaoTexto secao={secao} />}
              {secao.tipo === "imagem_texto" && <SecaoImagemTexto secao={secao} />}
              {secao.tipo === "cta" && <SecaoCta secao={secao} />}
              {secao.tipo === "cards" && (
                <SecaoCards secao={secao} cards={cards} />
              )}
              {secao.tipo === "documentos" && (
                <SecaoDocumentos secao={secao} linkedDocs={linkedDocs} />
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
