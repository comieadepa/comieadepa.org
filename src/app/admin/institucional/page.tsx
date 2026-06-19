import { Building2 } from "lucide-react";
import { headers } from "next/headers";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import { listarInstitucionalAdmin } from "@/lib/institucional";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { MediaPickerAsset } from "../media-url-field";
import { InstitucionalManager } from "./institucional-manager";
import { StatusMessage } from "../status-message";

export default async function AdminInstitucionalPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const headerList = await headers();
  const role = normalizeAdminRole(headerList.get("x-admin-role"));

  const canCreate = canPerformAdminAction(role, "institucional", "create");
  const canUpdate = canPerformAdminAction(role, "institucional", "update");
  const canPublish = canPerformAdminAction(role, "institucional", "publish");
  const canDelete = canPerformAdminAction(role, "institucional", "delete");

  // Buscar os registros cadastrados
  const items = await listarInstitucionalAdmin();

  // Buscar assets de mídia para uso no MediaUrlField
  const mediaAssets = await selectSupabaseRows<MediaPickerAsset>(
    "cms_media_assets",
    "select=id,titulo,arquivo_url,tipo&order=created_at.desc&limit=150"
  );

  return (
    <div className="mx-auto max-w-7xl">
      <StatusMessage success={params?.success} error={params?.message ?? params?.error} />

      <section className="mb-6 border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
        <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-center">
          <div className="grid h-14 w-14 place-items-center bg-[#171006] text-[#f4cf6a]">
            <Building2 size={27} />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Módulo Institucional</p>
            <h1 className="mt-2 font-serif text-4xl font-black leading-tight">Páginas Institucionais</h1>
            <p className="mt-3 max-w-4xl leading-7 text-[#5a472c]">
              Gerencie e ordene as páginas institucionais dinâmicas do portal, como conselhos, comissões, órgãos conveniantes e departamentos.
            </p>
          </div>
        </div>
      </section>

      <InstitucionalManager
        initialItems={items}
        mediaAssets={mediaAssets}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canPublish={canPublish}
        canDelete={canDelete}
      />
    </div>
  );
}
