const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://wtifljxpoinpbzyugrfc.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const siteSchema = process.env.NEXT_PUBLIC_SUPABASE_SITE_SCHEMA ?? "site";

export async function selectPublicRows<TResult>(table: string, query: string) {
  if (!supabaseAnonKey) {
    return [] as TResult[];
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      ...getReadSchemaHeaders(table),
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    console.warn(`Não foi possível carregar ${table}. Status: ${response.status}.`);
    return [] as TResult[];
  }

  return (await response.json()) as TResult[];
}

export async function countPublicRows(table: string, query = "select=id") {
  if (!supabaseAnonKey) {
    return 0;
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      ...getReadSchemaHeaders(table),
      Prefer: "count=exact",
      Range: "0-0",
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    console.warn(`NÃ£o foi possÃ­vel contar ${table}. Status: ${response.status}.`);
    return 0;
  }

  const contentRange = response.headers.get("content-range");
  const count = Number(contentRange?.split("/").at(1));

  return Number.isFinite(count) ? count : 0;
}

function getReadSchemaHeaders(table: string): Record<string, string> {
  return table.startsWith("cms_") || table.startsWith("v_") ? { "Accept-Profile": siteSchema } : {};
}
