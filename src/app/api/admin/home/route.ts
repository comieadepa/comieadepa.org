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
  const acceptsJson =
    request.headers.get("accept")?.includes("application/json") || request.headers.get("x-requested-with") === "fetch";

  if (!hasSupabaseAdminConfig()) {
    if (acceptsJson) {
      return Response.json({ error: "Configuração do Supabase ausente." }, { status: 500 });
    }
    return missingSupabaseAdminResponse();
  }

  const role = resolveAdminRoleFromHeaders(request.headers);
  if (!canPerformAdminAction(role, "home", "update")) {
    if (acceptsJson) {
      return Response.json({ error: "Sem permissão para editar a home." }, { status: 403 });
    }
    return redirectWithStatus(request.url, "/admin/home", "error", "Sem permissao para editar a home.");
  }

  const formData = await request.formData();
  const submittedKeys = homeSettingKeys.filter((key) => formData.has(key));

  if (submittedKeys.length === 0) {
    if (acceptsJson) {
      return Response.json({ error: "Nenhum campo enviado para salvar." }, { status: 400 });
    }
    return redirectWithStatus(request.url, "/admin/home", "error", "Nenhum campo enviado para salvar.");
  }

  const allowedKeys = submittedKeys.filter((key) => canEditHomeField(role, key));

  if (allowedKeys.length === 0) {
    if (acceptsJson) {
      return Response.json(
        { error: "Seu perfil administrativo não tem permissão para alterar estes campos institucionais ou estruturais." },
        { status: 403 },
      );
    }
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
      metadata: { keys: allowedKeys },
    });

    if (acceptsJson) {
      return Response.json({ ok: true, message: "Ajustes da home salvos com sucesso!" });
    }

    return redirectWithStatus(request.url, "/admin/home", "success");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao salvar home.";
    if (acceptsJson) {
      return Response.json({ error: message }, { status: 500 });
    }
    return redirectWithStatus(request.url, "/admin/home", "error", message);
  }
}

