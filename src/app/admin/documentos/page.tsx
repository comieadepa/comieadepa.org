import { FolderOpen } from "lucide-react";
import { headers } from "next/headers";
import { DocumentsManager } from "./documents-manager";
import { StatusMessage } from "../status-message";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import { CmsDocument } from "@/lib/documentos";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { AdminPageHeader } from "../admin-ui";

export default async function AdminDocumentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const headerList = await headers();
  const role = normalizeAdminRole(headerList.get("x-admin-role"));
  const canCreate = canPerformAdminAction(role, "documentos", "create");
  const canUpdate = canPerformAdminAction(role, "documentos", "update");
  const canPublish = canPerformAdminAction(role, "documentos", "publish");
  const canArchive = canPerformAdminAction(role, "documentos", "archive");
  const canDelete = canPerformAdminAction(role, "documentos", "delete");

  const documents = await selectSupabaseRows<CmsDocument>(
    "cms_documentos",
    "select=id,titulo,slug,descricao,categoria,arquivo_url,thumbnail_url,tipo_arquivo,tamanho,ordem,downloads,destaque,status,created_at,updated_at,created_by&order=destaque.desc,ordem.asc,updated_at.desc&limit=200",
  );

  const categories = Array.from(new Set(documents.map((document) => document.categoria?.trim()).filter(isNonEmptyString))).sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );

  return (
    <div className="mx-auto max-w-7xl">
      <StatusMessage success={params?.success} error={params?.error ?? params?.message} />

      <AdminPageHeader
        icon={FolderOpen}
        eyebrow="Central de Documentos"
        title="Organize arquivos oficiais do portal"
        description="Cadastre atas, estatutos, formulários, circulares, editais e materiais oficiais com controle de downloads, destaque e categorias."
      />

      <DocumentsManager
        documents={documents}
        categories={categories}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canPublish={canPublish}
        canArchive={canArchive}
        canDelete={canDelete}
      />
    </div>
  );
}

function isNonEmptyString(value: string | null | undefined): value is string {
  return Boolean(value);
}
