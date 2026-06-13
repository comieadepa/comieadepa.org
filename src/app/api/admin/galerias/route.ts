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
import { CmsGallery, normalizeGalleryStatus } from "@/lib/galerias";

const maxFileSize = 10 * 1024 * 1024;

export async function GET(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  if (!canPerformAdminAction(role, "galerias", "view")) {
    return Response.json({ error: "Sem permissao para visualizar galerias." }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const slug = url.searchParams.get("slug");
  const status = url.searchParams.get("status");
  const categoria = url.searchParams.get("categoria");
  const query = url.searchParams.get("q");

  const baseSelect =
    "select=id,titulo,slug,descricao,categoria,capa_url,status,destaque,ordem,data_evento,created_at,updated_at,created_by";

  if (id || slug) {
    const filter = id ? `id=eq.${encodeURIComponent(id)}` : `slug=eq.${encodeURIComponent(slug ?? "")}`;
    const rows = await selectSupabaseRows<CmsGallery>("cms_galerias", `${baseSelect}&${filter}&limit=1`);
    return Response.json(rows[0] ?? null);
  }

  const filters = [
    status ? `status=eq.${encodeURIComponent(status)}` : "",
    categoria ? `categoria=eq.${encodeURIComponent(categoria)}` : "",
    query
      ? `or=(titulo.ilike.*${encodeURIComponent(query.trim())}*,descricao.ilike.*${encodeURIComponent(query.trim())}*,categoria.ilike.*${encodeURIComponent(query.trim())}*)`
      : "",
  ].filter(Boolean);

  const rows = await selectSupabaseRows<CmsGallery>(
    "cms_galerias",
    `${baseSelect}${filters.length > 0 ? `&${filters.join("&")}` : ""}&order=destaque.desc,data_evento.desc.nullslast,ordem.asc,updated_at.desc&limit=200`,
  );
  return Response.json(rows);
}

export async function POST(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  if (!canPerformAdminAction(role, "galerias", "create")) {
    return redirectWithStatus(request.url, "/admin/galerias", "error", "Sem permissao para criar galerias.");
  }

  const formData = await request.formData();
  const title = requiredString(formData, "titulo");
  const rawSlug = requiredString(formData, "slug");
  const slug = slugify(rawSlug || title);

  if (!title || !slug) {
    return redirectWithStatus(request.url, "/admin/galerias", "error", "Informe titulo e slug da galeria.");
  }

  if (rawSlug && rawSlug !== slug) {
    return redirectWithStatus(request.url, "/admin/galerias", "error", "Slug invalido. Use apenas letras, numeros e hifen.");
  }

  const status = normalizeGalleryStatus(requiredString(formData, "status"));
  if (status === "publicado" && !canPerformAdminAction(role, "galerias", "publish")) {
    return redirectWithStatus(request.url, "/admin/galerias", "error", "Sem permissao para publicar galerias.");
  }

  const existing = await selectSupabaseRows<CmsGallery>("cms_galerias", `select=id,slug&slug=eq.${encodeURIComponent(slug)}&limit=1`);
  if (existing.length > 0) {
    return redirectWithStatus(request.url, "/admin/galerias", "error", "Slug ja existe. Escolha outro.");
  }

  const cover = readOptionalFile(formData, "capa");
  const coverError = cover ? validateFileSize(cover) : null;
  if (coverError) {
    return redirectWithStatus(request.url, "/admin/galerias", "error", coverError);
  }

  const photos = readMultipleFiles(formData, "fotos");
  const photoError = validateFiles(photos);
  if (photoError) {
    return redirectWithStatus(request.url, "/admin/galerias", "error", photoError);
  }

  try {
    const uploadedCover = cover ? await uploadPublicStorageObject(cover, "galerias-capas") : null;
    const inserted = (await insertSupabaseRow("cms_galerias", {
      titulo: title,
      slug,
      descricao: optionalString(formData, "descricao"),
      categoria: optionalString(formData, "categoria"),
      capa_url: uploadedCover?.publicUrl ?? null,
      status,
      destaque: formData.get("destaque") === "on",
      ordem: Number(requiredString(formData, "ordem") || 0),
      data_evento: optionalDate(formData, "data_evento"),
      created_by: null,
      updated_at: new Date().toISOString(),
    })) as Array<{ id?: string }>;
    const galleryId = inserted[0]?.id;

    if (galleryId && photos.length > 0) {
      const uploadedPhotos = await uploadGalleryPhotos(galleryId, photos);
      if (!uploadedCover?.publicUrl && uploadedPhotos[0]?.publicUrl) {
        await updateSupabaseRows("cms_galerias", `id=eq.${encodeURIComponent(galleryId)}`, {
          capa_url: uploadedPhotos[0].publicUrl,
          updated_at: new Date().toISOString(),
        });
      }
    }

    await createAuditLog({
      request,
      action: "create",
      entity: "galeria",
      entityId: galleryId,
      entityTitle: title,
      metadata: { status, totalFotos: photos.length },
    });

    return redirectWithStatus(request.url, "/admin/galerias", "success");
  } catch (error) {
    return redirectWithStatus(request.url, "/admin/galerias", "error", error instanceof Error ? error.message : "Erro ao criar galeria.");
  }
}

export async function PUT(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  if (!canPerformAdminAction(role, "galerias", "update")) {
    return Response.json({ error: "Sem permissao para atualizar galerias." }, { status: 403 });
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
    await selectSupabaseRows<CmsGallery>(
      "cms_galerias",
      `select=id,titulo,slug,descricao,categoria,capa_url,status,destaque,ordem,data_evento,created_at,updated_at,created_by&id=eq.${encodeURIComponent(id)}&limit=1`,
    )
  )[0];
  if (!current) {
    return Response.json({ error: "Galeria nao encontrada." }, { status: 404 });
  }

  const duplicate = await selectSupabaseRows<CmsGallery>(
    "cms_galerias",
    `select=id,slug&slug=eq.${encodeURIComponent(slug)}&id=neq.${encodeURIComponent(id)}&limit=1`,
  );
  if (duplicate.length > 0) {
    return Response.json({ error: "Slug ja existe. Escolha outro." }, { status: 409 });
  }

  const status = normalizeGalleryStatus(requiredString(formData, "status"));
  if (status === "publicado" && !canPerformAdminAction(role, "galerias", "publish")) {
    return Response.json({ error: "Sem permissao para publicar galerias." }, { status: 403 });
  }
  if (status === "arquivado" && !canPerformAdminAction(role, "galerias", "archive")) {
    return Response.json({ error: "Sem permissao para arquivar galerias." }, { status: 403 });
  }

  const cover = readOptionalFile(formData, "capa");
  const coverError = cover ? validateFileSize(cover) : null;
  if (coverError) {
    return Response.json({ error: coverError }, { status: 400 });
  }

  const photos = readMultipleFiles(formData, "fotos");
  const photoError = validateFiles(photos);
  if (photoError) {
    return Response.json({ error: photoError }, { status: 400 });
  }

  try {
    const uploadedCover = cover ? await uploadPublicStorageObject(cover, "galerias-capas") : null;
    await updateSupabaseRows("cms_galerias", `id=eq.${encodeURIComponent(id)}`, {
      titulo: title,
      slug,
      descricao: optionalString(formData, "descricao"),
      categoria: optionalString(formData, "categoria"),
      capa_url: uploadedCover?.publicUrl ?? current.capa_url,
      status,
      destaque: formData.get("destaque") === "on",
      ordem: Number(requiredString(formData, "ordem") || 0),
      data_evento: optionalDate(formData, "data_evento"),
      created_by: current.created_by,
      updated_at: new Date().toISOString(),
    });

    if (photos.length > 0) {
      await uploadGalleryPhotos(id, photos);
    }

    await createAuditLog({
      request,
      action: "update",
      entity: "galeria",
      entityId: id,
      entityTitle: title,
      metadata: { status, totalFotosAdicionadas: photos.length },
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao atualizar galeria." }, { status: 500 });
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
      await deleteSupabaseRows("cms_galerias", `id=eq.${encodeURIComponent(id)}`);
      await createAuditLog({ request, action: "delete", entity: "galeria", entityId: id });
      return Response.json({ ok: true });
    } catch (error) {
      return Response.json({ error: error instanceof Error ? error.message : "Erro ao excluir galeria." }, { status: 500 });
    }
  }

  if (!canPerformAdminAction(role, "galerias", "archive")) {
    return Response.json({ error: "Sem permissao para arquivar galerias." }, { status: 403 });
  }

  try {
    await updateSupabaseRows("cms_galerias", `id=eq.${encodeURIComponent(id)}`, {
      status: "arquivado",
      updated_at: new Date().toISOString(),
    });
    await createAuditLog({ request, action: "archive", entity: "galeria", entityId: id });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao arquivar galeria." }, { status: 500 });
  }
}

async function uploadGalleryPhotos(galleryId: string, files: File[]) {
  const currentPhotos = await selectSupabaseRows<{ ordem: number }>(
    "cms_galeria_fotos",
    `select=ordem&galeria_id=eq.${encodeURIComponent(galleryId)}&order=ordem.asc&limit=500`,
  );
  let nextOrder = (currentPhotos.at(-1)?.ordem ?? -1) + 1;

  const uploads = [];
  for (const file of files) {
    const uploaded = await uploadPublicStorageObject(file, "galerias-fotos");
    uploads.push(uploaded);
    await insertSupabaseRow("cms_galeria_fotos", {
      galeria_id: galleryId,
      imagem_url: uploaded.publicUrl,
      legenda: null,
      credito: null,
      ordem: nextOrder,
    });
    nextOrder += 1;
  }

  return uploads;
}

function readOptionalFile(formData: FormData, key: string) {
  const value = formData.get(key);
  if (!(value instanceof File) || value.size === 0) {
    return null;
  }
  return value;
}

function readMultipleFiles(formData: FormData, key: string) {
  return formData.getAll(key).filter((value): value is File => value instanceof File && value.size > 0);
}

function validateFileSize(file: File) {
  if (file.size > maxFileSize) {
    return "Envie arquivos com no maximo 10 MB.";
  }
  return null;
}

function validateFiles(files: File[]) {
  for (const file of files) {
    const error = validateFileSize(file);
    if (error) {
      return error;
    }
  }
  return null;
}

function optionalDate(formData: FormData, key: string) {
  const value = requiredString(formData, key);
  return value.length > 0 ? value : null;
}
