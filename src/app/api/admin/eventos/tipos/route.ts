import {
  createAuditLog,
  deleteSupabaseRows,
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
  const formData = await request.formData();
  const id = requiredString(formData, "id");
  const action = requiredString(formData, "action");
  const eventId = requiredString(formData, "evento_id");

  if (!eventId) {
    if (acceptsJson) {
      return Response.json({ error: "Informe o evento relacionado." }, { status: 400 });
    }
    return redirectWithStatus(request.url, "/admin/eventos", "error", "Informe o evento relacionado.");
  }

  if (action === "delete" && id) {
    if (!canPerformAdminAction(role, "eventos", "delete")) {
      if (acceptsJson) {
        return Response.json({ error: "Sem permissão para remover tipos de inscrição." }, { status: 403 });
      }
      return redirectWithStatus(
        request.url,
        `/admin/eventos?edit=${encodeURIComponent(eventId)}`,
        "error",
        "Sem permissão para remover tipos de inscrição.",
      );
    }

    try {
      await deleteSupabaseRows("evento_tipos_inscricao", `id=eq.${encodeURIComponent(id)}`);
      await createAuditLog({
        request,
        action: "delete",
        entity: "evento_tipo",
        entityId: id,
        metadata: { evento_id: eventId },
      });

      if (acceptsJson) {
        return Response.json({ ok: true, id, message: "Tipo de inscrição removido com sucesso." });
      }

      return redirectWithStatus(request.url, `/admin/eventos?edit=${encodeURIComponent(eventId)}`, "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao remover tipo de inscrição.";
      if (acceptsJson) {
        return Response.json({ error: message }, { status: 500 });
      }
      return redirectWithStatus(request.url, `/admin/eventos?edit=${encodeURIComponent(eventId)}`, "error", message);
    }
  }

  if (!canPerformAdminAction(role, "eventos", "update")) {
    if (acceptsJson) {
      return Response.json({ error: "Sem permissão para salvar tipos de inscrição." }, { status: 403 });
    }
    return redirectWithStatus(
      request.url,
      `/admin/eventos?edit=${encodeURIComponent(eventId)}`,
      "error",
      "Sem permissão para salvar tipos de inscrição.",
    );
  }

  const name = requiredString(formData, "nome");

  if (!name) {
    if (acceptsJson) {
      return Response.json({ error: "Informe o nome do tipo de inscrição." }, { status: 400 });
    }
    return redirectWithStatus(request.url, `/admin/eventos?edit=${encodeURIComponent(eventId)}`, "error", "Informe o nome do tipo.");
  }

  try {
    const payload = {
      evento_id: eventId,
      nome: name,
      valor: parseNumber(formData, "valor") ?? 0,
      limite_vagas: parseNumber(formData, "limite_vagas"),
      ativo: formData.get("ativo") === "on",
      ordem: parseInt(requiredString(formData, "ordem") || "1", 10),
    };

    let savedId = id;

    if (id) {
      await updateSupabaseRows("evento_tipos_inscricao", `id=eq.${encodeURIComponent(id)}`, payload);
      await createAuditLog({
        request,
        action: "update",
        entity: "evento_tipo",
        entityId: id,
        entityTitle: name,
        metadata: { evento_id: eventId },
      });
    } else {
      const inserted = (await insertSupabaseRow("evento_tipos_inscricao", payload)) as Array<{ id?: string }>;
      savedId = inserted[0]?.id ?? "";
      await createAuditLog({
        request,
        action: "create",
        entity: "evento_tipo",
        entityId: savedId,
        entityTitle: name,
        metadata: { evento_id: eventId },
      });
    }

    if (acceptsJson) {
      return Response.json({
        ok: true,
        id: savedId,
        tipo: { ...payload, id: savedId },
        message: id ? "Tipo de inscrição atualizado com sucesso!" : "Tipo de inscrição adicionado!",
      });
    }

    return redirectWithStatus(request.url, `/admin/eventos?edit=${encodeURIComponent(eventId)}`, "success");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao salvar tipo de inscrição.";
    if (acceptsJson) {
      return Response.json({ error: message }, { status: 500 });
    }
    return redirectWithStatus(request.url, `/admin/eventos?edit=${encodeURIComponent(eventId)}`, "error", message);
  }
}

function parseNumber(formData: FormData, key: string) {
  const raw = requiredString(formData, key).replace(",", ".");
  if (!raw) {
    return null;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}
