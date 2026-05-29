import { FileText } from "lucide-react";
import { headers } from "next/headers";
import { PagesManager } from "./pages-manager";
import { StatusMessage } from "../status-message";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import type { MediaPickerAsset } from "../media-url-field";

type CmsPage = {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  conteudo: string | null;
  imagem_url: string | null;
  status: "rascunho" | "publicado" | "arquivado";
  ordem: number;
  seo_title: string | null;
  seo_description: string | null;
  publicado_em: string | null;
  created_at: string;
};

export default async function AdminPagesPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const headerList = await headers();
  const role = normalizeAdminRole(headerList.get("x-admin-role"));
  const canCreate = canPerformAdminAction(role, "paginas", "create");
  const canUpdate = canPerformAdminAction(role, "paginas", "update");
  const canPublish = canPerformAdminAction(role, "paginas", "publish");
  const canArchive = canPerformAdminAction(role, "paginas", "archive");
  const canDelete = canPerformAdminAction(role, "paginas", "delete");

  const [pages, assets] = await Promise.all([
    selectSupabaseRows<CmsPage>(
      "cms_paginas",
      "select=id,titulo,slug,resumo,conteudo,imagem_url,status,ordem,seo_title,seo_description,publicado_em,created_at&order=ordem.asc,updated_at.desc&limit=200",
    ),
    selectSupabaseRows<MediaPickerAsset>(
      "cms_media_assets",
      "select=id,titulo,arquivo_url,tipo,pasta&order=created_at.desc&limit=40",
    ),
  ]);

  return (
    <div className="mx-auto max-w-7xl">
      <StatusMessage success={params?.success} error={params?.message ?? params?.error} />

      <section className="mb-6 border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
        <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-center">
          <div className="grid h-14 w-14 place-items-center bg-[#171006] text-[#f4cf6a]">
            <FileText size={27} />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Páginas institucionais</p>
            <h1 className="mt-2 font-serif text-4xl font-black leading-tight">Crie e organize páginas do portal.</h1>
            <p className="mt-3 max-w-4xl leading-7 text-[#5a472c]">
              Utilize este módulo para publicar páginas institucionais com conteúdo completo, SEO e imagem de capa.
            </p>
          </div>
        </div>
      </section>

      <PagesManager
        pages={pages}
        assets={assets}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canPublish={canPublish}
        canArchive={canArchive}
        canDelete={canDelete}
      />
    </div>
  );
}
