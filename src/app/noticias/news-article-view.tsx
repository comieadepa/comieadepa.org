import { ArrowLeft, CalendarDays } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export type NewsArticleViewPost = {
  titulo: string;
  resumo: string | null;
  conteudo: string | null;
  capa_url: string | null;
  autor_nome: string | null;
  label?: string;
  publicado_em: string | null;
  created_at: string;
};

type NewsArticleViewProps = {
  post: NewsArticleViewPost;
  backHref?: string;
  backLabel?: string;
  preview?: boolean;
};

export function NewsArticleView({ post, backHref = "/noticias", backLabel = "Notícias", preview = false }: NewsArticleViewProps) {
  return (
    <main className="min-h-screen bg-[#120f0a] text-[#fff7e5]">
      {preview ? (
        <div className="bg-[#f4cf6a] px-5 py-3 text-center text-xs font-black uppercase tracking-[0.16em] text-[#171006]">
          Prévia administrativa
        </div>
      ) : null}
      <article>
        <header className="relative overflow-hidden px-5 py-16 sm:px-8">
          {post.capa_url ? <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${post.capa_url})` }} /> : null}
          <div className="absolute inset-0 bg-gradient-to-b from-[#120f0a]/82 via-[#120f0a]/92 to-[#120f0a]" />
          <div className="relative mx-auto max-w-4xl">
            <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-[#f4cf6a] transition hover:text-white">
              <ArrowLeft size={18} />
              {backLabel}
            </Link>
            <div className="mt-10">
              <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#f4cf6a]">
                <CalendarDays size={15} />
                {formatDate(post.publicado_em ?? post.created_at)}
              </span>
              {post.label ? (
                <span className="ml-0 mt-4 inline-flex border border-[#f4cf6a]/30 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#f4cf6a] sm:ml-4 sm:mt-0">
                  {post.label}
                </span>
              ) : null}
              <h1 className="mt-6 font-serif text-4xl font-black leading-[1.04] text-white sm:text-6xl">{post.titulo}</h1>
              {post.resumo ? <p className="mt-6 text-xl leading-8 text-white/66">{post.resumo}</p> : null}
              {post.autor_nome ? <p className="mt-5 text-sm font-bold uppercase tracking-[0.16em] text-white/44">Por {post.autor_nome}</p> : null}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-5 pb-20 sm:px-8">
          <div className="max-w-none space-y-6 text-lg leading-8 text-white/72">
            {renderContent(post.conteudo ?? post.resumo ?? "")}
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
      <p key={`p-${blocks.length}`} className="text-lg leading-8 text-white/72">
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
      <ul key={`ul-${blocks.length}`} className="space-y-3 border-l border-[#f4cf6a]/35 pl-6 text-white/72">
        {list.map((item, index) => (
          <li key={`${item}-${index}`} className="relative pl-4 before:absolute before:left-0 before:top-3 before:h-1.5 before:w-1.5 before:bg-[#f4cf6a]">
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
        <figure key={`img-${blocks.length}`} className="overflow-hidden border border-white/10 bg-white/[0.055]">
          <div aria-label={image[1]} role="img" className="aspect-video w-full bg-cover bg-center" style={{ backgroundImage: `url(${image[2]})` }} />
          {image[1] ? <figcaption className="px-4 py-3 text-sm text-white/50">{image[1]}</figcaption> : null}
        </figure>,
      );
      return;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <h2 key={`h2-${blocks.length}`} className="pt-4 font-serif text-3xl font-black leading-tight text-white sm:text-4xl">
          {renderInline(trimmed.slice(3))}
        </h2>,
      );
      return;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <h3 key={`h3-${blocks.length}`} className="pt-2 font-serif text-2xl font-black leading-tight text-white">
          {renderInline(trimmed.slice(4))}
        </h3>,
      );
      return;
    }

    if (trimmed.startsWith("> ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <blockquote key={`quote-${blocks.length}`} className="border-l-4 border-[#f4cf6a] bg-white/[0.055] px-5 py-4 font-serif text-2xl leading-9 text-white">
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
        <a key={`${part}-${index}`} href={link[2]} target="_blank" rel="noreferrer" className="font-semibold text-[#f4cf6a] underline underline-offset-4">
          {link[1]}
        </a>
      );
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${part}-${index}`} className="font-black text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={`${part}-${index}`} className="text-white/86">
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
