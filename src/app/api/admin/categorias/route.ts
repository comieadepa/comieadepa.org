import {
  countSupabaseRows,
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

export async function POST(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const formData = await request.formData();
  const id = requiredString(formData, "id");
  const name = requiredString(formData, "nome");

  const role = resolveAdminRoleFromHeaders(request.headers);
  const writeAction = id ? "update" : "create";
  if (!canPerformAdminAction(role, "noticias", writeAction)) {
    return redirectWithStatus(request.url, "/admin/categorias", "error", "Sem permissao para salvar categorias.");
  }

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

export async function DELETE(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = resolveAdminRoleFromHeaders(request.headers);
  if (!canPerformAdminAction(role, "noticias", "delete")) {
    return Response.json({ error: "Sem permissão para remover categorias." }, { status: 403 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return Response.json({ error: "ID da categoria não informado." }, { status: 400 });
  }

  try {
    // Check if there are linked posts in cms_posts before deleting
    const linkedPostsCount = await countSupabaseRows("cms_posts", `select=id&categoria_id=eq.${encodeURIComponent(id)}`);

    if (linkedPostsCount > 0) {
      return Response.json(
        {
          error: `A categoria não pode ser excluída pois possui ${linkedPostsCount} notícia(s) associada(s). Desvincule ou remova as notícias antes de excluir a categoria.`,
        },
        { status: 400 },
      );
    }

    await deleteSupabaseRows("cms_categorias", `id=eq.${encodeURIComponent(id)}`);

    await createAuditLog({
      request,
      action: "delete",
      entity: "categoria",
      entityId: id,
    });

    return Response.json({ ok: true, message: "Categoria excluída com sucesso." });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro ao excluir categoria." },
      { status: 500 },
    );
  }
}

