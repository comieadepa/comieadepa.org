import { Users } from "lucide-react";
import { headers } from "next/headers";
import { StatusMessage } from "../status-message";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import { listarTodosNoAdmin, listarGruposAdmin } from "@/lib/mesa-diretora";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { MediaPickerAsset } from "../media-url-field";
import { MesaDiretoraManager } from "./mesa-diretora-manager";
import { AdminPageHeader, AdminSubNavTabs } from "../admin-ui";

export default async function AdminMesaDiretoraPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const headerList = await headers();
  const role = normalizeAdminRole(headerList.get("x-admin-role"));

  const canCreate = canPerformAdminAction(role, "mesa_diretora", "create");
  const canUpdate = canPerformAdminAction(role, "mesa_diretora", "update");
  const canPublish = canPerformAdminAction(role, "mesa_diretora", "publish");
  const canDelete = canPerformAdminAction(role, "mesa_diretora", "delete");

  // Buscar todos os membros no banco de dados
  const members = await listarTodosNoAdmin();

  // Buscar todos os grupos cadastrados
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
          { href: "/admin/mesa-diretora", label: "Membros da Mesa", active: true },
          { href: "/admin/mesa-diretora/grupos", label: "Grupos e Comissões", active: false },
        ]}
      />

      <StatusMessage success={params?.success} error={params?.error ?? params?.message} />

      <AdminPageHeader
        icon={Users}
        eyebrow="Mesa Diretora"
        title="Membros da Mesa Diretora"
        description="Gerencie os pastores e líderes que compõem a diretoria e conselhos da convenção, organizados por hierarquia e exibidos dinamicamente no portal."
      />

      <MesaDiretoraManager
        initialMembers={members}
        groups={groups}
        mediaAssets={mediaAssets}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canPublish={canPublish}
        canDelete={canDelete}
      />
    </div>
  );
}
