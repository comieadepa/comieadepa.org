import { Search } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicLayout } from "@/components/site/PublicLayout";
import { absoluteUrl, buildSeoMetadata } from "@/lib/seo";
import {
  buildGalleryFilters,
  buildGalleryOrder,
  CmsGallery,
  CmsGalleryPhoto,
  formatGalleryDate,
  getGalleryYearOptions,
  sanitizeGallerySearchTerm,
  stripGalleryText,
} from "@/lib/galerias";
import { countPublicRows, selectPublicRows } from "@/lib/supabase-public";

const pageSize = 9;

export const metadata: Metadata = buildSeoMetadata({
  title: "Galeria de Fotos | COMIEADEPA",
  description: "Confira registros fotogrÃ¡ficos de eventos, reuniÃµes, congressos e aÃ§Ãµes institucionais da COMIEADEPA.",
  path: "/galeria",
});

type SearchParams = Promise<{
  q?: string;
  categoria?: string;
  ano?: string;
  page?: string;
}>;

export default async function GalleryIndexPage({ searchParams }: { searchParams?: SearchParams }) {
  const params = await searchParams;
  const search = sanitizeGallerySearchTerm(params?.q);
  const category = (params?.categoria ?? "").trim();
  const year = (params?.ano ?? "").trim();
  const page = Math.max(Number(params?.page ?? "1") || 1, 1);
  const offset = (page - 1) * pageSize;
  const filters = buildGalleryFilters({ search, category, year, status: "publicado" });

  const [galleries, total, categoriesSource, yearsSource] = await Promise.all([
    selectPublicRows<CmsGallery>(
      "cms_galerias",
      `select=id,titulo,slug,descricao,categoria,capa_url,status,destaque,ordem,data_evento,created_at,updated_at,created_by&status=eq.publicado${filters.replace("&status=eq.publicado", "")}&order=${buildGalleryOrder()}&limit=${pageSize}&offset=${offset}`,
    ),
    countPublicRows("cms_galerias", `select=id&status=eq.publicado${filters.replace("&status=eq.publicado", "")}`),
    selectPublicRows<Pick<CmsGallery, "categoria">>("cms_galerias", "select=categoria&status=eq.publicado&order=categoria.asc&limit=200"),
    selectPublicRows<Pick<CmsGallery, "data_evento">>("cms_galerias", "select=data_evento&status=eq.publicado&order=data_evento.desc&limit=200"),
  ]);

  const photoCounts = await loadPhotoCounts(galleries);
  const categories = Array.from(new Set(categoriesSource.map((item) => item.categoria?.trim()).filter((value): value is string => Boolean(value)))).sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
  const years = getGalleryYearOptions(yearsSource);
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Galeria de Fotos",
    description: "Confira registros fotogrÃ¡ficos de eventos, reuniÃµes, congressos e aÃ§Ãµes institucionais da COMIEADEPA.",
    url: absoluteUrl("/galeria"),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: galleries.map((gallery, index) => ({
        "@type": "ListItem",
        position: offset + index + 1,
        url: absoluteUrl(`/galeria/${gallery.slug}`),
        name: gallery.titulo,
      })),
    },
  };

  return (
    <PublicLayout>
      <main className="min-h-screen bg-white text-[#1F2937]">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <section className="relative overflow-hidden bg-[#0F3B63] py-20 text-white md:py-24">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,59,99,0.98)_0%,rgba(29,90,140,0.88)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(212,162,76,0.15),transparent_50%)]" />
          <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(135deg,#fff_1px,transparent_1px)] [background-size:38px_38px]" />

          <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
            <Link href="/" className="text-sm font-black uppercase tracking-[0.18em] text-[#F8D77B] transition hover:text-white">
              COMIEADEPA
            </Link>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F8D77B]">Galeria</p>
                <h1 className="mt-4 font-serif text-5xl font-black leading-[1.04] text-white sm:text-7xl">Galeria de Fotos</h1>
              </div>
              <p className="text-lg leading-8 text-white/80 border-l border-white/20 pl-6 lg:border-l-2">
                Confira registros fotográficos de eventos, reuniões, congressos e ações institucionais da COMIEADEPA.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <form className="mt-10 grid gap-4 border border-[#0F3B63]/10 bg-[#F8FAFC] p-5 shadow-[0_18px_50px_rgba(15,59,99,.06)] md:grid-cols-[1.2fr_.9fr_.7fr_auto]">
            <label className="flex items-center gap-3 border border-[#0F3B63]/10 bg-white px-4 py-3 text-sm text-[#6B7280]">
              <Search size={18} className="text-[#B8872D]" />
              <input type="search" name="q" defaultValue={search} className="w-full bg-transparent outline-none" placeholder="Pesquisar galerias" />
            </label>

            <select name="categoria" defaultValue={category} className="border border-[#0F3B63]/10 bg-white px-4 py-3 text-sm text-[#1F2937] outline-none">
              <option value="">Todas as categorias</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select name="ano" defaultValue={year} className="border border-[#0F3B63]/10 bg-white px-4 py-3 text-sm text-[#1F2937] outline-none">
              <option value="">Todos os anos</option>
              {years.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <button type="submit" className="bg-[#0F3B63] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white">
              Filtrar
            </button>
          </form>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {galleries.map((gallery) => (
              <article key={gallery.id} className="overflow-hidden border border-[#0F3B63]/10 bg-white shadow-[0_18px_48px_rgba(15,59,99,.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,59,99,.12)]">
                <Link href={`/galeria/${gallery.slug}`} className="block">
                  <div className="relative aspect-[16/10] bg-[#F4F6F8]">
                    <Image src={gallery.capa_url?.trim() || "/assets/sede-aerea-comieadepa.jpg"} alt={gallery.titulo} fill className="object-cover" />
                  </div>
                </Link>

                <div className="p-6">
                  {gallery.categoria ? (
                    <span className="inline-flex rounded-md border border-[#D4A24C]/40 bg-[#fff8e8] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#0F3B63]">
                      {gallery.categoria}
                    </span>
                  ) : null}

                  <Link href={`/galeria/${gallery.slug}`} className="block">
                    <h2 className="mt-5 font-serif text-3xl font-black leading-tight text-[#0F3B63]">{gallery.titulo}</h2>
                  </Link>

                  <p className="mt-4 text-base leading-7 text-[#6B7280]">{stripGalleryText(gallery.descricao, 150) || "Galeria fotogrÃ¡fica institucional da COMIEADEPA."}</p>

                  <dl className="mt-6 grid gap-3 text-sm text-[#4B5563]">
                    <div className="flex items-center justify-between gap-3">
                      <dt>Data do evento</dt>
                      <dd className="font-bold text-[#0F3B63]">{formatGalleryDate(gallery.data_evento)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt>Fotos</dt>
                      <dd className="font-bold text-[#0F3B63]">{photoCounts.get(gallery.id) ?? 0}</dd>
                    </div>
                  </dl>

                  <Link href={`/galeria/${gallery.slug}`} className="mt-6 inline-flex items-center gap-3 bg-[#0F3B63] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#164c7d]">
                    Ver galeria
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {galleries.length === 0 ? (
            <div className="mt-10 border border-[#0F3B63]/10 bg-[#F4F6F8] p-8 text-[#6B7280]">Nenhuma galeria publicada encontrada com os filtros selecionados.</div>
          ) : null}

          <div className="mt-10 flex flex-col gap-4 border-t border-[#0F3B63]/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#6B7280]">
              Pagina {page} de {totalPages}
            </p>
            <div className="flex gap-3">
              <PaginationLink disabled={page <= 1} page={page - 1} search={search} category={category} year={year}>
                Anterior
              </PaginationLink>
              <PaginationLink disabled={page >= totalPages} page={page + 1} search={search} category={category} year={year}>
                Proxima
              </PaginationLink>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}

async function loadPhotoCounts(galleries: CmsGallery[]) {
  const ids = galleries.map((gallery) => gallery.id);
  if (ids.length === 0) {
    return new Map<string, number>();
  }

  const photos = await selectPublicRows<Pick<CmsGalleryPhoto, "galeria_id">>(
    "cms_galeria_fotos",
    `select=galeria_id&galeria_id=in.(${ids.map(encodeURIComponent).join(",")})&limit=1000`,
  );
  const counts = new Map<string, number>();
  for (const photo of photos) {
    counts.set(photo.galeria_id, (counts.get(photo.galeria_id) ?? 0) + 1);
  }
  return counts;
}

function PaginationLink({
  disabled,
  page,
  search,
  category,
  year,
  children,
}: {
  disabled: boolean;
  page: number;
  search: string;
  category: string;
  year: string;
  children: string;
}) {
  const params = new URLSearchParams();
  if (search) {
    params.set("q", search);
  }
  if (category) {
    params.set("categoria", category);
  }
  if (year) {
    params.set("ano", year);
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  const href = params.toString() ? `/galeria?${params.toString()}` : "/galeria";

  if (disabled) {
    return <span className="border border-[#0F3B63]/10 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#9CA3AF]">{children}</span>;
  }

  return (
    <Link href={href} className="border border-[#0F3B63]/10 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#0F3B63] transition hover:border-[#B8872D] hover:text-[#B8872D]">
      {children}
    </Link>
  );
}
