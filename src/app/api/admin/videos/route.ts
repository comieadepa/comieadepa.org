import {
  createAuditLog,
  getYoutubeId,
  hasSupabaseAdminConfig,
  insertSupabaseRow,
  missingSupabaseAdminResponse,
  optionalString,
  redirectWithStatus,
  requiredString,
  updateSupabaseRows,
} from "@/lib/supabase-admin";
import { canPerformAdminAction, resolveAdminRoleFromHeaders } from "@/lib/admin-permissions";

export async function POST(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const formData = await request.formData();
  const id = requiredString(formData, "id");
  const action = requiredString(formData, "action");
  const title = requiredString(formData, "titulo");
  const youtubeUrl = requiredString(formData, "youtube_url");

  const role = resolveAdminRoleFromHeaders(request.headers);

  if (action && id) {
    if (!canPerformAdminAction(role, "videos", "update")) {
      return redirectWithStatus(request.url, "/admin/videos", "error", "Sem permissao para atualizar videos.");
    }
  }

  if (action && id) {
    try {
      await updateSupabaseRows("cms_videos", `id=eq.${encodeURIComponent(id)}`, {
        ativo: action === "activate",
        updated_at: new Date().toISOString(),
      });
      await createAuditLog({
        request,
        action,
        entity: "video",
        entityId: id,
        metadata: { ativo: action === "activate" },
      });

      return redirectWithStatus(request.url, "/admin/videos", "success");
    } catch (error) {
      return redirectWithStatus(request.url, "/admin/videos", "error", error instanceof Error ? error.message : "Erro ao atualizar vídeo.");
    }
  }

  if (!title || !youtubeUrl) {
    return redirectWithStatus(request.url, "/admin/videos", "error", "Informe título e URL do YouTube.");
  }

  const writeAction = id ? "update" : "create";
  if (!canPerformAdminAction(role, "videos", writeAction)) {
    return redirectWithStatus(request.url, "/admin/videos", "error", "Sem permissao para salvar videos.");
  }

  try {
    const payload = {
      titulo: title,
      youtube_url: youtubeUrl,
      youtube_id: getYoutubeId(youtubeUrl),
      tipo: requiredString(formData, "tipo").toLowerCase() || "video",
      thumbnail_url: optionalString(formData, "thumbnail_url"),
      departamento_id: optionalString(formData, "departamento_id"),
      destaque_home: formData.get("destaque_home") === "on",
      ordem: Number(requiredString(formData, "ordem") || 0),
      ativo: true,
      updated_at: new Date().toISOString(),
    };

    if (id) {
      await updateSupabaseRows("cms_videos", `id=eq.${encodeURIComponent(id)}`, payload);
      await createAuditLog({
        request,
        action: "update",
        entity: "video",
        entityId: id,
        entityTitle: title,
        metadata: { tipo: payload.tipo, destaque_home: payload.destaque_home },
      });
    } else {
      const inserted = (await insertSupabaseRow("cms_videos", payload)) as Array<{ id?: string }>;
      await createAuditLog({
        request,
        action: "create",
        entity: "video",
        entityId: inserted[0]?.id,
        entityTitle: title,
        metadata: { tipo: payload.tipo, destaque_home: payload.destaque_home },
      });
    }

    return redirectWithStatus(request.url, "/admin/videos", "success");
  } catch (error) {
    return redirectWithStatus(request.url, "/admin/videos", "error", error instanceof Error ? error.message : "Erro ao salvar vídeo.");
  }
}
