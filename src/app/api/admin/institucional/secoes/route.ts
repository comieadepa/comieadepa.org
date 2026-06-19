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

export type CmsInstitucionalSecao = {
  id: string;
  institucional_id: string;
  tipo: "texto" | "imagem_texto" | "cta" | "cards" | "documentos";
  titulo: string | null;
  subtitulo: string | null;
  conteudo: string | null;
  imagem_url: string | null;
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
    return Response.json({ error: "Sem permissão para visualizar seções." }, { status: 403 });
  }

  const url = new URL(request.url);
  const institucionalId = url.searchParams.get("institucional_id");
  const id = url.searchParams.get("id");

  const baseSelect = "select=id,institucional_id,tipo,titulo,subtitulo,conteudo,imagem_url,ordem,ativo,created_at,updated_at";

  if (id) {
    const rows = await selectSupabaseRows<CmsInstitucionalSecao>(
      "cms_institucional_secoes",
      `${baseSelect}&id=eq.${encodeURIComponent(id)}&limit=1`
    );
    return Response.json(rows[0] ?? null);
  }

  if (!institucionalId) {
    return Response.json({ error: "Informe institucional_id." }, { status: 400 });
  }

  const rows = await selectSupabaseRows<CmsInstitucionalSecao>(
    "cms_institucional_secoes",
    `${baseSelect}&institucional_id=eq.${encodeURIComponent(institucionalId)}&order=ordem.asc,created_at.asc&limit=100`
  );

  return Response.json(rows);
}

export async function POST(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  if (!canPerformAdminAction(role, "institucional", "create")) {
    return Response.json({ error: "Sem permissão para criar seção." }, { status: 403 });
  }

  try {
    const body = await parseBody(request);

    if (!body.institucional_id) {
      return Response.json({ error: "Informe o institucional_id." }, { status: 400 });
    }

    const payload = {
      institucional_id: body.institucional_id,
      tipo: body.tipo,
      titulo: body.titulo,
      subtitulo: body.subtitulo,
      conteudo: body.conteudo,
      imagem_url: body.imagem_url,
      ordem: body.ordem,
      ativo: body.ativo,
      updated_at: new Date().toISOString(),
    };

    const inserted = (await insertSupabaseRow("cms_institucional_secoes", payload)) as Array<{ id?: string }>;

    await createAuditLog({
      request,
      action: "create_secao",
      entity: "institucional",
      entityId: inserted[0]?.id,
      entityTitle: body.titulo || `Seção ${body.tipo}`,
      metadata: { tipo: body.tipo, institucional_id: body.institucional_id },
    });

    return Response.json({ ok: true, id: inserted[0]?.id });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro ao criar seção." },
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
    return Response.json({ error: "Sem permissão para editar seção." }, { status: 403 });
  }

  try {
    const body = await parseBody(request);

    if (!body.id) {
      return Response.json({ error: "Informe o id da seção." }, { status: 400 });
    }

    const payload = {
      tipo: body.tipo,
      titulo: body.titulo,
      subtitulo: body.subtitulo,
      conteudo: body.conteudo,
      imagem_url: body.imagem_url,
      ordem: body.ordem,
      ativo: body.ativo,
      updated_at: new Date().toISOString(),
    };

    await updateSupabaseRows("cms_institucional_secoes", `id=eq.${encodeURIComponent(body.id)}`, payload);

    await createAuditLog({
      request,
      action: "update_secao",
      entity: "institucional",
      entityId: body.id,
      entityTitle: body.titulo || `Seção ${body.tipo}`,
      metadata: { tipo: body.tipo },
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro ao atualizar seção." },
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
    return Response.json({ error: "Sem permissão para excluir seção." }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Informe o id." }, { status: 400 });
  }

  try {
    const current = await selectSupabaseRows<CmsInstitucionalSecao>(
      "cms_institucional_secoes",
      `select=titulo,tipo&id=eq.${encodeURIComponent(id)}&limit=1`
    );

    await deleteSupabaseRows("cms_institucional_secoes", `id=eq.${encodeURIComponent(id)}`);

    if (current[0]) {
      await createAuditLog({
        request,
        action: "delete_secao",
        entity: "institucional",
        entityId: id,
        entityTitle: current[0].titulo || `Seção ${current[0].tipo}`,
      });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro ao excluir seção." },
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
      institucional_id: json.institucional_id,
      tipo: json.tipo || "texto",
      titulo: json.titulo || null,
      subtitulo: json.subtitulo || null,
      conteudo: json.conteudo || null,
      imagem_url: json.imagem_url || null,
      ordem: Number(json.ordem ?? 0),
      ativo: json.ativo !== false,
    };
  } else {
    const formData = await request.formData();
    const isAtivoVal = formData.get("ativo");
    return {
      id: optionalString(formData, "id"),
      institucional_id: requiredString(formData, "institucional_id"),
      tipo: (optionalString(formData, "tipo") || "texto") as "texto" | "imagem_texto" | "cta",
      titulo: optionalString(formData, "titulo"),
      subtitulo: optionalString(formData, "subtitulo"),
      conteudo: optionalString(formData, "conteudo"),
      imagem_url: optionalString(formData, "imagem_url"),
      ordem: Number(formData.get("ordem") || 0),
      ativo: isAtivoVal !== null ? isAtivoVal === "true" || isAtivoVal === "on" : true,
    };
  }
}
