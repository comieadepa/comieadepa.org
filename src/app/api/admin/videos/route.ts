import {
  createAuditLog,
  deleteSupabaseRows,
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
  const acceptsJson =
    request.headers.get("accept")?.includes("application/json") || request.headers.get("x-requested-with") === "fetch";

  if (!hasSupabaseAdminConfig()) {
    if (acceptsJson) {
      return Response.json({ error: "Configuração do Supabase ausente." }, { status: 500 });
    }
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
      if (acceptsJson) {
        return Response.json({ error: "Sem permissão para atualizar vídeos." }, { status: 403 });
      }
      return redirectWithStatus(request.url, "/admin/videos", "error", "Sem permissao para atualizar videos.");
    }

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

      if (acceptsJson) {
        return Response.json({ ok: true, id, message: action === "activate" ? "Vídeo ativado com sucesso." : "Vídeo desativado com sucesso." });
      }

      return redirectWithStatus(request.url, "/admin/videos", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar vídeo.";
      if (acceptsJson) {
        return Response.json({ error: message }, { status: 500 });
      }
      return redirectWithStatus(request.url, "/admin/videos", "error", message);
    }
  }

  if (!title || !youtubeUrl) {
    if (acceptsJson) {
      return Response.json({ error: "Informe título e URL do YouTube." }, { status: 400 });
    }
    return redirectWithStatus(request.url, "/admin/videos", "error", "Informe título e URL do YouTube.");
  }

  const writeAction = id ? "update" : "create";
  if (!canPerformAdminAction(role, "videos", writeAction)) {
    if (acceptsJson) {
      return Response.json({ error: "Sem permissão para salvar vídeos." }, { status: 403 });
    }
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

    let savedId = id;

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
      savedId = inserted[0]?.id ?? "";
      await createAuditLog({
        request,
        action: "create",
        entity: "video",
        entityId: savedId,
        entityTitle: title,
        metadata: { tipo: payload.tipo, destaque_home: payload.destaque_home },
      });
    }

    if (acceptsJson) {
      return Response.json({ ok: true, id: savedId, message: id ? "Vídeo atualizado com sucesso." : "Vídeo adicionado com sucesso." });
    }

    return redirectWithStatus(request.url, "/admin/videos", "success");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao salvar vídeo.";
    if (acceptsJson) {
      return Response.json({ error: message }, { status: 500 });
    }
    return redirectWithStatus(request.url, "/admin/videos", "error", message);
  }
}

export async function DELETE(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return Response.json({ error: "Configuração do Supabase ausente." }, { status: 500 });
  }

  const role = resolveAdminRoleFromHeaders(request.headers);
  if (!canPerformAdminAction(role, "videos", "delete")) {
    return Response.json({ error: "Sem permissão para excluir vídeos." }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return Response.json({ error: "Informe o ID do vídeo." }, { status: 400 });
  }

  try {
    await deleteSupabaseRows("cms_videos", `id=eq.${encodeURIComponent(id)}`);
    await createAuditLog({ request, action: "delete", entity: "video", entityId: id });
    return Response.json({ ok: true, message: "Vídeo excluído com sucesso." });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao excluir vídeo." }, { status: 500 });
  }
}
