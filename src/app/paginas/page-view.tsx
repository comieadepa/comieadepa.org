import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export type PageViewData = {
  titulo: string;
  resumo: string | null;
  conteudo: string | null;
  imagem_url: string | null;
  publicado_em: string | null;
  created_at: string;
};

type PageViewProps = {
  page: PageViewData;
  backHref?: string;
  backLabel?: string;
  preview?: boolean;
};

export function PageView({ page, backHref = "/", backLabel = "Voltar ao portal", preview = false }: PageViewProps) {
  return (
    <main className="min-h-screen bg-white text-[#1F2937]">
      {preview ? (
        <div className="bg-[#0F3B63] px-5 py-3 text-center text-xs font-black uppercase tracking-[0.16em] text-white">
          Prévia administrativa
        </div>
      ) : null}
      <article>
        <header className="relative overflow-hidden px-5 py-16 sm:px-8">
          {page.imagem_url ? <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${page.imagem_url})` }} /> : null}
          <div className="absolute inset-0 bg-gradient-to-b from-white/86 via-white/94 to-white" />
          <div className="relative mx-auto max-w-4xl">
            <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-[#0F3B63] transition hover:text-[#4A86B8]">
              <ArrowLeft size={18} />
              {backLabel}
            </Link>
            <div className="mt-10">
              {page.publicado_em ? (
                <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#B8872D]">
                  {formatDate(page.publicado_em)}
                </span>
              ) : null}
              <h1 className="mt-6 font-serif text-4xl font-black leading-[1.04] text-[#0F3B63] sm:text-6xl">{page.titulo}</h1>
              {page.resumo ? <p className="mt-6 text-xl leading-8 text-[#6B7280]">{page.resumo}</p> : null}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-5 pb-20 sm:px-8">
          <div className="max-w-none space-y-6 text-lg leading-8 text-[#374151]">
            {renderContent(page.conteudo ?? page.resumo ?? "")}
          </div>
        </div>
      </article>
    </main>
  );
}

function renderContent(content: string) {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  function flushParagraph() {
    if (!paragraph.length) {
      return;
    }

    const text = paragraph.join(" ").trim();
    blocks.push(
      <p key={`p-${blocks.length}`} className="text-lg leading-8 text-[#374151]">
        {renderInline(text)}
      </p>,
    );
    paragraph = [];
  }

  function flushList() {
    if (!list.length) {
      return;
    }

    blocks.push(
      <ul key={`ul-${blocks.length}`} className="space-y-3 border-l border-[#D4A24C]/45 pl-6 text-[#374151]">
        {list.map((item, index) => (
          <li key={`${item}-${index}`} className="relative pl-4 before:absolute before:left-0 before:top-3 before:h-1.5 before:w-1.5 before:bg-[#D4A24C]">
            {renderInline(item)}
          </li>
        ))}
      </ul>,
    );
    list = [];
  }

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    const image = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);

    if (image) {
      flushParagraph();
      flushList();
      blocks.push(
        <figure key={`img-${blocks.length}`} className="overflow-hidden rounded-xl border border-[#0F3B63]/10 bg-[#F4F6F8]">
          <div aria-label={image[1]} role="img" className="aspect-video w-full bg-cover bg-center" style={{ backgroundImage: `url(${image[2]})` }} />
          {image[1] ? <figcaption className="px-4 py-3 text-sm text-[#6B7280]">{image[1]}</figcaption> : null}
        </figure>,
      );
      return;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <h2 key={`h2-${blocks.length}`} className="pt-4 font-serif text-3xl font-black leading-tight text-[#0F3B63] sm:text-4xl">
          {renderInline(trimmed.slice(3))}
        </h2>,
      );
      return;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <h3 key={`h3-${blocks.length}`} className="pt-2 font-serif text-2xl font-black leading-tight text-[#0F3B63]">
          {renderInline(trimmed.slice(4))}
        </h3>,
      );
      return;
    }

    if (trimmed.startsWith("> ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <blockquote key={`quote-${blocks.length}`} className="border-l-4 border-[#D4A24C] bg-[#F4F6F8] px-5 py-4 font-serif text-2xl leading-9 text-[#0F3B63]">
          {renderInline(trimmed.slice(2))}
        </blockquote>,
      );
      return;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      list.push(trimmed.replace(/^[-*]\s+/, ""));
      return;
    }

    flushList();
    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();

  return blocks;
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);

  return parts.map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);

    if (link) {
      return (
        <a key={`${part}-${index}`} href={link[2]} target="_blank" rel="noreferrer" className="font-semibold text-[#0F3B63] underline underline-offset-4">
          {link[1]}
        </a>
      );
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${part}-${index}`} className="font-black text-[#1F2937]">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={`${part}-${index}`} className="text-[#1F2937]">
          {part.slice(1, -1)}
        </em>
      );
    }

    return part;
  });
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}
