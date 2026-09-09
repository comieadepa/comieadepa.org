import { ImageIcon } from "lucide-react";
import { headers } from "next/headers";
import { GalleriesManager } from "./galleries-manager";
import { StatusMessage } from "../status-message";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import { CmsGallery, CmsGalleryPhoto } from "@/lib/galerias";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { AdminPageHeader, AdminSubNavTabs } from "../admin-ui";
import { MediaPickerAsset } from "../media-url-field";

export default async function AdminGalleriesPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; message?: string; tab?: string }>;
}) {
  const params = await searchParams;
  const headerList = await headers();
  const role = normalizeAdminRole(headerList.get("x-admin-role"));
  const canCreate = canPerformAdminAction(role, "galerias", "create");
  const canUpdate = canPerformAdminAction(role, "galerias", "update");
  const canPublish = canPerformAdminAction(role, "galerias", "publish");
  const canArchive = canPerformAdminAction(role, "galerias", "archive");
  const canDelete = canPerformAdminAction(role, "galerias", "delete");

  const [galleries, photos, mediaAssets, dbCategories] = await Promise.all([
    selectSupabaseRows<CmsGallery>(
      "cms_galerias",
      "select=id,titulo,slug,descricao,categoria,capa_url,status,destaque,ordem,data_evento,created_at,updated_at,created_by&order=destaque.desc,data_evento.desc.nullslast,ordem.asc,updated_at.desc&limit=200",
    ),
    selectSupabaseRows<CmsGalleryPhoto>(
      "cms_galeria_fotos",
      "select=id,galeria_id,imagem_url,legenda,credito,ordem,created_at&order=galeria_id.asc,ordem.asc,created_at.asc&limit=1000",
    ),
    selectSupabaseRows<MediaPickerAsset>(
      "cms_media_assets",
      "select=id,titulo,arquivo_url,tipo,pasta&order=created_at.desc&limit=50",
    ),
    selectSupabaseRows<{ id: string; nome: string }>(
      "cms_categorias",
      "select=id,nome&order=nome.asc&limit=100",
    ),
  ]);

  const categories = Array.from(
    new Set([
      ...dbCategories.map((c) => c.nome?.trim()).filter(Boolean),
      ...galleries.map((gallery) => gallery.categoria?.trim()).filter((value): value is string => Boolean(value)),
    ]),
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));

  return (
    <div className="mx-auto max-w-7xl">
      <AdminSubNavTabs
        tabs={[
          { href: "/admin/galerias", label: "Todas as galerias", active: params?.tab !== "categorias" },
          { href: "/admin/galerias?tab=categorias", label: "Categorias", active: params?.tab === "categorias" },
        ]}
      />

      <StatusMessage success={params?.success} error={params?.error ?? params?.message} />

      <AdminPageHeader
        icon={ImageIcon}
        eyebrow="Galeria de Fotos"
        title={params?.tab === "categorias" ? "Categorias de Galerias" : "Organize acervos fotográficos do portal"}
        description={
          params?.tab === "categorias"
            ? "Cadastre e organize as categorias utilizadas na classificação dos acervos fotográficos."
            : "Cadastre galerias com capa, categoria, data do evento, destaque e gerenciamento completo de fotos, legendas e créditos."
        }
      />

      <GalleriesManager
        galleries={galleries}
        photos={photos}
        categories={categories}
        mediaAssets={mediaAssets}
        activeTab={params?.tab === "categorias" ? "categorias" : "galerias"}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canPublish={canPublish}
        canArchive={canArchive}
        canDelete={canDelete}
      />
    </div>
  );
}
