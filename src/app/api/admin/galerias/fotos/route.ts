import {
  createAuditLog,
  deleteSupabaseRows,
  hasSupabaseAdminConfig,
  insertSupabaseRow,
  missingSupabaseAdminResponse,
  optionalString,
  requiredString,
  selectSupabaseRows,
  updateSupabaseRows,
  uploadPublicStorageObject,
} from "@/lib/supabase-admin";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import { CmsGalleryPhoto } from "@/lib/galerias";

const maxFileSize = 10 * 1024 * 1024;

export async function POST(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  if (!canPerformAdminAction(role, "galerias", "update")) {
    return Response.json({ error: "Sem permissao para enviar fotos." }, { status: 403 });
  }

  const formData = await request.formData();
  const galleryId = requiredString(formData, "galeria_id");
  const files = formData.getAll("fotos").filter((value): value is File => value instanceof File && value.size > 0);

  if (!galleryId || files.length === 0) {
    return Response.json({ error: "Informe a galeria e selecione fotos." }, { status: 400 });
  }

  for (const file of files) {
    if (file.size > maxFileSize) {
      return Response.json({ error: "Envie arquivos com no maximo 10 MB." }, { status: 400 });
    }
  }

  const currentPhotos = await selectSupabaseRows<{ ordem: number }>(
    "cms_galeria_fotos",
    `select=ordem&galeria_id=eq.${encodeURIComponent(galleryId)}&order=ordem.asc&limit=500`,
  );
  let nextOrder = (currentPhotos.at(-1)?.ordem ?? -1) + 1;

  try {
    const insertedPhotos: Array<{ id?: string; imagem_url?: string }> = [];

    for (const file of files) {
      const uploaded = await uploadPublicStorageObject(file, "galerias-fotos");
      const inserted = (await insertSupabaseRow("cms_galeria_fotos", {
        galeria_id: galleryId,
        imagem_url: uploaded.publicUrl,
        legenda: null,
        credito: null,
        ordem: nextOrder,
      })) as Array<{ id?: string; imagem_url?: string }>;
      insertedPhotos.push(inserted[0] ?? {});
      nextOrder += 1;
    }

    await createAuditLog({
      request,
      action: "upload",
      entity: "galeria_foto",
      entityId: galleryId,
      metadata: { totalFotos: insertedPhotos.length },
    });

    return Response.json({ ok: true, photos: insertedPhotos });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao enviar fotos." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  if (!canPerformAdminAction(role, "galerias", "update")) {
    return Response.json({ error: "Sem permissao para editar fotos." }, { status: 403 });
  }

  const formData = await request.formData();
  const id = requiredString(formData, "id");

  if (!id) {
    return Response.json({ error: "Informe a foto." }, { status: 400 });
  }

  const current = (
    await selectSupabaseRows<CmsGalleryPhoto>(
      "cms_galeria_fotos",
      `select=id,galeria_id,imagem_url,legenda,credito,ordem,created_at&id=eq.${encodeURIComponent(id)}&limit=1`,
    )
  )[0];

  if (!current) {
    return Response.json({ error: "Foto nao encontrada." }, { status: 404 });
  }

  try {
    await updateSupabaseRows("cms_galeria_fotos", `id=eq.${encodeURIComponent(id)}`, {
      legenda: optionalString(formData, "legenda"),
      credito: optionalString(formData, "credito"),
      ordem: Number(requiredString(formData, "ordem") || current.ordem),
    });

    await createAuditLog({
      request,
      action: "update",
      entity: "galeria_foto",
      entityId: id,
      metadata: { galeria_id: current.galeria_id },
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao atualizar foto." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  if (!canPerformAdminAction(role, "galerias", "update")) {
    return Response.json({ error: "Sem permissao para excluir fotos." }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Informe a foto." }, { status: 400 });
  }

  try {
    await deleteSupabaseRows("cms_galeria_fotos", `id=eq.${encodeURIComponent(id)}`);
    await createAuditLog({ request, action: "delete", entity: "galeria_foto", entityId: id });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao excluir foto." }, { status: 500 });
  }
}
