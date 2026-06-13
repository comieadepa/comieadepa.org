import { FolderOpen } from "lucide-react";
import { headers } from "next/headers";
import { DocumentsManager } from "./documents-manager";
import { StatusMessage } from "../status-message";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import { CmsDocument } from "@/lib/documentos";
import { selectSupabaseRows } from "@/lib/supabase-admin";

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
      <StatusMessage success={params?.success} error={params?.message ?? params?.error} />

      <section className="mb-6 border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
        <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-center">
          <div className="grid h-14 w-14 place-items-center bg-[#171006] text-[#f4cf6a]">
            <FolderOpen size={27} />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Central de documentos</p>
            <h1 className="mt-2 font-serif text-4xl font-black leading-tight">Organize arquivos oficiais do portal.</h1>
            <p className="mt-3 max-w-4xl leading-7 text-[#5a472c]">
              Cadastre atas, estatutos, formularios, circulares, editais e outros materiais oficiais com capa opcional,
              categoria, destaque e controle de downloads.
            </p>
          </div>
        </div>
      </section>

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
