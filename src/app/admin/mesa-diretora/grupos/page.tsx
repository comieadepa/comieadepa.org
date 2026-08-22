import { ListChecks } from "lucide-react";
import { headers } from "next/headers";
import { StatusMessage } from "../../status-message";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import { listarGruposAdmin } from "@/lib/mesa-diretora";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { MediaPickerAsset } from "../../media-url-field";
import { MesaDiretoraGroupsManager } from "./grupos-manager";
import { AdminPageHeader, AdminSubNavTabs } from "../../admin-ui";

export default async function AdminMesaDiretoraGroupsPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const headerList = await headers();
  const role = normalizeAdminRole(headerList.get("x-admin-role"));

  const canCreate = canPerformAdminAction(role, "mesa_diretora", "create");
  const canUpdate = canPerformAdminAction(role, "mesa_diretora", "update");
  const canDelete = canPerformAdminAction(role, "mesa_diretora", "delete");

  // Buscar todos os grupos no banco de dados
  const groups = await listarGruposAdmin();

  // Buscar imagens disponíveis na biblioteca de mídia para seleção
  const mediaAssets = await selectSupabaseRows<MediaPickerAsset>(
    "cms_media_assets",
    "select=id,titulo,arquivo_url,tipo&order=created_at.desc&limit=150"
  );

  return (
    <div className="mx-auto max-w-7xl">
      <AdminSubNavTabs
        tabs={[
          { href: "/admin/mesa-diretora", label: "Membros da Mesa", active: false },
          { href: "/admin/mesa-diretora/grupos", label: "Grupos e Comissões", active: true },
        ]}
      />

      <StatusMessage success={params?.success} error={params?.error ?? params?.message} />

      <AdminPageHeader
        icon={ListChecks}
        eyebrow="Mesa Diretora"
        title="Grupos e Comissões da Mesa"
        description="Gerencie e ordene as seções hierárquicas da Mesa Diretora (ex: Diretoria, Conselhos, Comissões). Configure cores de título, imagens de fundo e layouts."
      />

      <MesaDiretoraGroupsManager
        initialGroups={groups}
        mediaAssets={mediaAssets}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />
    </div>
  );
}
