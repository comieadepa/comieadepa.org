import {
  createAuditLog,
  hasSupabaseAdminConfig,
  insertSupabaseRow,
  missingSupabaseAdminResponse,
  optionalString,
  redirectWithStatus,
  requiredString,
  sendAdminAccessSetupEmail,
  setAdminUserDirectPassword,
  updateSupabaseRows,
} from "@/lib/supabase-admin";
import { canPerformAdminAction, resolveAdminRoleFromHeaders } from "@/lib/admin-permissions";

export async function POST(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = resolveAdminRoleFromHeaders(request.headers);
  if (!canPerformAdminAction(role, "usuarios", "manage_users")) {
    return redirectWithStatus(request.url, "/admin/usuarios", "error", "Sem permissao para gerenciar usuarios.");
  }

  const requestUrl = new URL(request.url);
  const redirectUrl = `${requestUrl.origin}/admin/definir-senha`;

  const formData = await request.formData();
  const id = requiredString(formData, "id");
  const action = requiredString(formData, "action");
  const name = requiredString(formData, "nome");
  const email = requiredString(formData, "email").toLowerCase();
  const password = optionalString(formData, "password");

  if ((action === "activate" || action === "deactivate") && id) {
    try {
      await updateSupabaseRows("cms_admin_users", `id=eq.${encodeURIComponent(id)}`, {
        ativo: action === "activate",
        updated_at: new Date().toISOString(),
      });
      await createAuditLog({
        request,
        action,
        entity: "usuario",
        entityId: id,
        metadata: { ativo: action === "activate" },
      });

      return redirectWithStatus(request.url, "/admin/usuarios", "success");
    } catch (error) {
      return redirectWithStatus(request.url, "/admin/usuarios", "error", error instanceof Error ? error.message : "Erro ao atualizar usuário.");
    }
  }

  if (action === "send_access" && id && email) {
    try {
      await sendAdminAccessSetupEmail(email, name, redirectUrl);
      await createAuditLog({
        request,
        action: "send_access",
        entity: "usuario",
        entityId: id,
        entityTitle: name || email,
        metadata: { email },
      });

      return redirectWithStatus(request.url, "/admin/usuarios", "success", "Link de recuperação e acesso enviado por e-mail.");
    } catch (error) {
      return redirectWithStatus(request.url, "/admin/usuarios", "error", error instanceof Error ? error.message : "Erro ao enviar o acesso do usuário.");
    }
  }

  if (action === "set_password" && email && password) {
    if (password.length < 8) {
      return redirectWithStatus(request.url, "/admin/usuarios", "error", "A senha precisa ter pelo menos 8 caracteres.");
    }

    try {
      await setAdminUserDirectPassword(email, password);
      await createAuditLog({
        request,
        action: "set_password",
        entity: "usuario",
        entityId: id || undefined,
        entityTitle: name || email,
        metadata: { email },
      });

      return redirectWithStatus(request.url, "/admin/usuarios", "success", `Senha definida com sucesso para ${email}.`);
    } catch (error) {
      return redirectWithStatus(request.url, "/admin/usuarios", "error", error instanceof Error ? error.message : "Erro ao definir senha.");
    }
  }

  if (!name || !email) {
    return redirectWithStatus(request.url, "/admin/usuarios", "error", "Informe nome e e-mail do usuário.");
  }

  try {
    const payload = {
      nome: name,
      email,
      role: normalizeRole(requiredString(formData, "role")),
      departamento_id: optionalString(formData, "departamento_id"),
      observacoes: optionalString(formData, "observacoes"),
      ativo: true,
      updated_at: new Date().toISOString(),
    };

    if (id) {
      await updateSupabaseRows("cms_admin_users", `id=eq.${encodeURIComponent(id)}`, payload);
      await createAuditLog({
        request,
        action: "update",
        entity: "usuario",
        entityId: id,
        entityTitle: name,
        metadata: { email, role: payload.role },
      });

      return redirectWithStatus(request.url, "/admin/usuarios", "success", "Usuário atualizado com sucesso.");
    } else {
      const inserted = (await insertSupabaseRow("cms_admin_users", payload)) as Array<{ id?: string }>;
      try {
        await sendAdminAccessSetupEmail(email, name, redirectUrl);
      } catch (emailErr) {
        console.warn("Usuário inserido no banco, mas erro no disparo de e-mail:", emailErr);
      }
      await createAuditLog({
        request,
        action: "create",
        entity: "usuario",
        entityId: inserted[0]?.id,
        entityTitle: name,
        metadata: { email, role: payload.role, access_email_sent: true },
      });

      return redirectWithStatus(request.url, "/admin/usuarios", "success", "Usuário cadastrado com sucesso.");
    }
  } catch (error) {
    return redirectWithStatus(request.url, "/admin/usuarios", "error", error instanceof Error ? error.message : "Erro ao salvar usuário.");
  }
}

function normalizeRole(value: string) {
  if (["admin", "editor", "midia", "viewer"].includes(value)) {
    return value;
  }

  return "editor";
}

