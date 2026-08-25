import { ImageIcon } from "lucide-react";
import { headers } from "next/headers";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import { CmsHomeSlide } from "@/lib/home-slides";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { AdminPageHeader } from "../admin-ui";
import { MediaPickerAsset } from "../media-url-field";
import { StatusMessage } from "../status-message";
import { HomeSlidesManager } from "./home-slides-manager";

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const [mediaAssets, slides] = await Promise.all([
    selectSupabaseRows<MediaPickerAsset>(
      "cms_media_assets",
      "select=id,titulo,arquivo_url,tipo,pasta&order=created_at.desc&limit=60",
    ),
    selectSupabaseRows<CmsHomeSlide>(
      "cms_home_slides",
      "select=id,titulo,subtitulo,descricao,data_label,imagem_url,botao_texto,botao_url,ordem,status,abrir_nova_aba,created_at,updated_at,created_by&order=ordem.asc,updated_at.desc&limit=100",
    ),
  ]);

  const headerList = await headers();
  const role = normalizeAdminRole(headerList.get("x-admin-role"));
  const canCreate = canPerformAdminAction(role, "home", "create");
  const canUpdate = canPerformAdminAction(role, "home", "update");
  const canPublish = canPerformAdminAction(role, "home", "publish");
  const canArchive = canPerformAdminAction(role, "home", "archive");
  const canDelete = canPerformAdminAction(role, "home", "delete");

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <StatusMessage success={params?.success} error={params?.message ?? params?.error} />

      <AdminPageHeader
        icon={ImageIcon}
        eyebrow="Primeira Dobra"
        title="Destaques da Home"
        description="Gerencie os banners que aparecem no destaque principal da página inicial."
      />

      <HomeSlidesManager
        slides={slides}
        assets={mediaAssets}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canPublish={canPublish}
        canArchive={canArchive}
        canDelete={canDelete}
      />
    </div>
  );
}
