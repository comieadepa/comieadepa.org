import { ArrowRight, CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { buildSeoMetadata } from "@/lib/seo";
import { selectPublicRows } from "@/lib/supabase-public";

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
    <main className="min-h-screen bg-[#120f0a] px-5 py-16 text-[#fff7e5] sm:px-8">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a] transition hover:text-white">
          COMIEADEPA
        </Link>
        <div className="mt-10 max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#f4cf6a]">Notícias</p>
          <h1 className="mt-5 font-serif text-4xl font-black leading-[1.04] text-white sm:text-6xl">Comunicação oficial da convenção.</h1>
          <p className="mt-6 text-lg leading-8 text-white/62">Publicações, comunicados e registros institucionais para manter ministros, igrejas e departamentos alinhados.</p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/noticias/${post.slug}`}
              className="group flex min-h-[260px] flex-col justify-between border border-white/12 bg-white/[0.055] p-6 transition hover:-translate-y-1 hover:border-[#f4cf6a]/55 hover:bg-white/[0.075]"
            >
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#f4cf6a]">
                  <CalendarDays size={15} />
                  {formatDate(post.publicado_em ?? post.created_at)}
                </span>
                <span className="mt-5 inline-flex border border-[#f4cf6a]/30 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#f4cf6a]">
                  {resolvePostLabel(post, categoryMap, departmentMap)}
                </span>
                <h2 className="mt-6 font-serif text-2xl font-black leading-tight text-white">{post.titulo}</h2>
                {post.resumo ? <p className="mt-4 text-base leading-7 text-white/58">{post.resumo}</p> : null}
              </div>
              <span className="mt-8 inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.16em] text-[#f4cf6a]">
                Ler notícia <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>

        {posts.length === 0 ? (
          <div className="mt-12 border border-white/12 bg-white/[0.055] p-8 text-white/62">
            Nenhuma notícia publicada no momento. Assim que a equipe publicar pelo painel, esta página será atualizada automaticamente.
          </div>
        ) : null}
      </section>
    </main>
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
