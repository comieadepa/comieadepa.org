import { Building2 } from "lucide-react";
import { headers } from "next/headers";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import { listarInstitucionalAdmin } from "@/lib/institucional";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { MediaPickerAsset } from "../media-url-field";
import { InstitucionalManager } from "./institucional-manager";
import { StatusMessage } from "../status-message";
import { AdminPageHeader, AdminSubNavTabs } from "../admin-ui";

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
      <AdminSubNavTabs
        tabs={[
          { href: "/admin/institucional", label: "Estrutura Institucional", active: true },
          { href: "/admin/paginas", label: "Páginas Avulsas", active: false },
        ]}
      />

      <StatusMessage success={params?.success} error={params?.error ?? params?.message} />

      <AdminPageHeader
        icon={Building2}
        eyebrow="Módulo Institucional"
        title="Estrutura e Páginas Institucionais"
        description="Gerencie e ordene as páginas institucionais dinâmicas do portal, como conselhos, comissões, órgãos conveniados e departamentos."
      />

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
