import { createAuditLog, hasSupabaseAdminConfig, missingSupabaseAdminResponse, redirectWithStatus, requiredString, updateSupabaseRows } from "@/lib/supabase-admin";
import { AdminRole, canPerformAdminAction, normalizeAdminRole, resolveAdminRoleFromHeaders } from "@/lib/admin-permissions";

export async function POST(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = resolveAdminRoleFromHeaders(request.headers);
  if (!canPerformAdminAction(role, "usuarios", "manage_users")) {
    return redirectWithStatus(request.url, "/admin/permissoes", "error", "Sem permissao para gerenciar perfis.");
  }

  const formData = await request.formData();
  const id = requiredString(formData, "id");
  const action = requiredString(formData, "action");

  if (!id) {
    return redirectWithStatus(request.url, "/admin/permissoes", "error", "Informe o usuario que sera atualizado.");
  }

  if (action === "activate" || action === "deactivate") {
    const active = action === "activate";

    try {
      await updateSupabaseRows("cms_admin_users", `id=eq.${encodeURIComponent(id)}`, {
        ativo: active,
        updated_at: new Date().toISOString(),
      });
      await createAuditLog({
        request,
        action,
        entity: "permissao",
        entityId: id,
        metadata: { ativo: active },
      });

      return redirectWithStatus(request.url, "/admin/permissoes", "success");
    } catch (error) {
      return redirectWithStatus(request.url, "/admin/permissoes", "error", error instanceof Error ? error.message : "Erro ao atualizar acesso.");
    }
  }

  const nextRole = normalizeAdminRole(requiredString(formData, "role")) as AdminRole;

  try {
    await updateSupabaseRows("cms_admin_users", `id=eq.${encodeURIComponent(id)}`, {
      role: nextRole,
      updated_at: new Date().toISOString(),
    });
    await createAuditLog({
      request,
      action: "update_role",
      entity: "permissao",
      entityId: id,
      metadata: { role: nextRole },
    });

    return redirectWithStatus(request.url, "/admin/permissoes", "success");
  } catch (error) {
    return redirectWithStatus(request.url, "/admin/permissoes", "error", error instanceof Error ? error.message : "Erro ao atualizar perfil.");
  }
}
