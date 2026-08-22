import { FileText } from "lucide-react";
import { headers } from "next/headers";
import { PagesManager } from "./pages-manager";
import { StatusMessage } from "../status-message";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import type { MediaPickerAsset } from "../media-url-field";
import { AdminPageHeader, AdminSubNavTabs } from "../admin-ui";

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
      <AdminSubNavTabs
        tabs={[
          { href: "/admin/institucional", label: "Estrutura Institucional", active: false },
          { href: "/admin/paginas", label: "Páginas Avulsas", active: true },
        ]}
      />

      <StatusMessage success={params?.success} error={params?.error ?? params?.message} />

      <AdminPageHeader
        icon={FileText}
        eyebrow="Páginas Institucionais"
        title="Crie e organize páginas avulsas do portal"
        description="Publique páginas com conteúdo livre formatado, resumo, imagem de capa e otimização para mecanismos de busca (SEO)."
      />

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
