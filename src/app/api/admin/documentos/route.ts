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
  slugify,
  updateSupabaseRows,
  uploadPublicStorageObject,
} from "@/lib/supabase-admin";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import { CmsDocument, inferDocumentType, normalizeDocumentStatus } from "@/lib/documentos";

const maxFileSize = 10 * 1024 * 1024;

export async function GET(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  if (!canPerformAdminAction(role, "documentos", "view")) {
    return Response.json({ error: "Sem permissao para visualizar documentos." }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const slug = url.searchParams.get("slug");
  const status = url.searchParams.get("status");
  const categoria = url.searchParams.get("categoria");
  const query = url.searchParams.get("q");

  const baseSelect =
    "select=id,titulo,slug,descricao,categoria,arquivo_url,thumbnail_url,tipo_arquivo,tamanho,ordem,downloads,destaque,status,created_at,updated_at,created_by";

  if (id || slug) {
    const filter = id
      ? `id=eq.${encodeURIComponent(id)}`
      : `slug=eq.${encodeURIComponent(slug ?? "")}`;
    const rows = await selectSupabaseRows<CmsDocument>("cms_documentos", `${baseSelect}&${filter}&limit=1`);
    return Response.json(rows[0] ?? null);
  }

  const filters = [
    status ? `status=eq.${encodeURIComponent(status)}` : "",
    categoria ? `categoria=eq.${encodeURIComponent(categoria)}` : "",
    query
      ? `or=(titulo.ilike.*${encodeURIComponent(query.trim())}*,descricao.ilike.*${encodeURIComponent(query.trim())}*,categoria.ilike.*${encodeURIComponent(query.trim())}*)`
      : "",
  ].filter(Boolean);

  const rows = await selectSupabaseRows<CmsDocument>(
    "cms_documentos",
    `${baseSelect}${filters.length > 0 ? `&${filters.join("&")}` : ""}&order=destaque.desc,ordem.asc,updated_at.desc&limit=200`,
  );

  return Response.json(rows);
}

export async function POST(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  if (!canPerformAdminAction(role, "documentos", "create")) {
    return redirectWithStatus(request.url, "/admin/documentos", "error", "Sem permissao para criar documentos.");
  }

  const formData = await request.formData();
  const title = requiredString(formData, "titulo");
  const rawSlug = requiredString(formData, "slug");
  const slug = slugify(rawSlug || title);

  if (!title || !slug) {
    return redirectWithStatus(request.url, "/admin/documentos", "error", "Informe titulo e slug do documento.");
  }

  if (rawSlug && rawSlug !== slug) {
    return redirectWithStatus(request.url, "/admin/documentos", "error", "Slug invalido. Use apenas letras, numeros e hifen.");
  }

  const status = normalizeDocumentStatus(requiredString(formData, "status"));
  if (status === "publicado" && !canPerformAdminAction(role, "documentos", "publish")) {
    return redirectWithStatus(request.url, "/admin/documentos", "error", "Sem permissao para publicar documentos.");
  }

  const existing = await selectSupabaseRows<CmsDocument>(
    "cms_documentos",
    `select=id,slug&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  );
  if (existing.length > 0) {
    return redirectWithStatus(request.url, "/admin/documentos", "error", "Slug ja existe. Escolha outro.");
  }

  const file = readOptionalFile(formData, "arquivo");
  if (!file) {
    return redirectWithStatus(request.url, "/admin/documentos", "error", "Selecione um arquivo para o documento.");
  }

  const invalidSizeMessage = validateFileSize(file);
  if (invalidSizeMessage) {
    return redirectWithStatus(request.url, "/admin/documentos", "error", invalidSizeMessage);
  }

  const thumbnail = readOptionalFile(formData, "thumbnail");
  const thumbnailError = thumbnail ? validateFileSize(thumbnail) : null;
  if (thumbnailError) {
    return redirectWithStatus(request.url, "/admin/documentos", "error", thumbnailError);
  }

  const actor = request.headers.get("x-admin-email") ?? "admin";

  try {
    const [uploadedFile, uploadedThumbnail] = await Promise.all([
      uploadPublicStorageObject(file, "documentos"),
      thumbnail ? uploadPublicStorageObject(thumbnail, "documentos-capas") : Promise.resolve(null),
    ]);

    const payload = {
      titulo: title,
      slug,
      descricao: optionalString(formData, "descricao"),
      categoria: optionalString(formData, "categoria"),
      arquivo_url: uploadedFile.publicUrl,
      thumbnail_url: uploadedThumbnail?.publicUrl ?? null,
      tipo_arquivo: inferDocumentType(file.type || file.name),
      tamanho: file.size,
      ordem: Number(requiredString(formData, "ordem") || 0),
      downloads: 0,
      destaque: formData.get("destaque") === "on",
      status,
      created_by: actor,
      updated_at: new Date().toISOString(),
    };

    const inserted = (await insertSupabaseRow("cms_documentos", payload)) as Array<{ id?: string }>;
    await createAuditLog({
      request,
      action: "create",
      entity: "documento",
      entityId: inserted[0]?.id,
      entityTitle: title,
      metadata: { status, categoria: payload.categoria, tipo_arquivo: payload.tipo_arquivo },
    });

    return redirectWithStatus(request.url, "/admin/documentos", "success");
  } catch (error) {
    return redirectWithStatus(
      request.url,
      "/admin/documentos",
      "error",
      error instanceof Error ? error.message : "Erro ao criar documento.",
    );
  }
}

export async function PUT(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  if (!canPerformAdminAction(role, "documentos", "update")) {
    return Response.json({ error: "Sem permissao para atualizar documentos." }, { status: 403 });
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

  const current = (
    await selectSupabaseRows<CmsDocument>(
      "cms_documentos",
      `select=id,titulo,slug,descricao,categoria,arquivo_url,thumbnail_url,tipo_arquivo,tamanho,ordem,downloads,destaque,status,created_at,updated_at,created_by&id=eq.${encodeURIComponent(id)}&limit=1`,
    )
  )[0];

  if (!current) {
    return Response.json({ error: "Documento nao encontrado." }, { status: 404 });
  }

  const duplicate = await selectSupabaseRows<CmsDocument>(
    "cms_documentos",
    `select=id,slug&slug=eq.${encodeURIComponent(slug)}&id=neq.${encodeURIComponent(id)}&limit=1`,
  );
  if (duplicate.length > 0) {
    return Response.json({ error: "Slug ja existe. Escolha outro." }, { status: 409 });
  }

  const status = normalizeDocumentStatus(requiredString(formData, "status"));
  if (status === "publicado" && !canPerformAdminAction(role, "documentos", "publish")) {
    return Response.json({ error: "Sem permissao para publicar documentos." }, { status: 403 });
  }
  if (status === "arquivado" && !canPerformAdminAction(role, "documentos", "archive")) {
    return Response.json({ error: "Sem permissao para arquivar documentos." }, { status: 403 });
  }

  const file = readOptionalFile(formData, "arquivo");
  const fileError = file ? validateFileSize(file) : null;
  if (fileError) {
    return Response.json({ error: fileError }, { status: 400 });
  }

  const thumbnail = readOptionalFile(formData, "thumbnail");
  const thumbnailError = thumbnail ? validateFileSize(thumbnail) : null;
  if (thumbnailError) {
    return Response.json({ error: thumbnailError }, { status: 400 });
  }

  const actor = request.headers.get("x-admin-email") ?? "admin";

  try {
    const [uploadedFile, uploadedThumbnail] = await Promise.all([
      file ? uploadPublicStorageObject(file, "documentos") : Promise.resolve(null),
      thumbnail ? uploadPublicStorageObject(thumbnail, "documentos-capas") : Promise.resolve(null),
    ]);

    const arquivoUrl = uploadedFile?.publicUrl ?? current.arquivo_url;
    if (!arquivoUrl) {
      return Response.json({ error: "O documento precisa ter um arquivo principal." }, { status: 400 });
    }

    await updateSupabaseRows("cms_documentos", `id=eq.${encodeURIComponent(id)}`, {
      titulo: title,
      slug,
      descricao: optionalString(formData, "descricao"),
      categoria: optionalString(formData, "categoria"),
      arquivo_url: arquivoUrl,
      thumbnail_url: uploadedThumbnail?.publicUrl ?? current.thumbnail_url,
      tipo_arquivo: uploadedFile ? inferDocumentType(file?.type || file?.name) : current.tipo_arquivo,
      tamanho: uploadedFile ? file?.size ?? current.tamanho : current.tamanho,
      ordem: Number(requiredString(formData, "ordem") || 0),
      downloads: current.downloads,
      destaque: formData.get("destaque") === "on",
      status,
      created_by: current.created_by ?? actor,
      updated_at: new Date().toISOString(),
    });

    await createAuditLog({
      request,
      action: "update",
      entity: "documento",
      entityId: id,
      entityTitle: title,
      metadata: { status, categoria: optionalString(formData, "categoria") },
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao atualizar documento." }, { status: 500 });
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
      await deleteSupabaseRows("cms_documentos", `id=eq.${encodeURIComponent(id)}`);
      await createAuditLog({ request, action: "delete", entity: "documento", entityId: id });
      return Response.json({ ok: true });
    } catch (error) {
      return Response.json({ error: error instanceof Error ? error.message : "Erro ao excluir documento." }, { status: 500 });
    }
  }

  if (!canPerformAdminAction(role, "documentos", "archive")) {
    return Response.json({ error: "Sem permissao para arquivar documentos." }, { status: 403 });
  }

  try {
    await updateSupabaseRows("cms_documentos", `id=eq.${encodeURIComponent(id)}`, {
      status: "arquivado",
      updated_at: new Date().toISOString(),
    });
    await createAuditLog({ request, action: "archive", entity: "documento", entityId: id });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao arquivar documento." }, { status: 500 });
  }
}

function readOptionalFile(formData: FormData, key: string) {
  const value = formData.get(key);

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
}

function validateFileSize(file: File) {
  if (file.size > maxFileSize) {
    return "Envie arquivos com no maximo 10 MB.";
  }

  return null;
}
