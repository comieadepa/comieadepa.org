import {
  createAuditLog,
  hasSupabaseAdminConfig,
  insertSupabaseRow,
  missingSupabaseAdminResponse,
  optionalString,
  redirectWithStatus,
  requiredString,
  selectSupabaseRows,
  updateSupabaseRows,
  deleteSupabaseRows,
} from "@/lib/supabase-admin";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import { normalizeStatus, CmsMesaDiretora } from "@/lib/mesa-diretora";

export async function GET(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  if (!canPerformAdminAction(role, "mesa_diretora", "view")) {
    return Response.json({ error: "Sem permissao para visualizar mesa diretora." }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const grupo_id = url.searchParams.get("grupo_id");
  const status = url.searchParams.get("status");
  const query = url.searchParams.get("q");

  const baseSelect = "select=id,nome,cargo,grupo_id,grupo,campo,foto_url,bio,ordem,status,destaque,created_at,updated_at,created_by";

  if (id) {
    const rows = await selectSupabaseRows<CmsMesaDiretora>(
      "cms_mesa_diretora",
      `${baseSelect}&id=eq.${encodeURIComponent(id)}&limit=1`
    );
    return Response.json(rows[0] ?? null);
  }

  const filters = [
    status ? `status=eq.${encodeURIComponent(status)}` : "",
    grupo_id ? `grupo_id=eq.${encodeURIComponent(grupo_id)}` : "",
    query
      ? `or=(nome.ilike.*${encodeURIComponent(query.trim())}*,cargo.ilike.*${encodeURIComponent(query.trim())}*,campo.ilike.*${encodeURIComponent(query.trim())}*)`
      : "",
  ].filter(Boolean);

  const rows = await selectSupabaseRows<CmsMesaDiretora>(
    "cms_mesa_diretora",
    `${baseSelect}${filters.length > 0 ? `&${filters.join("&")}` : ""}&order=ordem.asc,updated_at.desc&limit=150`
  );

  return Response.json(rows);
}

export async function POST(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  const email = request.headers.get("x-admin-email") ?? "";

  if (!canPerformAdminAction(role, "mesa_diretora", "create")) {
    return Response.json({ error: "Sem permissao para criar membro da mesa diretora." }, { status: 403 });
  }

  try {
    const body = await parseBody(request);

    if (!body.nome || !body.cargo || !body.grupo_id) {
      return Response.json({ error: "Informe nome, cargo e grupo." }, { status: 400 });
    }

    if (body.status === "publicado" && !canPerformAdminAction(role, "mesa_diretora", "publish")) {
      return Response.json({ error: "Sem permissao para publicar." }, { status: 403 });
    }

    // Buscar o uuid do usuario logado no cms_admin_users
    const adminUser = await selectSupabaseRows<{ id: string }>(
      "cms_admin_users",
      `select=id&email=eq.${encodeURIComponent(email)}&limit=1`
    );
    const userId = adminUser[0]?.id || null;

    const payload = {
      nome: body.nome,
      cargo: body.cargo,
      grupo_id: body.grupo_id,
      campo: body.campo,
      foto_url: body.foto_url,
      bio: body.bio,
      ordem: body.ordem,
      status: body.status,
      destaque: body.destaque,
      created_by: userId,
      updated_at: new Date().toISOString(),
    };

    const inserted = (await insertSupabaseRow("cms_mesa_diretora", payload)) as Array<{ id?: string }>;

    await createAuditLog({
      request,
      action: "create",
      entity: "mesa_diretora",
      entityId: inserted[0]?.id,
      entityTitle: body.nome,
      metadata: { grupo_id: body.grupo_id, status: body.status },
    });

    const isHtmlRedirect = !(request.headers.get("content-type") ?? "").includes("application/json");
    if (isHtmlRedirect) {
      return redirectWithStatus(request.url, "/admin/mesa-diretora", "success");
    }

    return Response.json({ ok: true, id: inserted[0]?.id });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro ao criar membro da mesa diretora." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  if (!canPerformAdminAction(role, "mesa_diretora", "update")) {
    return Response.json({ error: "Sem permissao para editar membro da mesa diretora." }, { status: 403 });
  }

  try {
    const body = await parseBody(request);

    if (!body.id || !body.nome || !body.cargo || !body.grupo_id) {
      return Response.json({ error: "Informe id, nome, cargo e grupo." }, { status: 400 });
    }

    if (body.status === "publicado" && !canPerformAdminAction(role, "mesa_diretora", "publish")) {
      return Response.json({ error: "Sem permissao para publicar." }, { status: 403 });
    }

    const payload = {
      nome: body.nome,
      cargo: body.cargo,
      grupo_id: body.grupo_id,
      campo: body.campo,
      foto_url: body.foto_url,
      bio: body.bio,
      ordem: body.ordem,
      status: body.status,
      destaque: body.destaque,
      updated_at: new Date().toISOString(),
    };

    await updateSupabaseRows("cms_mesa_diretora", `id=eq.${encodeURIComponent(body.id)}`, payload);

    await createAuditLog({
      request,
      action: "update",
      entity: "mesa_diretora",
      entityId: body.id,
      entityTitle: body.nome,
      metadata: { grupo_id: body.grupo_id, status: body.status },
    });

    const isHtmlRedirect = !(request.headers.get("content-type") ?? "").includes("application/json");
    if (isHtmlRedirect) {
      return redirectWithStatus(request.url, "/admin/mesa-diretora", "success");
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro ao atualizar membro da mesa diretora." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  if (!canPerformAdminAction(role, "mesa_diretora", "delete")) {
    return Response.json({ error: "Sem permissao para excluir membro da mesa diretora." }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Informe o id." }, { status: 400 });
  }

  try {
    const current = await selectSupabaseRows<CmsMesaDiretora>(
      "cms_mesa_diretora",
      `select=nome&id=eq.${encodeURIComponent(id)}&limit=1`
    );

    await deleteSupabaseRows("cms_mesa_diretora", `id=eq.${encodeURIComponent(id)}`);

    if (current[0]) {
      await createAuditLog({
        request,
        action: "delete",
        entity: "mesa_diretora",
        entityId: id,
        entityTitle: current[0].nome,
      });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro ao excluir membro da mesa diretora." },
      { status: 500 }
    );
  }
}

async function parseBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const json = await request.json();
    return {
      id: json.id,
      nome: json.nome,
      cargo: json.cargo,
      grupo_id: json.grupo_id ?? null,
      campo: json.campo ?? null,
      foto_url: json.foto_url ?? null,
      bio: json.bio ?? null,
      ordem: Number(json.ordem ?? 0),
      status: normalizeStatus(json.status ?? "rascunho"),
      destaque: Boolean(json.destaque),
    };
  } else {
    const formData = await request.formData();
    return {
      id: optionalString(formData, "id"),
      nome: requiredString(formData, "nome"),
      cargo: requiredString(formData, "cargo"),
      grupo_id: optionalString(formData, "grupo_id"),
      campo: optionalString(formData, "campo"),
      foto_url: optionalString(formData, "foto_url"),
      bio: optionalString(formData, "bio"),
      ordem: Number(formData.get("ordem") || 0),
      status: normalizeStatus(requiredString(formData, "status") ?? "rascunho"),
      destaque: formData.get("destaque") === "on" || formData.get("destaque") === "true" || formData.get("destaque") === "1",
    };
  }
}
