import {
  createAuditLog,
  hasSupabaseAdminConfig,
  insertSupabaseRow,
  missingSupabaseAdminResponse,
  optionalString,
  redirectWithStatus,
  requiredString,
  uploadPublicStorageObject,
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

  const role = resolveAdminRoleFromHeaders(request.headers);
  if (!canPerformAdminAction(role, "midia", "upload")) {
    if (acceptsJson) {
      return Response.json({ error: "Sem permissão para enviar arquivos." }, { status: 403 });
    }
    return redirectWithStatus(request.url, "/admin/midia", "error", "Sem permissao para enviar arquivos.");
  }

  const formData = await request.formData();
  const file = formData.get("arquivo");

  if (!(file instanceof File) || file.size === 0) {
    if (acceptsJson) {
      return Response.json({ error: "Selecione um arquivo para enviar." }, { status: 400 });
    }
    return redirectWithStatus(request.url, "/admin/midia", "error", "Selecione um arquivo para enviar.");
  }

  if (file.size > 10 * 1024 * 1024) {
    if (acceptsJson) {
      return Response.json({ error: "Envie arquivos com no máximo 10 MB." }, { status: 400 });
    }
    return redirectWithStatus(request.url, "/admin/midia", "error", "Envie arquivos com no máximo 10 MB.");
  }

  const folder = requiredString(formData, "pasta") || "geral";

  try {
    const uploaded = await uploadPublicStorageObject(file, folder);

    const inserted = (await insertSupabaseRow("cms_media_assets", {
      titulo: optionalString(formData, "titulo") ?? file.name,
      arquivo_url: uploaded.publicUrl,
      tipo: file.type || optionalString(formData, "tipo"),
      pasta: folder,
    })) as Array<{ id?: string; titulo?: string }>;
    await createAuditLog({
      request,
      action: "upload",
      entity: "midia",
      entityId: inserted[0]?.id,
      entityTitle: inserted[0]?.titulo ?? file.name,
      metadata: { tipo: file.type, pasta: folder },
    });

    if (acceptsJson) {
      return Response.json({
        ok: true,
        url: uploaded.publicUrl,
        id: inserted[0]?.id,
        titulo: inserted[0]?.titulo ?? file.name,
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
