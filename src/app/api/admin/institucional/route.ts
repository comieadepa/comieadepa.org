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
import { CmsInstitucional, normalizeInstitucionalStatus, normalizeHeroAlignment } from "@/lib/institucional";

export async function GET(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  if (!canPerformAdminAction(role, "institucional", "view")) {
    return Response.json({ error: "Sem permissao para visualizar modulo institucional." }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const query = url.searchParams.get("q");

  const baseSelect = "select=id,titulo,slug,status,ordem,subtitulo,descricao,conteudo,hero_image_url,hero_badge,hero_overlay_opacity,hero_alignment,seo_title,seo_description,created_at,updated_at";

  if (id) {
    const rows = await selectSupabaseRows<CmsInstitucional>(
      "cms_institucional",
      `${baseSelect}&id=eq.${encodeURIComponent(id)}&limit=1`
    );
    return Response.json(rows[0] ?? null);
  }

  const filters = [
    query ? `or=(titulo.ilike.*${encodeURIComponent(query.trim())}*,slug.ilike.*${encodeURIComponent(query.trim())}*)` : "",
  ].filter(Boolean);

  const rows = await selectSupabaseRows<CmsInstitucional>(
    "cms_institucional",
    `${baseSelect}${filters.length > 0 ? `&${filters.join("&")}` : ""}&order=ordem.asc,updated_at.desc&limit=100`
  );

  return Response.json(rows);
}

export async function POST(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  if (!canPerformAdminAction(role, "institucional", "create")) {
    return Response.json({ error: "Sem permissao para criar registro institucional." }, { status: 403 });
  }

  try {
    const body = await parseBody(request);

    if (!body.titulo) {
      return Response.json({ error: "Informe o titulo." }, { status: 400 });
    }

    const slug = body.slug || slugify(body.titulo);

    // Verificar se o slug já existe
    const existing = await selectSupabaseRows<CmsInstitucional>(
      "cms_institucional",
      `select=id&slug=eq.${encodeURIComponent(slug)}&limit=1`
    );
    if (existing.length > 0) {
      return Response.json({ error: "O slug gerado para este titulo já está em uso." }, { status: 409 });
    }

    if (body.status === "publicado" && !canPerformAdminAction(role, "institucional", "publish")) {
      return Response.json({ error: "Sem permissao para publicar." }, { status: 403 });
    }

    const payload = {
      titulo: body.titulo,
      slug,
      subtitulo: body.subtitulo,
      descricao: body.descricao,
      conteudo: body.conteudo,
      hero_image_url: body.hero_image_url,
      hero_badge: body.hero_badge,
      hero_overlay_opacity: body.hero_overlay_opacity,
      hero_alignment: body.hero_alignment,
      seo_title: body.seo_title,
      seo_description: body.seo_description,
      status: body.status,
      ordem: body.ordem,
      updated_at: new Date().toISOString(),
    };

    const inserted = (await insertSupabaseRow("cms_institucional", payload)) as Array<{ id?: string }>;

    await createAuditLog({
      request,
      action: "create",
      entity: "institucional",
      entityId: inserted[0]?.id,
      entityTitle: body.titulo,
      metadata: { status: body.status },
    });

    return Response.json({ ok: true, id: inserted[0]?.id });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro ao criar registro institucional." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  if (!canPerformAdminAction(role, "institucional", "update")) {
    return Response.json({ error: "Sem permissao para editar registro institucional." }, { status: 403 });
  }

  try {
    const body = await parseBody(request);

    if (!body.id || !body.titulo) {
      return Response.json({ error: "Informe id e titulo." }, { status: 400 });
    }

    const slug = body.slug || slugify(body.titulo);

    const duplicate = await selectSupabaseRows<CmsInstitucional>(
      "cms_institucional",
      `select=id&slug=eq.${encodeURIComponent(slug)}&id=neq.${encodeURIComponent(body.id)}&limit=1`
    );
    if (duplicate.length > 0) {
      return Response.json({ error: "O slug gerado para este titulo já está em uso." }, { status: 409 });
    }

    if (body.status === "publicado" && !canPerformAdminAction(role, "institucional", "publish")) {
      return Response.json({ error: "Sem permissao para publicar." }, { status: 403 });
    }

    const payload = {
      titulo: body.titulo,
      slug,
      subtitulo: body.subtitulo,
      descricao: body.descricao,
      conteudo: body.conteudo,
      hero_image_url: body.hero_image_url,
      hero_badge: body.hero_badge,
      hero_overlay_opacity: body.hero_overlay_opacity,
      hero_alignment: body.hero_alignment,
      seo_title: body.seo_title,
      seo_description: body.seo_description,
      status: body.status,
      ordem: body.ordem,
      updated_at: new Date().toISOString(),
    };

    await updateSupabaseRows("cms_institucional", `id=eq.${encodeURIComponent(body.id)}`, payload);

    await createAuditLog({
      request,
      action: "update",
      entity: "institucional",
      entityId: body.id,
      entityTitle: body.titulo,
      metadata: { status: body.status },
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro ao atualizar registro institucional." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  if (!canPerformAdminAction(role, "institucional", "delete")) {
    return Response.json({ error: "Sem permissao para excluir registro institucional." }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Informe o id." }, { status: 400 });
  }

  try {
    const current = await selectSupabaseRows<CmsInstitucional>(
      "cms_institucional",
      `select=titulo&id=eq.${encodeURIComponent(id)}&limit=1`
    );

    await deleteSupabaseRows("cms_institucional", `id=eq.${encodeURIComponent(id)}`);

    if (current[0]) {
      await createAuditLog({
        request,
        action: "delete",
        entity: "institucional",
        entityId: id,
        entityTitle: current[0].titulo,
      });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro ao excluir registro institucional." },
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
      titulo: json.titulo,
      slug: json.slug ?? "",
      subtitulo: json.subtitulo ?? null,
      descricao: json.descricao ?? null,
      conteudo: json.conteudo ?? null,
      hero_image_url: json.hero_image_url ?? null,
      hero_badge: json.hero_badge ?? null,
      hero_overlay_opacity: json.hero_overlay_opacity != null ? Number(json.hero_overlay_opacity) : 0.5,
      hero_alignment: normalizeHeroAlignment(json.hero_alignment),
      seo_title: json.seo_title ?? null,
      seo_description: json.seo_description ?? null,
      status: normalizeInstitucionalStatus(json.status ?? "rascunho"),
      ordem: Number(json.ordem ?? 0),
    };
  } else {
    const formData = await request.formData();
    return {
      id: optionalString(formData, "id"),
      titulo: requiredString(formData, "titulo"),
      slug: optionalString(formData, "slug") ?? "",
      subtitulo: optionalString(formData, "subtitulo"),
      descricao: optionalString(formData, "descricao"),
      conteudo: optionalString(formData, "conteudo"),
      hero_image_url: optionalString(formData, "hero_image_url"),
      hero_badge: optionalString(formData, "hero_badge"),
      hero_overlay_opacity: Number(formData.get("hero_overlay_opacity") ?? 0.5),
      hero_alignment: normalizeHeroAlignment(optionalString(formData, "hero_alignment")),
      seo_title: optionalString(formData, "seo_title"),
      seo_description: optionalString(formData, "seo_description"),
      status: normalizeInstitucionalStatus(requiredString(formData, "status") ?? "rascunho"),
      ordem: Number(formData.get("ordem") || 0),
    };
  }
}
