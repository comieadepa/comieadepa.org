import { ArrowRight, FileText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { buildSeoMetadata } from "@/lib/seo";
import { selectPublicRows } from "@/lib/supabase-public";

type CmsPageListItem = {
  titulo: string;
  slug: string;
  resumo: string | null;
  imagem_url: string | null;
  publicado_em: string | null;
  updated_at: string | null;
  created_at: string;
};

export const metadata: Metadata = buildSeoMetadata({
  title: "Páginas institucionais | COMIEADEPA",
  description: "Conteúdos institucionais publicados pela COMIEADEPA.",
  path: "/paginas",
});

export default async function PublicPagesIndex() {
  const pages = await selectPublicRows<CmsPageListItem>(
    "cms_paginas",
    `select=titulo,slug,resumo,imagem_url,publicado_em,updated_at,created_at&status=eq.publicado${getPublishedPagesFilter()}&order=ordem.asc,updated_at.desc&limit=100`,
  );

  return (
    <main className="min-h-screen bg-white text-[#1F2937]">
      <header className="relative overflow-hidden border-b border-[#0F3B63]/10 px-5 py-16 sm:px-8">
        <div className="absolute inset-0 bg-[url('/assets/sede-aerea-comieadepa.jpg')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/96 to-white" />
        <div className="relative mx-auto max-w-6xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-[#0F3B63] transition hover:text-[#4A86B8]">
            COMIEADEPA
          </Link>
          <p className="mt-10 text-sm font-black uppercase tracking-[0.22em] text-[#B8872D]">Institucional</p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl font-black leading-[1.02] text-[#0F3B63] sm:text-7xl">Páginas institucionais</h1>
          <p className="mt-6 max-w-3xl text-xl leading-8 text-[#6B7280]">
            Informações oficiais, documentos editoriais e conteúdos permanentes publicados pela convenção.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        {pages.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {pages.map((page) => (
              <article key={page.slug} className="group overflow-hidden border border-[#0F3B63]/10 bg-white shadow-[0_18px_48px_rgba(15,59,99,.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,59,99,.12)]">
                <Link href={`/paginas/${page.slug}`} className="block">
                  <div
                    className="aspect-[16/9] bg-[#F4F6F8] bg-cover bg-center"
                    style={{ backgroundImage: `url(${page.imagem_url?.trim() || "/assets/sede-aerea-comieadepa.jpg"})` }}
                  />
                  <div className="p-6">
                    <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#B8872D]">
                      <FileText size={15} />
                      {formatDate(page.publicado_em ?? page.updated_at ?? page.created_at)}
                    </span>
                    <h2 className="mt-4 font-serif text-3xl font-black leading-tight text-[#0F3B63]">{page.titulo}</h2>
                    {page.resumo ? <p className="mt-4 line-clamp-3 leading-7 text-[#6B7280]">{page.resumo}</p> : null}
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[#0F3B63] transition group-hover:text-[#B8872D]">
                      Ler página
                      <ArrowRight size={17} />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-[#0F3B63]/10 bg-[#F4F6F8] p-8 text-[#6B7280]">
            Nenhuma página institucional publicada no momento.
          </div>
        )}
      </section>
    </main>
  );
}

function getPublishedPagesFilter() {
  return `&or=(publicado_em.is.null,publicado_em.lte.${encodeURIComponent(new Date().toISOString())})`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}
