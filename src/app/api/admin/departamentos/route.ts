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

export async function POST(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const formData = await request.formData();
  const id = requiredString(formData, "id");
  const action = requiredString(formData, "action");
  const name = requiredString(formData, "nome");

  const role = resolveAdminRoleFromHeaders(request.headers);

  if (action && id) {
    if (!canPerformAdminAction(role, "departamentos", "update")) {
      return redirectWithStatus(request.url, "/admin/departamentos", "error", "Sem permissao para atualizar departamentos.");
    }
  }

  if (action && id) {
    try {
      await updateSupabaseRows("cms_departamentos", `id=eq.${encodeURIComponent(id)}`, {
        ativo: action === "activate",
        updated_at: new Date().toISOString(),
      });
      await createAuditLog({
        request,
        action,
        entity: "departamento",
        entityId: id,
        metadata: { ativo: action === "activate" },
      });

      return redirectWithStatus(request.url, "/admin/departamentos", "success");
    } catch (error) {
      return redirectWithStatus(request.url, "/admin/departamentos", "error", error instanceof Error ? error.message : "Erro ao atualizar departamento.");
    }
  }

  if (!name) {
    return redirectWithStatus(request.url, "/admin/departamentos", "error", "Informe o nome do departamento.");
  }

  const writeAction = id ? "update" : "create";
  if (!canPerformAdminAction(role, "departamentos", writeAction)) {
    return redirectWithStatus(request.url, "/admin/departamentos", "error", "Sem permissao para salvar departamentos.");
  }

  try {
    const payload = {
      nome: name,
      slug: slugify(requiredString(formData, "slug") || name),
      titulo: optionalString(formData, "titulo"),
      resumo: optionalString(formData, "resumo"),
      conteudo: optionalString(formData, "conteudo"),
      logo_url: optionalString(formData, "logo_url"),
      banner_url: optionalString(formData, "banner_url"),
      contato_nome: optionalString(formData, "contato_nome"),
      contato_whatsapp: optionalString(formData, "contato_whatsapp"),
      redes_sociais: parseLinkList(formData, "redes_sociais"),
      documentos: parseLinkList(formData, "documentos"),
      ordem: Number(requiredString(formData, "ordem") || 0),
      ativo: true,
      updated_at: new Date().toISOString(),
    };

    if (id) {
      await updateSupabaseRows("cms_departamentos", `id=eq.${encodeURIComponent(id)}`, payload);
      await createAuditLog({
        request,
        action: "update",
        entity: "departamento",
        entityId: id,
        entityTitle: name,
        metadata: { slug: payload.slug, ordem: payload.ordem },
      });
    } else {
      const inserted = (await insertSupabaseRow("cms_departamentos", payload)) as Array<{ id?: string }>;
      await createAuditLog({
        request,
        action: "create",
        entity: "departamento",
        entityId: inserted[0]?.id,
        entityTitle: name,
        metadata: { slug: payload.slug, ordem: payload.ordem },
      });
    }

    return redirectWithStatus(request.url, "/admin/departamentos", "success");
  } catch (error) {
    return redirectWithStatus(request.url, "/admin/departamentos", "error", error instanceof Error ? error.message : "Erro ao salvar departamento.");
  }
}

function parseLinkList(formData: FormData, key: string) {
  return requiredString(formData, key)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [rawLabel, ...urlParts] = line.split("|");
      const label = rawLabel.trim();
      const url = urlParts.join("|").trim();

      if (!url) {
        return { label, url: label };
      }

      return { label: label || url, url };
    })
    .filter((item) => item.label && item.url);
}
