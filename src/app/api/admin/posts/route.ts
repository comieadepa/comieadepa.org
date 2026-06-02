import {
  deleteSupabaseRows,
  createAuditLog,
  hasSupabaseAdminConfig,
  insertSupabaseRow,
  mapPostStatus,
  missingSupabaseAdminResponse,
  optionalDateTime,
  optionalString,
  redirectWithStatus,
  requiredString,
  slugify,
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

  const role = resolveAdminRoleFromHeaders(request.headers);

  if (action && id) {
    const actionPermission = action === "publish" ? "publish" : action === "archive" ? "archive" : "update";
    if (!canPerformAdminAction(role, "noticias", actionPermission)) {
      return redirectWithStatus(request.url, "/admin/noticias", "error", "Sem permissao para alterar o status da noticia.");
    }
  }

  if (action && id) {
    try {
      const status = mapPostActionToStatus(action);
      await updateSupabaseRows("cms_posts", `id=eq.${encodeURIComponent(id)}`, {
        status,
        ...(status === "publicado" ? { publicado_em: new Date().toISOString() } : {}),
        updated_at: new Date().toISOString(),
      });
      await createAuditLog({
        request,
        action,
        entity: "noticia",
        entityId: id,
        metadata: { status },
      });

      return redirectWithStatus(request.url, "/admin/noticias", "success");
    } catch (error) {
      return redirectWithStatus(request.url, "/admin/noticias", "error", error instanceof Error ? error.message : "Erro ao atualizar status da notícia.");
    }
  }

  if (!title) {
    return redirectWithStatus(request.url, "/admin/noticias", "error", "Informe o título da notícia.");
  }

  const writeAction = id ? "update" : "create";
  if (!canPerformAdminAction(role, "noticias", writeAction)) {
    return redirectWithStatus(request.url, "/admin/noticias", "error", "Sem permissao para salvar noticias.");
  }

  try {
    const status = mapPostStatus(requiredString(formData, "status"));
    const publishAt = optionalDateTime(formData, "publicado_em");
    const payload = {
      titulo: title,
      slug: slugify(requiredString(formData, "slug") || title),
      resumo: optionalString(formData, "resumo"),
      conteudo: optionalString(formData, "conteudo"),
      capa_url: optionalString(formData, "capa_url"),
      categoria_id: optionalString(formData, "categoria_id"),
      departamento_id: optionalString(formData, "departamento_id"),
      status,
      autor_nome: optionalString(formData, "autor_nome"),
      publicado_em: status === "publicado" && !publishAt ? new Date().toISOString() : publishAt,
      destaque_home: formData.get("destaque_home") === "on",
      updated_at: new Date().toISOString(),
    };

    if (id) {
      await updateSupabaseRows("cms_posts", `id=eq.${encodeURIComponent(id)}`, payload);
      await createAuditLog({
        request,
        action: "update",
        entity: "noticia",
        entityId: id,
        entityTitle: title,
        metadata: { status, destaque_home: payload.destaque_home },
      });
    } else {
      const inserted = (await insertSupabaseRow("cms_posts", payload)) as Array<{ id?: string }>;
      await createAuditLog({
        request,
        action: "create",
        entity: "noticia",
        entityId: inserted[0]?.id,
        entityTitle: title,
        metadata: { status, destaque_home: payload.destaque_home },
      });
    }

    return redirectWithStatus(request.url, "/admin/noticias", "success");
  } catch (error) {
    return redirectWithStatus(request.url, "/admin/noticias", "error", error instanceof Error ? error.message : "Erro ao salvar notícia.");
  }
}

export async function DELETE(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = resolveAdminRoleFromHeaders(request.headers);
  if (!canPerformAdminAction(role, "noticias", "delete")) {
    return Response.json({ error: "Sem permissao para remover noticias." }, { status: 403 });
  }

  const slug = new URL(request.url).searchParams.get("slug");

  if (!slug) {
    return Response.json({ error: "Informe o slug." }, { status: 400 });
  }

  try {
    await deleteSupabaseRows("cms_posts", `slug=eq.${encodeURIComponent(slug)}`);
    await createAuditLog({
      request,
      action: "delete",
      entity: "noticia",
      entityTitle: slug,
    });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao remover post." }, { status: 500 });
  }
}

function mapPostActionToStatus(action: string) {
  if (action === "publish") {
    return "publicado";
  }

  if (action === "archive") {
    return "arquivado";
  }

  return "rascunho";
}
