import {
  createAuditLog,
  deleteSupabaseRows,
  hasSupabaseAdminConfig,
  insertSupabaseRow,
  missingSupabaseAdminResponse,
  optionalDateTime,
  optionalString,
  redirectWithStatus,
  requiredString,
  selectSupabaseRows,
  slugify,
  updateSupabaseRows,
} from "@/lib/supabase-admin";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";

const statusOptions = ["rascunho", "publicado", "arquivado"] as const;
type PageStatus = (typeof statusOptions)[number];

type CmsPage = {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  conteudo: string | null;
  imagem_url: string | null;
  status: PageStatus;
  ordem: number;
  seo_title: string | null;
  seo_description: string | null;
  publicado_em: string | null;
  criado_por: string | null;
  atualizado_por: string | null;
  created_at: string;
  updated_at: string;
};

export async function GET(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  if (!canPerformAdminAction(role, "paginas", "view")) {
    return Response.json({ error: "Sem permissao para visualizar paginas." }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const slug = url.searchParams.get("slug");
  const status = url.searchParams.get("status");

  const baseSelect = "select=id,titulo,slug,resumo,conteudo,imagem_url,status,ordem,seo_title,seo_description,publicado_em,criado_por,atualizado_por,created_at,updated_at";

  if (id || slug) {
    const filter = id
      ? `id=eq.${encodeURIComponent(id)}`
      : `slug=eq.${encodeURIComponent(slug ?? "")}`;
    const rows = await selectSupabaseRows<CmsPage>("cms_paginas", `${baseSelect}&${filter}&limit=1`);
    return Response.json(rows[0] ?? null);
  }

  const statusFilter = status ? `&status=eq.${encodeURIComponent(status)}` : "";
  const rows = await selectSupabaseRows<CmsPage>(
    "cms_paginas",
    `${baseSelect}${statusFilter}&order=ordem.asc,updated_at.desc&limit=200`,
  );
  return Response.json(rows);
}

export async function POST(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  if (!canPerformAdminAction(role, "paginas", "create")) {
    return redirectWithStatus(request.url, "/admin/paginas", "error", "Sem permissao para criar paginas.");
  }

  const formData = await request.formData();
  const title = requiredString(formData, "titulo");
  const rawSlug = requiredString(formData, "slug");
  const slug = slugify(rawSlug || title);

  if (!title || !slug) {
    return redirectWithStatus(request.url, "/admin/paginas", "error", "Informe titulo e slug da pagina.");
  }

  if (rawSlug && rawSlug !== slug) {
    return redirectWithStatus(request.url, "/admin/paginas", "error", "Slug invalido. Use apenas letras, numeros e hifen.");
  }

  const existing = await selectSupabaseRows<CmsPage>(
    "cms_paginas",
    `select=id,slug&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  );
  if (existing.length > 0) {
    return redirectWithStatus(request.url, "/admin/paginas", "error", "Slug ja existe. Escolha outro.");
  }

  const status = normalizeStatus(requiredString(formData, "status"));
  const publishAt = optionalDateTime(formData, "publicado_em");
  const actor = request.headers.get("x-admin-email") ?? "admin";

  try {
    const payload = {
      titulo: title,
      slug,
      resumo: optionalString(formData, "resumo"),
      conteudo: optionalString(formData, "conteudo"),
      imagem_url: optionalString(formData, "imagem_url"),
      status,
      ordem: Number(requiredString(formData, "ordem") || 0),
      seo_title: optionalString(formData, "seo_title"),
      seo_description: optionalString(formData, "seo_description"),
      publicado_em: status === "publicado" && !publishAt ? new Date().toISOString() : publishAt,
      criado_por: actor,
      atualizado_por: actor,
      updated_at: new Date().toISOString(),
    };

    const inserted = (await insertSupabaseRow("cms_paginas", payload)) as Array<{ id?: string }>;
    await createAuditLog({
      request,
      action: "create",
      entity: "pagina",
      entityId: inserted[0]?.id,
      entityTitle: title,
      metadata: { status },
    });

    return redirectWithStatus(request.url, "/admin/paginas", "success");
  } catch (error) {
    return redirectWithStatus(request.url, "/admin/paginas", "error", error instanceof Error ? error.message : "Erro ao criar pagina.");
  }
}

export async function PUT(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  if (!canPerformAdminAction(role, "paginas", "update")) {
    return Response.json({ error: "Sem permissao para atualizar paginas." }, { status: 403 });
  }

  const formData = await request.formData();
  const id = requiredString(formData, "id");
  const title = requiredString(formData, "titulo");
  const rawSlug = requiredString(formData, "slug");
  const slug = slugify(rawSlug || title);

  if (!id || !title || !slug) {
    return Response.json({ error: "Informe id, titulo e slug." }, { status: 400 });
  }

  if (rawSlug && rawSlug !== slug) {
    return Response.json({ error: "Slug invalido. Use apenas letras, numeros e hifen." }, { status: 400 });
  }

  const duplicate = await selectSupabaseRows<CmsPage>(
    "cms_paginas",
    `select=id,slug&slug=eq.${encodeURIComponent(slug)}&id=neq.${encodeURIComponent(id)}&limit=1`,
  );
  if (duplicate.length > 0) {
    return Response.json({ error: "Slug ja existe. Escolha outro." }, { status: 409 });
  }

  const status = normalizeStatus(requiredString(formData, "status"));
  const publishAt = optionalDateTime(formData, "publicado_em");
  const actor = request.headers.get("x-admin-email") ?? "admin";

  try {
    await updateSupabaseRows("cms_paginas", `id=eq.${encodeURIComponent(id)}`, {
      titulo: title,
      slug,
      resumo: optionalString(formData, "resumo"),
      conteudo: optionalString(formData, "conteudo"),
      imagem_url: optionalString(formData, "imagem_url"),
      status,
      ordem: Number(requiredString(formData, "ordem") || 0),
      seo_title: optionalString(formData, "seo_title"),
      seo_description: optionalString(formData, "seo_description"),
      publicado_em: status === "publicado" && !publishAt ? new Date().toISOString() : publishAt,
      atualizado_por: actor,
      updated_at: new Date().toISOString(),
    });

    await createAuditLog({
      request,
      action: "update",
      entity: "pagina",
      entityId: id,
      entityTitle: title,
      metadata: { status },
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao atualizar pagina." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const hardDelete = url.searchParams.get("hard") === "1";

  if (!id) {
    return Response.json({ error: "Informe o id." }, { status: 400 });
  }

  if (hardDelete) {
    if (role !== "admin") {
      return Response.json({ error: "Somente admin pode excluir definitivamente." }, { status: 403 });
    }

    try {
      await deleteSupabaseRows("cms_paginas", `id=eq.${encodeURIComponent(id)}`);
      await createAuditLog({ request, action: "delete", entity: "pagina", entityId: id });
      return Response.json({ ok: true });
    } catch (error) {
      return Response.json({ error: error instanceof Error ? error.message : "Erro ao excluir pagina." }, { status: 500 });
    }
  }

  if (!canPerformAdminAction(role, "paginas", "archive")) {
    return Response.json({ error: "Sem permissao para arquivar paginas." }, { status: 403 });
  }

  try {
    await updateSupabaseRows("cms_paginas", `id=eq.${encodeURIComponent(id)}`, {
      status: "arquivado",
      updated_at: new Date().toISOString(),
    });
    await createAuditLog({ request, action: "archive", entity: "pagina", entityId: id });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao arquivar pagina." }, { status: 500 });
  }
}

function normalizeStatus(value: string): PageStatus {
  const normalized = value.toLowerCase();
  const match = statusOptions.find((status) => status === normalized);
  return match ?? "rascunho";
}
