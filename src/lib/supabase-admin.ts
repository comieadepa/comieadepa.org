import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://wtifljxpoinpbzyugrfc.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const mediaBucket = process.env.SUPABASE_MEDIA_BUCKET ?? "cms-media";
const siteSchema = process.env.SUPABASE_SITE_SCHEMA ?? "site";

export function hasSupabaseAdminConfig() {
  return Boolean(supabaseUrl && serviceRoleKey);
}

export function missingSupabaseAdminResponse() {
  return NextResponse.json(
    {
      error: "SUPABASE_SERVICE_ROLE_KEY não configurada no ambiente do servidor.",
    },
    { status: 500 },
  );
}

export async function insertSupabaseRow<TPayload extends Record<string, unknown>>(table: string, payload: TPayload) {
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      ...getWriteSchemaHeaders(table),
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase retornou ${response.status}.`);
  }

  return response.json();
}

export async function updateSupabaseRows<TPayload extends Record<string, unknown>>(table: string, filter: string, payload: TPayload) {
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${filter}`, {
    method: "PATCH",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      ...getWriteSchemaHeaders(table),
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase retornou ${response.status}.`);
  }

  return response.json();
}

export async function selectSupabaseRows<TResult>(table: string, query: string) {
  if (!serviceRoleKey) {
    return [] as TResult[];
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      ...getReadSchemaHeaders(table),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    console.warn(`Supabase retornou ${response.status} ao ler ${table}.`);
    return [] as TResult[];
  }

  return (await response.json()) as TResult[];
}

export async function countSupabaseRows(table: string, query = "select=id") {
  if (!serviceRoleKey) {
    return 0;
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      ...getReadSchemaHeaders(table),
      Prefer: "count=exact",
      Range: "0-0",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    console.warn(`Supabase retornou ${response.status} ao contar ${table}.`);
    return 0;
  }

  const contentRange = response.headers.get("content-range");
  const count = Number(contentRange?.split("/").at(1));

  return Number.isFinite(count) ? count : 0;
}

export async function deleteSupabaseRows(table: string, filter: string) {
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${filter}`, {
    method: "DELETE",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      ...getWriteSchemaHeaders(table),
      Prefer: "return=minimal",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase retornou ${response.status}.`);
  }
}

type AuditLogPayload = {
  request: Request;
  action: string;
  entity: string;
  entityId?: string | null;
  entityTitle?: string | null;
  metadata?: Record<string, unknown>;
};

export async function createAuditLog({ request, action, entity, entityId, entityTitle, metadata }: AuditLogPayload) {
  if (!serviceRoleKey) {
    return;
  }

  try {
    await insertSupabaseRow("cms_audit_logs", {
      actor: getAdminActor(request),
      action,
      entity,
      entity_id: entityId ?? null,
      entity_title: entityTitle ?? null,
      metadata: metadata ?? null,
    });
  } catch (error) {
    console.warn("Não foi possível registrar auditoria.", error);
  }
}

export async function uploadPublicStorageObject(file: File, folder: string) {
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }

  await ensurePublicStorageBucket(mediaBucket);

  const cleanFolder = slugify(folder || "geral") || "geral";
  const fileName = buildStorageFileName(file.name);
  const objectPath = `${cleanFolder}/${Date.now()}-${fileName}`;
  const encodedPath = objectPath.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${mediaBucket}/${encodedPath}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "true",
    },
    body: await file.arrayBuffer(),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase Storage retornou ${response.status}.`);
  }

  return {
    bucket: mediaBucket,
    path: objectPath,
    publicUrl: `${supabaseUrl}/storage/v1/object/public/${mediaBucket}/${encodedPath}`,
  };
}

async function ensurePublicStorageBucket(bucket: string) {
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }

  const existingBucket = await fetch(`${supabaseUrl}/storage/v1/bucket/${bucket}`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (existingBucket.ok) {
    return;
  }

  if (existingBucket.status !== 404) {
    const message = await existingBucket.text();
    throw new Error(message || `Não foi possível verificar o bucket ${bucket}.`);
  }

  const createBucket = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: bucket,
      name: bucket,
      public: true,
      file_size_limit: 10485760,
      allowed_mime_types: ["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf"],
    }),
  });

  if (!createBucket.ok && createBucket.status !== 409) {
    const message = await createBucket.text();
    throw new Error(message || `Não foi possível criar o bucket ${bucket}.`);
  }
}

export function redirectWithStatus(requestUrl: string, path: string, status: "success" | "error", message?: string) {
  const url = new URL(path, new URL(requestUrl).origin);
  url.searchParams.set(status, "1");

  if (message) {
    url.searchParams.set("message", message);
  }

  return NextResponse.redirect(url, 303);
}

export function requiredString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function optionalString(formData: FormData, key: string) {
  const value = requiredString(formData, key);
  return value.length > 0 ? value : null;
}

export function optionalDateTime(formData: FormData, key: string) {
  const value = requiredString(formData, key);
  return value.length > 0 ? new Date(value).toISOString() : null;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildStorageFileName(name: string) {
  const parts = name.split(".");
  const extension = parts.length > 1 ? parts.pop()?.toLowerCase() : "";
  const baseName = slugify(parts.join(".") || "arquivo") || "arquivo";

  return extension ? `${baseName}.${extension}` : baseName;
}

export function mapPostStatus(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("revis")) {
    return "revisao";
  }

  if (normalized.includes("public")) {
    return "publicado";
  }

  if (normalized.includes("agend")) {
    return "agendado";
  }

  if (normalized.includes("arquiv")) {
    return "arquivado";
  }

  return "rascunho";
}

export function getYoutubeId(url: string) {
  const patterns = [/youtu\.be\/([^?&/]+)/, /youtube\.com\/watch\?v=([^?&/]+)/, /youtube\.com\/shorts\/([^?&/]+)/, /youtube\.com\/embed\/([^?&/]+)/];
  const match = patterns.map((pattern) => url.match(pattern)?.[1]).find(Boolean);
  return match ?? null;
}

function getAdminActor(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Basic ")) {
    return "admin";
  }

  try {
    const decoded = atob(authHeader.replace("Basic ", ""));
    const separatorIndex = decoded.indexOf(":");

    if (separatorIndex === -1) {
      return "admin";
    }

    return decoded.slice(0, separatorIndex) || "admin";
  } catch {
    return "admin";
  }
}

function getReadSchemaHeaders(table: string): Record<string, string> {
  return isSiteRelation(table) ? { "Accept-Profile": siteSchema } : {};
}

function getWriteSchemaHeaders(table: string): Record<string, string> {
  return isSiteRelation(table) ? { "Content-Profile": siteSchema, "Accept-Profile": siteSchema } : {};
}

function isSiteRelation(table: string) {
  return table.startsWith("cms_") || table.startsWith("v_");
}
