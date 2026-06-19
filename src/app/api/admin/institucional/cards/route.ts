import {
  createAuditLog,
  hasSupabaseAdminConfig,
  insertSupabaseRow,
  missingSupabaseAdminResponse,
  optionalString,
  requiredString,
  selectSupabaseRows,
  updateSupabaseRows,
  deleteSupabaseRows,
} from "@/lib/supabase-admin";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";

export type CmsInstitucionalCard = {
  id: string;
  secao_id: string;
  titulo: string;
  subtitulo: string | null;
  descricao: string | null;
  imagem_url: string | null;
  icone: string | null;
  link_url: string | null;
  link_texto: string | null;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export async function GET(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  if (!canPerformAdminAction(role, "institucional", "view")) {
    return Response.json({ error: "Sem permissão para visualizar cards." }, { status: 403 });
  }

  const url = new URL(request.url);
  const secaoId = url.searchParams.get("secao_id");
  const id = url.searchParams.get("id");

  const baseSelect = "select=id,secao_id,titulo,subtitulo,descricao,imagem_url,icone,link_url,link_texto,ordem,ativo,created_at,updated_at";

  if (id) {
    const rows = await selectSupabaseRows<CmsInstitucionalCard>(
      "cms_institucional_cards",
      `${baseSelect}&id=eq.${encodeURIComponent(id)}&limit=1`
    );
    return Response.json(rows[0] ?? null);
  }

  if (!secaoId) {
    return Response.json({ error: "Informe secao_id." }, { status: 400 });
  }

  const rows = await selectSupabaseRows<CmsInstitucionalCard>(
    "cms_institucional_cards",
    `${baseSelect}&secao_id=eq.${encodeURIComponent(secaoId)}&order=ordem.asc,created_at.asc&limit=100`
  );

  return Response.json(rows);
}

export async function POST(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  if (!canPerformAdminAction(role, "institucional", "create")) {
    return Response.json({ error: "Sem permissão para criar card." }, { status: 403 });
  }

  try {
    const body = await parseBody(request);

    if (!body.secao_id || !body.titulo) {
      return Response.json({ error: "Informe secao_id e titulo." }, { status: 400 });
    }

    const payload = {
      secao_id: body.secao_id,
      titulo: body.titulo,
      subtitulo: body.subtitulo,
      descricao: body.descricao,
      imagem_url: body.imagem_url,
      icone: body.icone,
      link_url: body.link_url,
      link_texto: body.link_texto,
      ordem: body.ordem,
      ativo: body.ativo,
      updated_at: new Date().toISOString(),
    };

    const inserted = (await insertSupabaseRow("cms_institucional_cards", payload)) as Array<{ id?: string }>;

    await createAuditLog({
      request,
      action: "create_card",
      entity: "institucional",
      entityId: inserted[0]?.id,
      entityTitle: body.titulo,
      metadata: { secao_id: body.secao_id },
    });

    return Response.json({ ok: true, id: inserted[0]?.id });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro ao criar card." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  if (!canPerformAdminAction(role, "institucional", "update")) {
    return Response.json({ error: "Sem permissão para editar card." }, { status: 403 });
  }

  try {
    const body = await parseBody(request);

    if (!body.id || !body.titulo) {
      return Response.json({ error: "Informe id e titulo." }, { status: 400 });
    }

    const payload = {
      titulo: body.titulo,
      subtitulo: body.subtitulo,
      descricao: body.descricao,
      imagem_url: body.imagem_url,
      icone: body.icone,
      link_url: body.link_url,
      link_texto: body.link_texto,
      ordem: body.ordem,
      ativo: body.ativo,
      updated_at: new Date().toISOString(),
    };

    await updateSupabaseRows("cms_institucional_cards", `id=eq.${encodeURIComponent(body.id)}`, payload);

    await createAuditLog({
      request,
      action: "update_card",
      entity: "institucional",
      entityId: body.id,
      entityTitle: body.titulo,
      metadata: { secao_id: body.secao_id },
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro ao atualizar card." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  if (!canPerformAdminAction(role, "institucional", "delete")) {
    return Response.json({ error: "Sem permissão para excluir card." }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Informe o id." }, { status: 400 });
  }

  try {
    const current = await selectSupabaseRows<CmsInstitucionalCard>(
      "cms_institucional_cards",
      `select=titulo,secao_id&id=eq.${encodeURIComponent(id)}&limit=1`
    );

    await deleteSupabaseRows("cms_institucional_cards", `id=eq.${encodeURIComponent(id)}`);

    if (current[0]) {
      await createAuditLog({
        request,
        action: "delete_card",
        entity: "institucional",
        entityId: id,
        entityTitle: current[0].titulo,
      });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro ao excluir card." },
      { status: 500 }
    );
  }
}

async function parseBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const json = await request.json();
    return {
      id: json.id,
      secao_id: json.secao_id,
      titulo: json.titulo,
      subtitulo: json.subtitulo || null,
      descricao: json.descricao || null,
      imagem_url: json.imagem_url || null,
      icone: json.icone || null,
      link_url: json.link_url || null,
      link_texto: json.link_texto || null,
      ordem: Number(json.ordem ?? 0),
      ativo: json.ativo !== false,
    };
  } else {
    const formData = await request.formData();
    const isAtivoVal = formData.get("ativo");
    return {
      id: optionalString(formData, "id"),
      secao_id: requiredString(formData, "secao_id"),
      titulo: requiredString(formData, "titulo"),
      subtitulo: optionalString(formData, "subtitulo"),
      descricao: optionalString(formData, "descricao"),
      imagem_url: optionalString(formData, "imagem_url"),
      icone: optionalString(formData, "icone"),
      link_url: optionalString(formData, "link_url"),
      link_texto: optionalString(formData, "link_texto"),
      ordem: Number(formData.get("ordem") || 0),
      ativo: isAtivoVal !== null ? isAtivoVal === "true" || isAtivoVal === "on" : true,
    };
  }
}
