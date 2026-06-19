import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { PublicLayout } from "@/components/site/PublicLayout";
import { InstitutionalHero } from "@/components/site/InstitutionalHero";
import { InstitutionalContent } from "@/components/site/InstitutionalContent";
import { CmsInstitucional } from "@/lib/institucional";
import type { CmsInstitucionalSecao } from "@/app/api/admin/institucional/secoes/route";
import type { CmsInstitucionalCard } from "@/app/api/admin/institucional/cards/route";
import type { CmsInstitucionalDocumento } from "@/app/api/admin/institucional/documentos/route";
import { Eye } from "lucide-react";

export const metadata: Metadata = {
  title: "Pré-visualização | Admin COMIEADEPA",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminInstitucionalPreview({ params }: PageProps) {
  const { id } = await params;

  // Fetch page by ID — allows rascunho status (admin-only query)
  const rows = await selectSupabaseRows<CmsInstitucional>(
    "cms_institucional",
    `select=id,titulo,slug,subtitulo,descricao,conteudo,hero_image_url,hero_badge,hero_overlay_opacity,hero_alignment,status&id=eq.${encodeURIComponent(id)}&limit=1`
  );
  const page = rows[0];

  if (!page) {
    notFound();
  }

  // Active sections (preview shows all — ativo or not is not filtered here, matches public behaviour for active only)
  const secoes = await selectSupabaseRows<CmsInstitucionalSecao>(
    "cms_institucional_secoes",
    `select=id,tipo,titulo,subtitulo,conteudo,imagem_url,ordem&ativo=eq.true&institucional_id=eq.${encodeURIComponent(page.id)}&order=ordem.asc,created_at.asc&limit=100`
  );

  const secaoIds = secoes.map((s) => s.id);

  const cards =
    secaoIds.length > 0
      ? await selectSupabaseRows<CmsInstitucionalCard>(
          "cms_institucional_cards",
          `select=id,secao_id,titulo,subtitulo,descricao,imagem_url,icone,link_url,link_texto,ordem&ativo=eq.true&secao_id=in.(${secaoIds.join(",")})&order=ordem.asc,created_at.asc&limit=200`
        )
      : [];

  const linkedDocs =
    secaoIds.length > 0
      ? await selectSupabaseRows<CmsInstitucionalDocumento>(
          "cms_institucional_documentos",
          `select=id,secao_id,documento_id,ordem,cms_documentos(id,titulo,slug,categoria,arquivo_url,tamanho,tipo_arquivo)&ativo=eq.true&secao_id=in.(${secaoIds.join(",")})&order=ordem.asc,created_at.asc&limit=100`
        )
      : [];

  return (
    <PublicLayout>
      {/* Admin preview banner */}
      <div className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-[#B8872D]/30 bg-[#171006]/95 px-5 py-2.5 backdrop-blur-md sm:px-8">
        <div className="flex items-center gap-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#f4cf6a]">
          <Eye size={14} className="shrink-0" />
          Pré-visualização administrativa
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] ${
              page.status === "publicado"
                ? "bg-[#00b67a]/20 text-[#00b67a]"
                : "bg-amber-500/20 text-amber-400"
            }`}
          >
            {page.status === "publicado" ? "Publicado" : "Rascunho"}
          </span>
          <a
            href="/admin/institucional"
            className="text-[11px] font-black uppercase tracking-[0.14em] text-white/50 transition hover:text-white"
          >
            ← Voltar ao painel
          </a>
        </div>
      </div>

      <main className="min-h-screen bg-white text-[#1F2937]">
        <article>
          <InstitutionalHero
            title={page.titulo}
            subtitle={page.subtitulo}
            backgroundImage={page.hero_image_url}
            overlayOpacity={page.hero_overlay_opacity}
            badge={page.hero_badge}
            alignment={page.hero_alignment}
          />

          <InstitutionalContent
            descricao={page.descricao}
            conteudo={page.conteudo}
            secoes={secoes}
            cards={cards}
            linkedDocs={linkedDocs}
          />
        </article>
      </main>
    </PublicLayout>
  );
}
