import { Images } from "lucide-react";
import { headers } from "next/headers";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { AdminPageHeader } from "../admin-ui";
import { StatusMessage } from "../status-message";
import { MediaAsset, MediaLibraryManager } from "./media-library-manager";

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; message?: string; pasta?: string }>;
}) {
  const params = await searchParams;
  const headerList = await headers();
  const role = normalizeAdminRole(headerList.get("x-admin-role"));
  const canUpload = canPerformAdminAction(role, "midia", "upload");
  const canDelete = canPerformAdminAction(role, "midia", "delete");

  const assets = await selectSupabaseRows<MediaAsset>(
    "cms_media_assets",
    "select=id,titulo,arquivo_url,tipo,pasta,created_at&order=created_at.desc&limit=300",
  );

  return (
    <div className="mx-auto max-w-7xl">
      <StatusMessage success={params?.success} error={params?.message ?? params?.error} />

      <AdminPageHeader
        icon={Images}
        eyebrow="Biblioteca Central de Mídia"
        title="Acervo e Recursos Visuais do Portal"
        description="Envie e organize imagens, capas, logotipos, banners e documentos oficiais para reutilização em Notícias, Galerias, Vídeos e Páginas Institucionais."
      />

      <MediaLibraryManager
        initialAssets={assets}
        canUpload={canUpload}
        canDelete={canDelete}
      />
    </div>
  );
}

