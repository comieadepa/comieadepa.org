import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicLayout } from "@/components/site/PublicLayout";
import { GalleryLightbox } from "../gallery-lightbox";
import { absoluteUrl, buildSeoMetadata } from "@/lib/seo";
import { CmsGallery, CmsGalleryPhoto, formatGalleryDate, stripGalleryText } from "@/lib/galerias";
import { selectPublicRows } from "@/lib/supabase-public";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const galleries = await selectPublicRows<CmsGallery>(
    "cms_galerias",
    `select=id,titulo,slug,descricao,categoria,capa_url,status,destaque,ordem,data_evento,created_at,updated_at,created_by&status=eq.publicado&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  );
  const gallery = galleries[0];

  if (!gallery) {
    return buildSeoMetadata({
      title: "Galeria nao encontrada | COMIEADEPA",
      description: "A galeria solicitada nao esta disponivel no portal institucional da COMIEADEPA.",
      path: `/galeria/${slug}`,
    });
  }

  return buildSeoMetadata({
    title: `${gallery.titulo} | COMIEADEPA`,
    description: stripGalleryText(gallery.descricao) || "Galeria oficial da COMIEADEPA.",
    path: `/galeria/${gallery.slug}`,
    image: gallery.capa_url,
    type: "article",
  });
}

export default async function GalleryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const galleries = await selectPublicRows<CmsGallery>(
    "cms_galerias",
    `select=id,titulo,slug,descricao,categoria,capa_url,status,destaque,ordem,data_evento,created_at,updated_at,created_by&status=eq.publicado&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  );
  const gallery = galleries[0];

  if (!gallery) {
    notFound();
  }

  const [photos, relatedGalleries] = await Promise.all([
    selectPublicRows<CmsGalleryPhoto>(
      "cms_galeria_fotos",
      `select=id,galeria_id,imagem_url,legenda,credito,ordem,created_at&galeria_id=eq.${encodeURIComponent(gallery.id)}&order=ordem.asc,created_at.asc&limit=1000`,
    ),
    selectRelatedGalleries(gallery),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: gallery.titulo,
    description: gallery.descricao || "Galeria fotográfica institucional da COMIEADEPA.",
    url: absoluteUrl(`/galeria/${gallery.slug}`),
    image: photos.map((photo) => absoluteUrl(photo.imagem_url)),
  };

  return (
    <PublicLayout>
      <main className="min-h-screen bg-white text-[#1F2937]">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <article>
          <header className="relative overflow-hidden px-5 py-16 sm:px-8">
            <div className="absolute inset-0">
              <Image src={gallery.capa_url?.trim() || "/assets/sede-aerea-comieadepa.jpg"} alt={gallery.titulo} fill className="object-cover opacity-20" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-white/86 via-white/94 to-white" />
            <div className="relative mx-auto max-w-4xl">
              <Link href="/galeria" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-[#0F3B63] transition hover:text-[#4A86B8]">
                Galeria
              </Link>

              <div className="mt-10">
                {gallery.categoria ? (
                  <span className="inline-flex rounded-md border border-[#D4A24C]/40 bg-white px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#0F3B63]">
                    {gallery.categoria}
                  </span>
                ) : null}
                <h1 className="mt-6 font-serif text-4xl font-black leading-[1.04] text-[#0F3B63] sm:text-6xl">{gallery.titulo}</h1>
                {gallery.descricao ? <p className="mt-6 text-xl leading-8 text-[#6B7280]">{gallery.descricao}</p> : null}

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="border border-[#0F3B63]/10 bg-white px-4 py-4 shadow-[0_12px_30px_rgba(15,59,99,.05)]">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#6B7280]">Data do evento</p>
                    <p className="mt-1 text-sm font-bold text-[#0F3B63]">{formatGalleryDate(gallery.data_evento)}</p>
                  </div>
                  <div className="border border-[#0F3B63]/10 bg-white px-4 py-4 shadow-[0_12px_30px_rgba(15,59,99,.05)]">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#6B7280]">Quantidade de fotos</p>
                    <p className="mt-1 text-sm font-bold text-[#0F3B63]">{photos.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-6xl px-5 pb-14 sm:px-8">
            <div className="relative mb-10 aspect-[16/8] overflow-hidden border border-[#0F3B63]/10 bg-[#E5ECF3] shadow-[0_20px_60px_rgba(15,59,99,.08)]">
              <Image src={gallery.capa_url?.trim() || "/assets/sede-aerea-comieadepa.jpg"} alt={gallery.titulo} fill className="object-cover" />
            </div>

            <GalleryLightbox photos={photos} galleryTitle={gallery.titulo} />

            {photos.length === 0 ? (
              <div className="mt-6 border border-[#0F3B63]/10 bg-[#F4F6F8] p-8 text-[#6B7280]">Nenhuma foto publicada nesta galeria.</div>
            ) : null}
          </div>

          <section className="border-t border-[#0F3B63]/10 bg-[#F8FAFC] px-5 py-14 sm:px-8">
            <div className="mx-auto max-w-6xl">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#B8872D]">Relacionadas</p>
              <h2 className="mt-3 font-serif text-4xl font-black text-[#0F3B63]">Outras galerias</h2>

              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {relatedGalleries.map((related) => (
                  <article key={related.id} className="overflow-hidden border border-[#0F3B63]/10 bg-white shadow-[0_18px_50px_rgba(15,59,99,.08)]">
                    <Link href={`/galeria/${related.slug}`} className="block">
                      <div className="relative aspect-[16/10] bg-[#E5ECF3]">
                        <Image src={related.capa_url?.trim() || "/assets/sede-aerea-comieadepa.jpg"} alt={related.titulo} fill className="object-cover" />
                      </div>
                      <div className="p-5">
                        {related.categoria ? <span className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#B8872D]">{related.categoria}</span> : null}
                        <h3 className="mt-3 font-serif text-2xl font-black leading-tight text-[#0F3B63]">{related.titulo}</h3>
                        {related.descricao ? <p className="mt-3 line-clamp-3 leading-7 text-[#6B7280]">{related.descricao}</p> : null}
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              {relatedGalleries.length === 0 ? (
                <div className="mt-8 border border-[#0F3B63]/10 bg-white p-6 text-[#6B7280]">Nenhuma galeria relacionada disponivel.</div>
              ) : null}
            </div>
          </section>
        </article>
      </main>
    </PublicLayout>
  );
}

async function selectRelatedGalleries(gallery: CmsGallery) {
  const categoryQuery = gallery.categoria ? `&categoria=eq.${encodeURIComponent(gallery.categoria)}` : "";
  const related = await selectPublicRows<CmsGallery>(
    "cms_galerias",
    `select=id,titulo,slug,descricao,categoria,capa_url,status,destaque,ordem,data_evento,created_at,updated_at,created_by&status=eq.publicado&id=neq.${encodeURIComponent(gallery.id)}${categoryQuery}&order=destaque.desc,data_evento.desc.nullslast,updated_at.desc&limit=3`,
  );

  if (related.length > 0 || !gallery.categoria) {
    return related;
  }

  return selectPublicRows<CmsGallery>(
    "cms_galerias",
    `select=id,titulo,slug,descricao,categoria,capa_url,status,destaque,ordem,data_evento,created_at,updated_at,created_by&status=eq.publicado&id=neq.${encodeURIComponent(gallery.id)}&order=destaque.desc,data_evento.desc.nullslast,updated_at.desc&limit=3`,
  );
}
