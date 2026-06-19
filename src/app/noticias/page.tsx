import { ArrowRight, CalendarDays, Newspaper } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { buildSeoMetadata } from "@/lib/seo";
import { selectPublicRows } from "@/lib/supabase-public";
import { PublicLayout } from "@/components/site/PublicLayout";
import { SectionPageHeader } from "@/components/site/SectionPageHeader";
import { PublicEmptyState } from "@/components/site/PublicEmptyState";

type CmsPost = {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  categoria_id: string | null;
  departamento_id: string | null;
  publicado_em: string | null;
  created_at: string;
};

type CmsLookup = {
  id: string;
  nome: string | null;
};

export const metadata: Metadata = buildSeoMetadata({
  title: "Notícias | COMIEADEPA",
  description: "Publicações, comunicados e registros institucionais da COMIEADEPA.",
  path: "/noticias",
});

export default async function NewsIndexPage() {
  const [posts, categories, departments] = await Promise.all([
    selectPublicRows<CmsPost>(
      "cms_posts",
      `select=id,titulo,slug,resumo,categoria_id,departamento_id,publicado_em,created_at&status=eq.publicado${getPublishedPostsPublicFilter()}&order=publicado_em.desc.nullslast,created_at.desc&limit=12`,
    ),
    selectPublicRows<CmsLookup>("cms_categorias", "select=id,nome&order=nome.asc"),
    selectPublicRows<CmsLookup>("cms_departamentos", "select=id,nome&ativo=eq.true&order=ordem.asc,nome.asc"),
  ]);
  const categoryMap = buildLookupMap(categories);
  const departmentMap = buildLookupMap(departments);

  return (
    <PublicLayout>
      <main className="min-h-screen bg-white text-[#1F2937]">
        <SectionPageHeader
          badge="Notícias"
          title="Notícias"
          description="Publicações, comunicados e registros institucionais para manter ministros, igrejas e departamentos alinhados."
          icon={<Newspaper size={16} />}
        />

        <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          {posts.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/noticias/${post.slug}`}
                  className="group flex min-h-[260px] flex-col justify-between rounded-xl border border-[#0F3B63]/10 bg-[#F4F6F8] p-6 shadow-[0_18px_50px_rgba(15,59,99,.10)] transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_60px_rgba(15,59,99,.16)]"
                >
                  <div>
                    <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#B8872D]">
                      <CalendarDays size={15} />
                      {formatDate(post.publicado_em ?? post.created_at)}
                    </span>
                    <span className="mt-5 inline-flex rounded-md border border-[#D4A24C]/40 bg-white px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#0F3B63]">
                      {resolvePostLabel(post, categoryMap, departmentMap)}
                    </span>
                    <h2 className="mt-6 font-serif text-2xl font-black leading-tight text-[#0F3B63]">{post.titulo}</h2>
                    {post.resumo ? <p className="mt-4 text-base leading-7 text-[#6B7280]">{post.resumo}</p> : null}
                  </div>
                  <span className="mt-8 inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.16em] text-[#0F3B63]">
                    Ler notícia <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <PublicEmptyState
              title="Nenhuma notícia publicada"
              description="Nenhuma notícia publicada no momento. Assim que a equipe publicar pelo painel, esta página será atualizada automaticamente."
            />
          )}
        </section>
      </main>
    </PublicLayout>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

function buildLookupMap(rows: CmsLookup[]) {
  return new Map(rows.map((row) => [row.id, row.nome?.trim() ?? ""]));
}

function resolvePostLabel(post: CmsPost, categoryMap: Map<string, string>, departmentMap: Map<string, string>) {
  return categoryMap.get(post.categoria_id ?? "") || departmentMap.get(post.departamento_id ?? "") || "Notícia";
}

function getPublishedPostsPublicFilter() {
  return `&or=(publicado_em.is.null,publicado_em.lte.${encodeURIComponent(new Date().toISOString())})`;
}
