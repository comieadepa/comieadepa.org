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

function getReadSchemaHeaders(table: string): Record<string, string> {
  return table.startsWith("cms_") || table.startsWith("v_") ? { "Accept-Profile": siteSchema } : {};
}
