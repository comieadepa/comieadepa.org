import { homeSettingKeys } from "@/lib/home-settings";
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

  try {
    await Promise.all(
      homeSettingKeys.map(async (key) => {
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
      metadata: { keys: homeSettingKeys },
    });

    return redirectWithStatus(request.url, "/admin/home", "success");
  } catch (error) {
    return redirectWithStatus(request.url, "/admin/home", "error", error instanceof Error ? error.message : "Erro ao salvar home.");
  }
}
