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
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = resolveAdminRoleFromHeaders(request.headers);
  if (!canPerformAdminAction(role, "midia", "upload")) {
    return redirectWithStatus(request.url, "/admin/midia", "error", "Sem permissao para enviar arquivos.");
  }

  const formData = await request.formData();
  const file = formData.get("arquivo");

  if (!(file instanceof File) || file.size === 0) {
    return redirectWithStatus(request.url, "/admin/midia", "error", "Selecione um arquivo para enviar.");
  }

  if (file.size > 10 * 1024 * 1024) {
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

    return redirectWithStatus(request.url, "/admin/midia", "success");
  } catch (error) {
    return redirectWithStatus(request.url, "/admin/midia", "error", error instanceof Error ? error.message : "Erro ao enviar arquivo.");
  }
}
