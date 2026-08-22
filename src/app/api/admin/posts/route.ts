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
  const acceptsJson = request.headers.get("accept")?.includes("application/json") || request.headers.get("x-requested-with") === "fetch";

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

  const role = resolveAdminRoleFromHeaders(request.headers);

  if (action && id) {
    const actionPermission = action === "publish" ? "publish" : action === "archive" ? "archive" : "update";
    if (!canPerformAdminAction(role, "noticias", actionPermission)) {
      if (acceptsJson) {
        return Response.json({ error: "Sem permissão para alterar o status da notícia." }, { status: 403 });
      }
      return redirectWithStatus(request.url, "/admin/noticias", "error", "Sem permissao para alterar o status da noticia.");
    }

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

      if (acceptsJson) {
        return Response.json({ ok: true, id, status, message: "Status da notícia atualizado com sucesso." });
      }

      return redirectWithStatus(request.url, "/admin/noticias", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar status da notícia.";
      if (acceptsJson) {
        return Response.json({ error: message }, { status: 500 });
      }
      return redirectWithStatus(request.url, "/admin/noticias", "error", message);
    }
  }

  if (!title) {
    if (acceptsJson) {
      return Response.json({ error: "Informe o título da notícia." }, { status: 400 });
    }
    return redirectWithStatus(request.url, "/admin/noticias", "error", "Informe o título da notícia.");
  }

  const writeAction = id ? "update" : "create";
  if (!canPerformAdminAction(role, "noticias", writeAction)) {
    if (acceptsJson) {
      return Response.json({ error: "Sem permissão para salvar notícias." }, { status: 403 });
    }
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
      destaque_home: formData.get("destaque_home") === "on" || formData.get("destaque_home") === "true",
      updated_at: new Date().toISOString(),
    };

    let postId = id;

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
      postId = inserted[0]?.id || "";
      await createAuditLog({
        request,
        action: "create",
        entity: "noticia",
        entityId: postId,
        entityTitle: title,
        metadata: { status, destaque_home: payload.destaque_home },
      });
    }

    if (acceptsJson) {
      return Response.json({
        ok: true,
        id: postId,
        slug: payload.slug,
        status: payload.status,
        message: id ? "Notícia atualizada com sucesso." : "Notícia criada com sucesso.",
      });
    }

    return redirectWithStatus(request.url, "/admin/noticias", "success");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao salvar notícia.";
    if (acceptsJson) {
      return Response.json({ error: message }, { status: 500 });
    }
    return redirectWithStatus(request.url, "/admin/noticias", "error", message);
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
