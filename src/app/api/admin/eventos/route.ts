import {
  createAuditLog,
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
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const formData = await request.formData();
  const id = requiredString(formData, "id");
  const action = requiredString(formData, "action");

  const role = resolveAdminRoleFromHeaders(request.headers);

  if (action && id) {
    if (!canPerformAdminAction(role, "eventos", "update")) {
      return redirectWithStatus(request.url, "/admin/eventos", "error", "Sem permissao para atualizar eventos.");
    }
  }

  if (action && id) {
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

      return redirectWithStatus(request.url, "/admin/eventos", "success");
    } catch (error) {
      return redirectWithStatus(request.url, "/admin/eventos", "error", error instanceof Error ? error.message : "Erro ao atualizar evento.");
    }
  }

  const name = requiredString(formData, "nome");
  const departamento = normalizeDepartment(requiredString(formData, "departamento"));
  const dataInicio = requiredString(formData, "data_inicio");
  const dataFim = requiredString(formData, "data_fim") || dataInicio;

  if (!name || !departamento || !dataInicio || !dataFim) {
    return redirectWithStatus(request.url, "/admin/eventos", "error", "Informe nome, departamento e datas do evento.");
  }

  const writeAction = id ? "update" : "create";
  if (!canPerformAdminAction(role, "eventos", writeAction)) {
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
      await createAuditLog({
        request,
        action: "create",
        entity: "evento",
        entityId: inserted[0]?.id,
        entityTitle: name,
        metadata: { status: payload.status, inscricoes_abertas: payload.inscricoes_abertas },
      });
    }

    return redirectWithStatus(request.url, "/admin/eventos", "success");
  } catch (error) {
    return redirectWithStatus(request.url, "/admin/eventos", "error", error instanceof Error ? error.message : "Erro ao salvar evento.");
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
