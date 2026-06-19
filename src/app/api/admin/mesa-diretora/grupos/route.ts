import {
  createAuditLog,
  hasSupabaseAdminConfig,
  insertSupabaseRow,
  missingSupabaseAdminResponse,
  optionalString,
  requiredString,
  selectSupabaseRows,
  updateSupabaseRows,
  deleteSupabaseRows,
  slugify,
} from "@/lib/supabase-admin";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import { CmsMesaGrupo, MesaDiretoraLayout } from "@/lib/mesa-diretora";

export async function GET(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  if (!canPerformAdminAction(role, "mesa_diretora", "view")) {
    return Response.json({ error: "Sem permissao para visualizar grupos." }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const query = url.searchParams.get("q");

  const baseSelect = "select=id,nome,slug,descricao,subtitulo,bg_image_url,title_color,ordem,ativo,layout,created_at,updated_at,created_by";

  if (id) {
    const rows = await selectSupabaseRows<CmsMesaGrupo>(
      "cms_mesa_grupos",
      `${baseSelect}&id=eq.${encodeURIComponent(id)}&limit=1`
    );
    return Response.json(rows[0] ?? null);
  }

  const filters = [
    query ? `or=(nome.ilike.*${encodeURIComponent(query.trim())}*,slug.ilike.*${encodeURIComponent(query.trim())}*)` : "",
  ].filter(Boolean);

  const rows = await selectSupabaseRows<CmsMesaGrupo>(
    "cms_mesa_grupos",
    `${baseSelect}${filters.length > 0 ? `&${filters.join("&")}` : ""}&order=ordem.asc,updated_at.desc&limit=100`
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
    return Response.json({ error: "Sem permissao para criar grupo." }, { status: 403 });
  }

  try {
    const body = await parseBody(request);

    if (!body.nome) {
      return Response.json({ error: "Informe o nome do grupo." }, { status: 400 });
    }

    const slug = body.slug || slugify(body.nome);

    // Verificar se o slug já existe
    const existing = await selectSupabaseRows<CmsMesaGrupo>(
      "cms_mesa_grupos",
      `select=id&slug=eq.${encodeURIComponent(slug)}&limit=1`
    );
    if (existing.length > 0) {
      return Response.json({ error: "O slug gerado para este nome de grupo já está em uso." }, { status: 409 });
    }

    // Buscar o uuid do usuario logado no cms_admin_users
    const adminUser = await selectSupabaseRows<{ id: string }>(
      "cms_admin_users",
      `select=id&email=eq.${encodeURIComponent(email)}&limit=1`
    );
    const userId = adminUser[0]?.id || null;

    const payload = {
      nome: body.nome,
      slug,
      descricao: body.descricao,
      subtitulo: body.subtitulo,
      bg_image_url: body.bg_image_url,
      title_color: body.title_color,
      ordem: body.ordem,
      ativo: body.ativo,
      layout: body.layout,
      created_by: userId,
      updated_at: new Date().toISOString(),
    };

    const inserted = (await insertSupabaseRow("cms_mesa_grupos", payload)) as Array<{ id?: string }>;

    await createAuditLog({
      request,
      action: "create",
      entity: "mesa_diretora_grupo",
      entityId: inserted[0]?.id,
      entityTitle: body.nome,
      metadata: { layout: body.layout, ativo: body.ativo },
    });

    return Response.json({ ok: true, id: inserted[0]?.id });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro ao criar grupo." },
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
    return Response.json({ error: "Sem permissao para editar grupo." }, { status: 403 });
  }

  try {
    const body = await parseBody(request);

    if (!body.id || !body.nome) {
      return Response.json({ error: "Informe id e nome do grupo." }, { status: 400 });
    }

    const slug = body.slug || slugify(body.nome);

    const duplicate = await selectSupabaseRows<CmsMesaGrupo>(
      "cms_mesa_grupos",
      `select=id&slug=eq.${encodeURIComponent(slug)}&id=neq.${encodeURIComponent(body.id)}&limit=1`
    );
    if (duplicate.length > 0) {
      return Response.json({ error: "O slug gerado para este nome de grupo já está em uso." }, { status: 409 });
    }

    const payload = {
      nome: body.nome,
      slug,
      descricao: body.descricao,
      subtitulo: body.subtitulo,
      bg_image_url: body.bg_image_url,
      title_color: body.title_color,
      ordem: body.ordem,
      ativo: body.ativo,
      layout: body.layout,
      updated_at: new Date().toISOString(),
    };

    await updateSupabaseRows("cms_mesa_grupos", `id=eq.${encodeURIComponent(body.id)}`, payload);

    await createAuditLog({
      request,
      action: "update",
      entity: "mesa_diretora_grupo",
      entityId: body.id,
      entityTitle: body.nome,
      metadata: { layout: body.layout, ativo: body.ativo },
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro ao atualizar grupo." },
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
    return Response.json({ error: "Sem permissao para excluir grupo." }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Informe o id." }, { status: 400 });
  }

  try {
    // Verificar se há membros associados ao grupo
    const members = await selectSupabaseRows<{ id: string }>(
      "cms_mesa_diretora",
      `select=id&grupo_id=eq.${encodeURIComponent(id)}&limit=1`
    );
    if (members.length > 0) {
      return Response.json(
        { error: "Não é possível excluir o grupo porque ele possui membros associados." },
        { status: 400 }
      );
    }

    const current = await selectSupabaseRows<CmsMesaGrupo>(
      "cms_mesa_grupos",
      `select=nome&id=eq.${encodeURIComponent(id)}&limit=1`
    );

    await deleteSupabaseRows("cms_mesa_grupos", `id=eq.${encodeURIComponent(id)}`);

    if (current[0]) {
      await createAuditLog({
        request,
        action: "delete",
        entity: "mesa_diretora_grupo",
        entityId: id,
        entityTitle: current[0].nome,
      });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro ao excluir grupo." },
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
      slug: json.slug ?? "",
      descricao: json.descricao ?? null,
      subtitulo: json.subtitulo ?? null,
      bg_image_url: json.bg_image_url ?? null,
      title_color: json.title_color ?? null,
      ordem: Number(json.ordem ?? 0),
      ativo: Boolean(json.ativo),
      layout: (json.layout ?? "grid3") as MesaDiretoraLayout,
    };
  } else {
    const formData = await request.formData();
    return {
      id: optionalString(formData, "id"),
      nome: requiredString(formData, "nome"),
      slug: optionalString(formData, "slug") ?? "",
      descricao: optionalString(formData, "descricao"),
      subtitulo: optionalString(formData, "subtitulo"),
      bg_image_url: optionalString(formData, "bg_image_url"),
      title_color: optionalString(formData, "title_color"),
      ordem: Number(formData.get("ordem") || 0),
      ativo: formData.get("ativo") === "on" || formData.get("ativo") === "true",
      layout: (requiredString(formData, "layout") ?? "grid3") as MesaDiretoraLayout,
    };
  }
}
