export const galleryStatusOptions = ["rascunho", "publicado", "arquivado"] as const;
export type GalleryStatus = (typeof galleryStatusOptions)[number];

export type CmsGallery = {
  id: string;
  titulo: string;
  slug: string;
  descricao: string | null;
  categoria: string | null;
  capa_url: string | null;
  status: GalleryStatus;
  destaque: boolean;
  ordem: number;
  data_evento: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

export type CmsGalleryPhoto = {
  id: string;
  galeria_id: string;
  imagem_url: string;
  legenda: string | null;
  credito: string | null;
  ordem: number;
  created_at: string;
};

export function normalizeGalleryStatus(value: string) {
  const normalized = value.toLowerCase();
  return galleryStatusOptions.find((status) => status === normalized) ?? "rascunho";
}

export function sanitizeGallerySearchTerm(value: string | null | undefined) {
  return (value ?? "").trim().replace(/[(),]/g, " ");
}

export function buildGalleryFilters(params: {
  search?: string;
  category?: string;
  year?: string;
  status?: GalleryStatus | "";
}) {
  const filters: string[] = [];

  if (params.status) {
    filters.push(`status=eq.${encodeURIComponent(params.status)}`);
  }

  if (params.category) {
    filters.push(`categoria=eq.${encodeURIComponent(params.category)}`);
  }

  if (params.year && /^\d{4}$/.test(params.year)) {
    filters.push(`data_evento=gte.${params.year}-01-01`);
    filters.push(`data_evento=lte.${params.year}-12-31`);
  }

  const search = sanitizeGallerySearchTerm(params.search);
  if (search) {
    filters.push(
      `or=(titulo.ilike.*${encodeURIComponent(search)}*,descricao.ilike.*${encodeURIComponent(search)}*,categoria.ilike.*${encodeURIComponent(search)}*)`,
    );
  }

  return filters.length > 0 ? `&${filters.join("&")}` : "";
}

export function buildGalleryOrder() {
  return "destaque.desc,data_evento.desc.nullslast,ordem.asc,updated_at.desc";
}

export function stripGalleryText(value: string | null, maxLength = 160) {
  return value
    ?.replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function formatGalleryDate(value: string | null | undefined) {
  if (!value) {
    return "Data nao informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function getGalleryYearOptions(galleries: Array<{ data_evento: string | null }>) {
  return Array.from(
    new Set(
      galleries
        .map((gallery) => gallery.data_evento?.slice(0, 4))
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((a, b) => Number(b) - Number(a));
}
