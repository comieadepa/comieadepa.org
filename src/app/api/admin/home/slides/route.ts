import {
  createAuditLog,
  deleteSupabaseRows,
  hasSupabaseAdminConfig,
  insertSupabaseRow,
  missingSupabaseAdminResponse,
  optionalString,
  redirectWithStatus,
  requiredString,
  selectSupabaseRows,
  updateSupabaseRows,
} from "@/lib/supabase-admin";
import { canPerformAdminAction, resolveAdminRoleFromHeaders } from "@/lib/admin-permissions";
import { CmsHomeSlide, normalizeHomeSlideStatus } from "@/lib/home-slides";

export async function GET(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = resolveAdminRoleFromHeaders(request.headers);
  if (!canPerformAdminAction(role, "home", "view")) {
    return Response.json({ error: "Sem permissao para visualizar slides." }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const status = url.searchParams.get("status");

  const baseSelect =
    "select=id,titulo,subtitulo,descricao,data_label,imagem_url,botao_texto,botao_url,ordem,status,abrir_nova_aba,created_at,updated_at,created_by";

  if (id) {
    const rows = await selectSupabaseRows<CmsHomeSlide>(
      "cms_home_slides",
      `${baseSelect}&id=eq.${encodeURIComponent(id)}&limit=1`,
    );
    return Response.json(rows[0] ?? null);
  }

  const statusFilter = status ? `&status=eq.${encodeURIComponent(status)}` : "";
  const rows = await selectSupabaseRows<CmsHomeSlide>(
    "cms_home_slides",
    `${baseSelect}${statusFilter}&order=ordem.asc,updated_at.desc&limit=100`,
  );
  return Response.json(rows);
}

export async function POST(request: Request) {
  const acceptsJson =
    request.headers.get("accept")?.includes("application/json") || request.headers.get("x-requested-with") === "fetch";

  if (!hasSupabaseAdminConfig()) {
    if (acceptsJson) {
      return Response.json({ error: "Configuração do Supabase ausente." }, { status: 500 });
    }
    return missingSupabaseAdminResponse();
  }

  const role = resolveAdminRoleFromHeaders(request.headers);
  if (!canPerformAdminAction(role, "home", "create")) {
    if (acceptsJson) {
      return Response.json({ error: "Sem permissão para criar slides." }, { status: 403 });
    }
    return redirectWithStatus(request.url, "/admin/home", "error", "Sem permissao para criar slides.");
  }

  const formData = await request.formData();
  const titulo = requiredString(formData, "titulo");
  const imagemUrl = requiredString(formData, "imagem_url");
  const status = normalizeHomeSlideStatus(requiredString(formData, "status"));

  if (!titulo || !imagemUrl) {
    if (acceptsJson) {
      return Response.json({ error: "Informe título e imagem do slide." }, { status: 400 });
    }
    return redirectWithStatus(request.url, "/admin/home", "error", "Informe titulo e imagem do slide.");
  }

  if (status === "publicado" && !canPerformAdminAction(role, "home", "publish")) {
    if (acceptsJson) {
      return Response.json({ error: "Sem permissão para publicar slides." }, { status: 403 });
    }
    return redirectWithStatus(request.url, "/admin/home", "error", "Sem permissao para publicar slides.");
  }

  try {
    const inserted = (await insertSupabaseRow("cms_home_slides", {
      titulo,
      subtitulo: optionalString(formData, "subtitulo"),
      descricao: optionalString(formData, "descricao"),
      data_label: optionalString(formData, "data_label"),
      imagem_url: imagemUrl,
      botao_texto: optionalString(formData, "botao_texto"),
      botao_url: optionalString(formData, "botao_url"),
      ordem: Number(requiredString(formData, "ordem") || 0),
      status,
      abrir_nova_aba: formData.get("abrir_nova_aba") === "on",
      created_by: null,
      updated_at: new Date().toISOString(),
    })) as Array<{ id?: string }>;

    const savedId = inserted[0]?.id;

    await createAuditLog({
      request,
      action: "create",
      entity: "home_slide",
      entityId: savedId,
      entityTitle: titulo,
      metadata: { status },
    });

    if (acceptsJson) {
      return Response.json({ ok: true, id: savedId, message: "Slide criado com sucesso!" });
    }

    return redirectWithStatus(request.url, "/admin/home", "success");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar slide.";
    if (acceptsJson) {
      return Response.json({ error: message }, { status: 500 });
    }
    return redirectWithStatus(request.url, "/admin/home", "error", message);
  }
}

export async function PUT(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = resolveAdminRoleFromHeaders(request.headers);
  if (!canPerformAdminAction(role, "home", "update")) {
    return Response.json({ error: "Sem permissao para atualizar slides." }, { status: 403 });
  }

  const formData = await request.formData();
  const id = requiredString(formData, "id");
  const titulo = requiredString(formData, "titulo");
  const imagemUrl = requiredString(formData, "imagem_url");
  const status = normalizeHomeSlideStatus(requiredString(formData, "status"));

  if (!id || !titulo || !imagemUrl) {
    return Response.json({ error: "Informe id, titulo e imagem." }, { status: 400 });
  }

  if (status === "publicado" && !canPerformAdminAction(role, "home", "publish")) {
    return Response.json({ error: "Sem permissao para publicar slides." }, { status: 403 });
  }

  if (status === "arquivado" && !canPerformAdminAction(role, "home", "archive")) {
    return Response.json({ error: "Sem permissao para arquivar slides." }, { status: 403 });
  }

  try {
    await updateSupabaseRows("cms_home_slides", `id=eq.${encodeURIComponent(id)}`, {
      titulo,
      subtitulo: optionalString(formData, "subtitulo"),
      descricao: optionalString(formData, "descricao"),
      data_label: optionalString(formData, "data_label"),
      imagem_url: imagemUrl,
      botao_texto: optionalString(formData, "botao_texto"),
      botao_url: optionalString(formData, "botao_url"),
      ordem: Number(requiredString(formData, "ordem") || 0),
      status,
      abrir_nova_aba: formData.get("abrir_nova_aba") === "on",
      updated_at: new Date().toISOString(),
    });

    await createAuditLog({
      request,
      action: "update",
      entity: "home_slide",
      entityId: id,
      entityTitle: titulo,
      metadata: { status },
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao atualizar slide." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = resolveAdminRoleFromHeaders(request.headers);
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const hardDelete = url.searchParams.get("hard") === "1";

  if (!id) {
    return Response.json({ error: "Informe o id." }, { status: 400 });
  }

  if (hardDelete) {
    if (!canPerformAdminAction(role, "home", "delete")) {
      return Response.json({ error: "Sem permissao para excluir slides." }, { status: 403 });
    }

    try {
      await deleteSupabaseRows("cms_home_slides", `id=eq.${encodeURIComponent(id)}`);
      await createAuditLog({ request, action: "delete", entity: "home_slide", entityId: id });
      return Response.json({ ok: true });
    } catch (error) {
      return Response.json({ error: error instanceof Error ? error.message : "Erro ao excluir slide." }, { status: 500 });
    }
  }

  if (!canPerformAdminAction(role, "home", "archive")) {
    return Response.json({ error: "Sem permissao para arquivar slides." }, { status: 403 });
  }

  try {
    await updateSupabaseRows("cms_home_slides", `id=eq.${encodeURIComponent(id)}`, {
      status: "arquivado",
      updated_at: new Date().toISOString(),
    });
    await createAuditLog({ request, action: "archive", entity: "home_slide", entityId: id });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao arquivar slide." }, { status: 500 });
  }
}
