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

export type CmsInstitucionalDocumento = {
  id: string;
  secao_id: string;
  documento_id: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
  cms_documentos?: {
    id: string;
    titulo: string;
    slug: string;
    categoria: string | null;
    arquivo_url: string;
    tamanho: number;
    tipo_arquivo: string | null;
  } | null;
};

export async function GET(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return missingSupabaseAdminResponse();
  }

  const role = normalizeAdminRole(request.headers.get("x-admin-role"));
  if (!canPerformAdminAction(role, "institucional", "view")) {
    return Response.json({ error: "Sem permissão para visualizar documentos vinculados." }, { status: 403 });
  }

  const url = new URL(request.url);
  const secaoId = url.searchParams.get("secao_id");
  const id = url.searchParams.get("id");

  const baseSelect = "select=id,secao_id,documento_id,ordem,ativo,created_at,cms_documentos(id,titulo,categoria,arquivo_url,tamanho,tipo_arquivo)";

  if (id) {
    const rows = await selectSupabaseRows<CmsInstitucionalDocumento>(
      "cms_institucional_documentos",
      `${baseSelect}&id=eq.${encodeURIComponent(id)}&limit=1`
    );
    return Response.json(rows[0] ?? null);
  }

  if (!secaoId) {
    return Response.json({ error: "Informe secao_id." }, { status: 400 });
  }

  const rows = await selectSupabaseRows<CmsInstitucionalDocumento>(
    "cms_institucional_documentos",
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
    return Response.json({ error: "Sem permissão para vincular documento." }, { status: 403 });
  }

  try {
    const body = await parseBody(request);

    if (!body.secao_id || !body.documento_id) {
      return Response.json({ error: "Informe secao_id e documento_id." }, { status: 400 });
    }

    // Verificar se já existe vínculo
    const existing = await selectSupabaseRows<CmsInstitucionalDocumento>(
      "cms_institucional_documentos",
      `select=id&secao_id=eq.${encodeURIComponent(body.secao_id)}&documento_id=eq.${encodeURIComponent(body.documento_id)}&limit=1`
    );

    if (existing.length > 0) {
      return Response.json({ error: "Este documento já está vinculado a esta seção." }, { status: 409 });
    }

    const payload = {
      secao_id: body.secao_id,
      documento_id: body.documento_id,
      ordem: body.ordem,
      ativo: body.ativo,
    };

    const inserted = (await insertSupabaseRow("cms_institucional_documentos", payload)) as Array<{ id?: string }>;

    await createAuditLog({
      request,
      action: "link_documento",
      entity: "institucional",
      entityId: inserted[0]?.id,
      entityTitle: `Vínculo Documento ${body.documento_id}`,
      metadata: { secao_id: body.secao_id, documento_id: body.documento_id },
    });

    return Response.json({ ok: true, id: inserted[0]?.id });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro ao vincular documento." },
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
    return Response.json({ error: "Sem permissão para atualizar vínculo." }, { status: 403 });
  }

  try {
    const body = await parseBody(request);

    if (!body.id) {
      return Response.json({ error: "Informe o id do vínculo." }, { status: 400 });
    }

    const payload = {
      ordem: body.ordem,
      ativo: body.ativo,
    };

    await updateSupabaseRows("cms_institucional_documentos", `id=eq.${encodeURIComponent(body.id)}`, payload);

    await createAuditLog({
      request,
      action: "update_link_documento",
      entity: "institucional",
      entityId: body.id,
      entityTitle: `Atualização Vínculo ${body.id}`,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro ao atualizar vínculo." },
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
    return Response.json({ error: "Sem permissão para remover vínculo." }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Informe o id." }, { status: 400 });
  }

  try {
    await deleteSupabaseRows("cms_institucional_documentos", `id=eq.${encodeURIComponent(id)}`);

    await createAuditLog({
      request,
      action: "unlink_documento",
      entity: "institucional",
      entityId: id,
      entityTitle: `Desvínculo Documento ${id}`,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erro ao remover vínculo." },
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
      documento_id: json.documento_id,
      ordem: Number(json.ordem ?? 0),
      ativo: json.ativo !== false,
    };
  } else {
    const formData = await request.formData();
    const isAtivoVal = formData.get("ativo");
    return {
      id: optionalString(formData, "id"),
      secao_id: requiredString(formData, "secao_id"),
      documento_id: requiredString(formData, "documento_id"),
      ordem: Number(formData.get("ordem") || 0),
      ativo: isAtivoVal !== null ? isAtivoVal === "true" || isAtivoVal === "on" : true,
    };
  }
}
