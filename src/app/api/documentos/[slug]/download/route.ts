import { NextResponse } from "next/server";
import { selectPublicRows } from "@/lib/supabase-public";
import { hasSupabaseAdminConfig, selectSupabaseRows, updateSupabaseRows } from "@/lib/supabase-admin";
import { CmsDocument } from "@/lib/documentos";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const query =
    "select=id,slug,arquivo_url,downloads,status&status=eq.publicado" +
    `&slug=eq.${encodeURIComponent(slug)}&limit=1`;

  const rows = hasSupabaseAdminConfig()
    ? await selectSupabaseRows<Pick<CmsDocument, "id" | "slug" | "arquivo_url" | "downloads" | "status">>("cms_documentos", query)
    : await selectPublicRows<Pick<CmsDocument, "id" | "slug" | "arquivo_url" | "downloads" | "status">>("cms_documentos", query);
  const document = rows[0];

  if (!document?.arquivo_url) {
    return Response.json({ error: "Documento nao encontrado." }, { status: 404 });
  }

  if (hasSupabaseAdminConfig()) {
    try {
      await updateSupabaseRows("cms_documentos", `id=eq.${encodeURIComponent(document.id)}`, {
        downloads: Number(document.downloads ?? 0) + 1,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Mantem o download disponivel mesmo se a contagem falhar.
    }
  }

  return NextResponse.redirect(document.arquivo_url, 307);
}
