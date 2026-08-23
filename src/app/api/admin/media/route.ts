import {
  createAuditLog,
  deleteSupabaseRows,
  hasSupabaseAdminConfig,
  insertSupabaseRow,
  missingSupabaseAdminResponse,
  optionalString,
  redirectWithStatus,
  requiredString,
  updateSupabaseRows,
  uploadPublicStorageObject,
} from "@/lib/supabase-admin";
import { canPerformAdminAction, resolveAdminRoleFromHeaders } from "@/lib/admin-permissions";

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
  if (!canPerformAdminAction(role, "midia", "upload")) {
    if (acceptsJson) {
      return Response.json({ error: "Sem permissão para enviar arquivos." }, { status: 403 });
    }
    return redirectWithStatus(request.url, "/admin/midia", "error", "Sem permissao para enviar arquivos.");
  }

  const formData = await request.formData();
  const folder = requiredString(formData, "pasta") || "geral";

  // Support both single "arquivo" and multiple "arquivos" / "arquivo"
  const rawFiles = formData.getAll("arquivos").concat(formData.getAll("arquivo"));
  const files = rawFiles.filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) {
    if (acceptsJson) {
      return Response.json({ error: "Selecione um arquivo para enviar." }, { status: 400 });
    }
    return redirectWithStatus(request.url, "/admin/midia", "error", "Selecione um arquivo para enviar.");
  }

  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) {
      if (acceptsJson) {
        return Response.json({ error: `O arquivo ${file.name} ultrapassa o limite de 10 MB.` }, { status: 400 });
      }
      return redirectWithStatus(request.url, "/admin/midia", "error", "Envie arquivos com no máximo 10 MB.");
    }
  }

  try {
    const insertedAssets = [];
    const customTitle = optionalString(formData, "titulo");

    for (const file of files) {
      const uploaded = await uploadPublicStorageObject(file, folder);
      const titleToUse = files.length === 1 && customTitle ? customTitle : file.name;

      const inserted = (await insertSupabaseRow("cms_media_assets", {
        titulo: titleToUse,
        arquivo_url: uploaded.publicUrl,
        tipo: file.type || "application/octet-stream",
        pasta: folder,
      })) as Array<{ id?: string; titulo?: string }>;

      const assetId = inserted[0]?.id;
      insertedAssets.push({
        id: assetId,
        titulo: titleToUse,
        url: uploaded.publicUrl,
        tipo: file.type,
        pasta: folder,
      });

      await createAuditLog({
        request,
        action: "upload",
        entity: "midia",
        entityId: assetId,
        entityTitle: titleToUse,
        metadata: { tipo: file.type, pasta: folder, url: uploaded.publicUrl },
      });
    }

    if (acceptsJson) {
      return Response.json({
        ok: true,
        assets: insertedAssets,
        url: insertedAssets[0]?.url,
        id: insertedAssets[0]?.id,
        titulo: insertedAssets[0]?.titulo,
        message: `${insertedAssets.length} arquivo(s) enviado(s) com sucesso!`,
      });
    }

    return redirectWithStatus(request.url, "/admin/midia", "success");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao enviar arquivo.";
    if (acceptsJson) {
      return Response.json({ error: message }, { status: 500 });
    }
    return redirectWithStatus(request.url, "/admin/midia", "error", message);
  }
}

export async function PUT(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return Response.json({ error: "Configuração do Supabase ausente." }, { status: 500 });
  }

  const role = resolveAdminRoleFromHeaders(request.headers);
  if (!canPerformAdminAction(role, "midia", "upload")) {
    return Response.json({ error: "Sem permissão para atualizar mídia." }, { status: 403 });
  }

  const formData = await request.formData();
  const id = requiredString(formData, "id");
  const titulo = requiredString(formData, "titulo");
  const pasta = requiredString(formData, "pasta");

  if (!id || !titulo) {
    return Response.json({ error: "Informe o ID e o título da mídia." }, { status: 400 });
  }

  try {
    await updateSupabaseRows("cms_media_assets", `id=eq.${encodeURIComponent(id)}`, {
      titulo,
      pasta: pasta || "geral",
      updated_at: new Date().toISOString(),
    });

    await createAuditLog({
      request,
      action: "update",
      entity: "midia",
      entityId: id,
      entityTitle: titulo,
      metadata: { pasta },
    });

    return Response.json({ ok: true, message: "Metadados atualizados com sucesso." });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao atualizar mídia." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return Response.json({ error: "Configuração do Supabase ausente." }, { status: 500 });
  }

  const role = resolveAdminRoleFromHeaders(request.headers);
  if (!canPerformAdminAction(role, "midia", "delete")) {
    return Response.json({ error: "Sem permissão para excluir itens da biblioteca de mídia." }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return Response.json({ error: "Informe o ID da mídia." }, { status: 400 });
  }

  try {
    await deleteSupabaseRows("cms_media_assets", `id=eq.${encodeURIComponent(id)}`);
    await createAuditLog({ request, action: "delete", entity: "midia", entityId: id });
    return Response.json({ ok: true, message: "Arquivo removido com sucesso." });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao excluir arquivo." }, { status: 500 });
  }
}
