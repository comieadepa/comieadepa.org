import { canEditHomeField, homeSettingKeys } from "@/lib/home-settings";
import {
  createAuditLog,
  hasSupabaseAdminConfig,
  insertSupabaseRow,
  missingSupabaseAdminResponse,
  redirectWithStatus,
  requiredString,
  updateSupabaseRows,
} from "@/lib/supabase-admin";
import { canPerformAdminAction, resolveAdminRoleFromHeaders } from "@/lib/admin-permissions";

export async function POST(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = resolveAdminRoleFromHeaders(request.headers);
  if (!canPerformAdminAction(role, "home", "update")) {
    return redirectWithStatus(request.url, "/admin/home", "error", "Sem permissao para editar a home.");
  }

  const formData = await request.formData();
  const submittedKeys = homeSettingKeys.filter((key) => formData.has(key));

  if (submittedKeys.length === 0) {
    return redirectWithStatus(request.url, "/admin/home", "error", "Nenhum campo enviado para salvar.");
  }

  const allowedKeys = submittedKeys.filter((key) => canEditHomeField(role, key));

  if (allowedKeys.length === 0) {
    return redirectWithStatus(
      request.url,
      "/admin/home",
      "error",
      "Seu perfil administrativo nao tem permissao para alterar estes campos institucionais ou estruturais.",
    );
  }

  try {
    await Promise.all(
      allowedKeys.map(async (key) => {
        const payload = {
          chave: key,
          valor: requiredString(formData, key),
          grupo: "home",
          publico: true,
          updated_at: new Date().toISOString(),
        };
        const updated = (await updateSupabaseRows("cms_configuracoes", `chave=eq.${encodeURIComponent(key)}`, payload)) as unknown[];

        if (updated.length === 0) {
          await insertSupabaseRow("cms_configuracoes", payload);
        }
      }),
    );

    await createAuditLog({
      request,
      action: "update",
      entity: "home",
      entityTitle: "Home do portal",
      metadata: { keys: submittedKeys },
    });

    return redirectWithStatus(request.url, "/admin/home", "success");
  } catch (error) {
    return redirectWithStatus(request.url, "/admin/home", "error", error instanceof Error ? error.message : "Erro ao salvar home.");
  }
}
