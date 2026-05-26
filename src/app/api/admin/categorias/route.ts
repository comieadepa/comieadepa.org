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

export async function POST(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const formData = await request.formData();
  const id = requiredString(formData, "id");
  const name = requiredString(formData, "nome");

  if (!name) {
    return redirectWithStatus(request.url, "/admin/categorias", "error", "Informe o nome da categoria.");
  }

  try {
    const payload = {
      nome: name,
      slug: slugify(requiredString(formData, "slug") || name),
      descricao: optionalString(formData, "descricao"),
    };

    if (id) {
      await updateSupabaseRows("cms_categorias", `id=eq.${encodeURIComponent(id)}`, payload);
      await createAuditLog({
        request,
        action: "update",
        entity: "categoria",
        entityId: id,
        entityTitle: name,
        metadata: { slug: payload.slug },
      });
    } else {
      const inserted = (await insertSupabaseRow("cms_categorias", payload)) as Array<{ id?: string }>;
      await createAuditLog({
        request,
        action: "create",
        entity: "categoria",
        entityId: inserted[0]?.id,
        entityTitle: name,
        metadata: { slug: payload.slug },
      });
    }

    return redirectWithStatus(request.url, "/admin/categorias", "success");
  } catch (error) {
    return redirectWithStatus(request.url, "/admin/categorias", "error", error instanceof Error ? error.message : "Erro ao salvar categoria.");
  }
}
