import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildSeoMetadata } from "@/lib/seo";
import { selectPublicRows } from "@/lib/supabase-public";
import { PageView } from "../page-view";

type CmsPage = {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  conteudo: string | null;
  imagem_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  publicado_em: string | null;
  created_at: string;
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pages = await selectPublicRows<CmsPage>(
    "cms_paginas",
    `select=id,titulo,slug,resumo,conteudo,imagem_url,seo_title,seo_description,publicado_em,created_at&status=eq.publicado&slug=eq.${encodeURIComponent(slug)}${getPublishedPagesFilter()}&limit=1`,
  );
  const page = pages[0];

  if (!page) {
    return buildSeoMetadata({
      title: "Página não encontrada | COMIEADEPA",
      description: "A página solicitada não está disponível no portal institucional da COMIEADEPA.",
      path: `/paginas/${slug}`,
    });
  }

  return buildSeoMetadata({
    title: page.seo_title?.trim() || `${page.titulo} | COMIEADEPA`,
    description: page.seo_description || stripContent(page.conteudo) || page.resumo || "Página institucional da COMIEADEPA.",
    path: `/paginas/${page.slug}`,
    image: page.imagem_url,
    type: "article",
  });
}

export default async function PublicPage({ params }: PageProps) {
  const { slug } = await params;
  const pages = await selectPublicRows<CmsPage>(
    "cms_paginas",
    `select=id,titulo,slug,resumo,conteudo,imagem_url,publicado_em,created_at&status=eq.publicado&slug=eq.${encodeURIComponent(slug)}${getPublishedPagesFilter()}&limit=1`,
  );
  const page = pages[0];

  if (!page) {
    notFound();
  }

  return <PageView page={page} backHref="/" backLabel="Voltar ao portal" />;
}

function getPublishedPagesFilter() {
  return `&or=(publicado_em.is.null,publicado_em.lte.${encodeURIComponent(new Date().toISOString())})`;
}

function stripContent(value: string | null) {
  return value
    ?.replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_`-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}
