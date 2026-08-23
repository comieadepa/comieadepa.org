import {
  createAuditLog,
  deleteSupabaseRows,
  hasSupabaseAdminConfig,
  insertSupabaseRow,
  missingSupabaseAdminResponse,
  optionalString,
  redirectWithStatus,
  requiredString,
  slugify,
  updateSupabaseRows,
} from "@/lib/supabase-admin";
import { canPerformAdminAction, resolveAdminRoleFromHeaders } from "@/lib/admin-permissions";

const departmentOptions = ["AGO", "COADESPA", "UMADESPA", "SEIADEPA", "AVULSO"] as const;
const statusOptions = ["programado", "realizado", "encerrado", "cancelado"] as const;

type EventStatus = (typeof statusOptions)[number];

type EventPayload = {
  nome: string;
  slug: string;
  descricao: string | null;
  departamento: string;
  data_inicio: string;
  data_fim: string;
  local: string | null;
  cidade: string | null;
  banner_url: string | null;
  valor_inscricao: number | null;
  inscricoes_abertas: boolean;
  publico_alvo: string | null;
  status: EventStatus;
  usar_tipos_inscricao: boolean;
  checkin_ativo: boolean;
  updated_at: string;
};

export async function POST(request: Request) {
  const acceptsJson =
    request.headers.get("accept")?.includes("application/json") || request.headers.get("x-requested-with") === "fetch";

  if (!hasSupabaseAdminConfig()) {
    if (acceptsJson) {
      return Response.json({ error: "Configuração do Supabase ausente." }, { status: 500 });
    }
    return missingSupabaseAdminResponse();
  }

  const formData = await request.formData();
  const id = requiredString(formData, "id");
  const action = requiredString(formData, "action");

  const role = resolveAdminRoleFromHeaders(request.headers);

  if (action && id) {
    if (!canPerformAdminAction(role, "eventos", "update")) {
      if (acceptsJson) {
        return Response.json({ error: "Sem permissão para atualizar status de eventos." }, { status: 403 });
      }
      return redirectWithStatus(request.url, "/admin/eventos", "error", "Sem permissao para atualizar eventos.");
    }

    try {
      const nextStatus = mapActionToStatus(action);
      await updateSupabaseRows("eventos", `id=eq.${encodeURIComponent(id)}`, {
        status: nextStatus,
        inscricoes_abertas: action === "close" || action === "cancel" ? false : undefined,
        updated_at: new Date().toISOString(),
      });
      await createAuditLog({
        request,
        action,
        entity: "evento",
        entityId: id,
        metadata: { status: nextStatus },
      });

      if (acceptsJson) {
        return Response.json({
          ok: true,
          id,
          status: nextStatus,
          message: `Status do evento atualizado para ${nextStatus}.`,
        });
      }

      return redirectWithStatus(request.url, "/admin/eventos", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar evento.";
      if (acceptsJson) {
        return Response.json({ error: message }, { status: 500 });
      }
      return redirectWithStatus(request.url, "/admin/eventos", "error", message);
    }
  }

  const name = requiredString(formData, "nome");
  const departamento = normalizeDepartment(requiredString(formData, "departamento"));
  const dataInicio = requiredString(formData, "data_inicio");
  const dataFim = requiredString(formData, "data_fim") || dataInicio;

  if (!name || !departamento || !dataInicio || !dataFim) {
    if (acceptsJson) {
      return Response.json({ error: "Informe nome, departamento e datas do evento." }, { status: 400 });
    }
    return redirectWithStatus(request.url, "/admin/eventos", "error", "Informe nome, departamento e datas do evento.");
  }

  const writeAction = id ? "update" : "create";
  if (!canPerformAdminAction(role, "eventos", writeAction)) {
    if (acceptsJson) {
      return Response.json({ error: "Sem permissão para salvar eventos." }, { status: 403 });
    }
    return redirectWithStatus(request.url, "/admin/eventos", "error", "Sem permissao para salvar eventos.");
  }

  try {
    const payload: EventPayload = {
      nome: name,
      slug: slugify(requiredString(formData, "slug") || name),
      descricao: optionalString(formData, "descricao"),
      departamento,
      data_inicio: dataInicio,
      data_fim: dataFim,
      local: optionalString(formData, "local"),
      cidade: optionalString(formData, "cidade"),
      banner_url: optionalString(formData, "banner_url"),
      valor_inscricao: parseNumber(formData, "valor_inscricao"),
      inscricoes_abertas: formData.get("inscricoes_abertas") === "on",
      publico_alvo: optionalString(formData, "publico_alvo"),
      status: normalizeStatus(requiredString(formData, "status") || "programado"),
      usar_tipos_inscricao: formData.get("usar_tipos_inscricao") === "on",
      checkin_ativo: false,
      updated_at: new Date().toISOString(),
    };

    let savedId = id;

    if (id) {
      await updateSupabaseRows("eventos", `id=eq.${encodeURIComponent(id)}`, payload);
      await createAuditLog({
        request,
        action: "update",
        entity: "evento",
        entityId: id,
        entityTitle: name,
        metadata: { status: payload.status, inscricoes_abertas: payload.inscricoes_abertas },
      });
    } else {
      const inserted = (await insertSupabaseRow("eventos", payload)) as Array<{ id?: string }>;
      savedId = inserted[0]?.id ?? "";
      await createAuditLog({
        request,
        action: "create",
        entity: "evento",
        entityId: savedId,
        entityTitle: name,
        metadata: { status: payload.status, inscricoes_abertas: payload.inscricoes_abertas },
      });
    }

    if (acceptsJson) {
      return Response.json({
        ok: true,
        id: savedId,
        message: id ? "Evento atualizado com sucesso!" : "Evento cadastrado com sucesso!",
      });
    }

    return redirectWithStatus(request.url, "/admin/eventos", "success");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao salvar evento.";
    if (acceptsJson) {
      return Response.json({ error: message }, { status: 500 });
    }
    return redirectWithStatus(request.url, "/admin/eventos", "error", message);
  }
}

export async function DELETE(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return Response.json({ error: "Configuração do Supabase ausente." }, { status: 500 });
  }

  const role = resolveAdminRoleFromHeaders(request.headers);
  if (!canPerformAdminAction(role, "eventos", "delete")) {
    return Response.json({ error: "Sem permissão para excluir eventos. Ação restrita a administradores." }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return Response.json({ error: "Informe o ID do evento." }, { status: 400 });
  }

  try {
    // Delete associated registration types first to keep database clean
    await deleteSupabaseRows("evento_tipos_inscricao", `evento_id=eq.${encodeURIComponent(id)}`);
    await deleteSupabaseRows("eventos", `id=eq.${encodeURIComponent(id)}`);
    await createAuditLog({ request, action: "delete", entity: "evento", entityId: id });
    return Response.json({ ok: true, message: "Evento excluído definitivamente." });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Erro ao excluir evento." }, { status: 500 });
  }
}

function normalizeDepartment(value: string) {
  const normalized = value.toUpperCase();
  return departmentOptions.includes(normalized as (typeof departmentOptions)[number]) ? normalized : "AVULSO";
}

function normalizeStatus(value: string): EventStatus {
  const normalized = value.toLowerCase();
  const match = statusOptions.find((status) => status === normalized);
  return match ?? "programado";
}

function mapActionToStatus(action: string): EventStatus {
  if (action === "close") {
    return "encerrado";
  }

  if (action === "cancel") {
    return "cancelado";
  }

  if (action === "reopen") {
    return "programado";
  }

  return "programado";
}

function parseNumber(formData: FormData, key: string) {
  const raw = requiredString(formData, key).replace(",", ".");
  if (!raw) {
    return null;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

