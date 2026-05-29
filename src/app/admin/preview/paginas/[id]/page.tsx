import { notFound } from "next/navigation";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { PageView } from "@/app/paginas/page-view";

type CmsPage = {
  id: string;
  titulo: string;
  resumo: string | null;
  conteudo: string | null;
  imagem_url: string | null;
  publicado_em: string | null;
  created_at: string;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminPagePreview({ params }: PageProps) {
  const { id } = await params;
  const rows = await selectSupabaseRows<CmsPage>(
    "cms_paginas",
    `select=id,titulo,resumo,conteudo,imagem_url,publicado_em,created_at&id=eq.${encodeURIComponent(id)}&limit=1`,
  );
  const page = rows[0];

  if (!page) {
    notFound();
  }

  return <PageView page={page} backHref="/admin/paginas" backLabel="Voltar ao painel" preview />;
}
