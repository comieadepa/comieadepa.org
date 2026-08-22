import { countSupabaseRows, selectSupabaseRows } from "@/lib/supabase-admin";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import { MediaPickerAsset } from "../media-url-field";
import { AdminSubNavTabs } from "../admin-ui";
import { headers } from "next/headers";
import { CmsCategory, CmsDepartmentOption, CmsPost, NoticiasEditorClient } from "./noticias-editor-client";

const pageSize = 15;

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    success?: string;
    error?: string;
    message?: string;
    edit?: string;
    status?: string;
    q?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const headerList = await headers();
  const role = normalizeAdminRole(headerList.get("x-admin-role"));

  const canCreate = canPerformAdminAction(role, "noticias", "create");
  const canUpdate = canPerformAdminAction(role, "noticias", "update");
  const canPublish = canPerformAdminAction(role, "noticias", "publish");
  const canArchive = canPerformAdminAction(role, "noticias", "archive");

  const statusFilter = params?.status ?? "todos";
  const searchQuery = (params?.q ?? "").trim();
  const page = Math.max(1, Number(params?.page ?? "1") || 1);
  const offset = (page - 1) * pageSize;

  let filterQuery = "";
  if (statusFilter !== "todos") {
    filterQuery += `&status=eq.${encodeURIComponent(statusFilter)}`;
  }
  if (searchQuery) {
    filterQuery += `&or=(titulo.ilike.*${encodeURIComponent(searchQuery)}*,slug.ilike.*${encodeURIComponent(searchQuery)}*)`;
  }

  const [posts, totalPosts, mediaAssets, categories, departments, specificEditingPost] = await Promise.all([
    selectSupabaseRows<CmsPost>(
      "cms_posts",
      `select=id,titulo,slug,status,categoria_id,departamento_id,resumo,conteudo,capa_url,destaque_home,publicado_em,created_at${filterQuery}&order=created_at.desc&limit=${pageSize}&offset=${offset}`,
    ),
    countSupabaseRows("cms_posts", `select=id${filterQuery}`),
    selectSupabaseRows<MediaPickerAsset>("cms_media_assets", "select=id,titulo,arquivo_url,tipo,pasta&order=created_at.desc&limit=50"),
    selectSupabaseRows<CmsCategory>("cms_categorias", "select=id,nome&order=nome.asc"),
    selectSupabaseRows<CmsDepartmentOption>("cms_departamentos", "select=id,nome&ativo=eq.true&order=ordem.asc,nome.asc"),
    params?.edit
      ? selectSupabaseRows<CmsPost>(
          "cms_posts",
          `select=id,titulo,slug,status,categoria_id,departamento_id,resumo,conteudo,capa_url,destaque_home,publicado_em,created_at&id=eq.${encodeURIComponent(params.edit)}&limit=1`,
        )
      : Promise.resolve([]),
  ]);

  const editingPost = specificEditingPost[0] ?? posts.find((p) => p.id === params?.edit) ?? null;

  return (
    <div className="mx-auto max-w-7xl">
      <AdminSubNavTabs
        tabs={[
          { href: "/admin/noticias", label: "Todas as notícias", active: true },
          { href: "/admin/categorias", label: "Categorias", active: false },
        ]}
      />

      <NoticiasEditorClient
        posts={posts}
        totalPosts={totalPosts}
        pageSize={pageSize}
        page={page}
        currentStatus={statusFilter}
        searchQuery={searchQuery}
        categories={categories}
        departments={departments}
        mediaAssets={mediaAssets}
        editingPost={editingPost}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canPublish={canPublish}
        canArchive={canArchive}
      />
    </div>
  );
}
