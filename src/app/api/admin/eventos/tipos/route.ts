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

export async function POST(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const formData = await request.formData();
  const id = requiredString(formData, "id");
  const action = requiredString(formData, "action");
  const eventId = requiredString(formData, "evento_id");

  if (!eventId) {
    return redirectWithStatus(request.url, "/admin/eventos", "error", "Informe o evento relacionado.");
  }

  if (action === "delete" && id) {
    try {
      await deleteSupabaseRows("evento_tipos_inscricao", `id=eq.${encodeURIComponent(id)}`);
      await createAuditLog({
        request,
        action: "delete",
        entity: "evento_tipo",
        entityId: id,
        metadata: { evento_id: eventId },
      });

      return redirectWithStatus(request.url, `/admin/eventos?edit=${encodeURIComponent(eventId)}`, "success");
    } catch (error) {
      return redirectWithStatus(request.url, `/admin/eventos?edit=${encodeURIComponent(eventId)}`, "error", error instanceof Error ? error.message : "Erro ao remover tipo de inscrição.");
    }
  }

  const name = requiredString(formData, "nome");

  if (!name) {
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
      await createAuditLog({
        request,
        action: "create",
        entity: "evento_tipo",
        entityId: inserted[0]?.id,
        entityTitle: name,
        metadata: { evento_id: eventId },
      });
    }

    return redirectWithStatus(request.url, `/admin/eventos?edit=${encodeURIComponent(eventId)}`, "success");
  } catch (error) {
    return redirectWithStatus(request.url, `/admin/eventos?edit=${encodeURIComponent(eventId)}`, "error", error instanceof Error ? error.message : "Erro ao salvar tipo de inscrição.");
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
