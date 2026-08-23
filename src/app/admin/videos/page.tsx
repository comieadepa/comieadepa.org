import { DownloadCloud, Youtube } from "lucide-react";
import { headers } from "next/headers";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { AdminPageHeader } from "../admin-ui";
import { MediaPickerAsset } from "../media-url-field";
import { StatusMessage } from "../status-message";
import { CmsDepartmentOption, CmsVideo, VideosManager } from "./videos-manager";

export default async function AdminVideosPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const headerList = await headers();
  const role = normalizeAdminRole(headerList.get("x-admin-role"));
  const canCreate = canPerformAdminAction(role, "videos", "create");
  const canUpdate = canPerformAdminAction(role, "videos", "update");
  const canDelete = canPerformAdminAction(role, "videos", "delete");

  const [videos, mediaAssets, departments] = await Promise.all([
    selectSupabaseRows<CmsVideo>(
      "cms_videos",
      "select=id,titulo,tipo,youtube_url,youtube_id,thumbnail_url,departamento_id,destaque_home,ativo,ordem,created_at&order=destaque_home.desc,ordem.asc,created_at.desc&limit=200",
    ),
    selectSupabaseRows<MediaPickerAsset>(
      "cms_media_assets",
      "select=id,titulo,arquivo_url,tipo,pasta&order=created_at.desc&limit=50",
    ),
    selectSupabaseRows<CmsDepartmentOption>(
      "cms_departamentos",
      "select=id,nome&ativo=eq.true&order=ordem.asc,nome.asc",
    ),
  ]);

  return (
    <div className="mx-auto max-w-7xl">
      <StatusMessage success={params?.success} error={params?.message ?? params?.error} />

      <AdminPageHeader
        icon={Youtube}
        eyebrow="Canal YouTube & Multimídia"
        title="Curadoria de vídeos para o portal"
        description="Cadastre transmissões, lives, shorts e pregações. Escolha os conteúdos que aparecem na página inicial e nas áreas temáticas da convenção."
        action={
          <form action="/api/admin/youtube/import" method="post">
            <button
              type="submit"
              disabled={!canCreate}
              className="inline-flex items-center gap-3 bg-[#ed1d24] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-[#c9181e] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <DownloadCloud size={18} />
              Importar do YouTube
            </button>
          </form>
        }
      />

      <VideosManager
        videos={videos}
        mediaAssets={mediaAssets}
        departments={departments}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />
    </div>
  );
}

