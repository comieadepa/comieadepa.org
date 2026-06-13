export const documentStatusOptions = ["rascunho", "publicado", "arquivado"] as const;
export type DocumentStatus = (typeof documentStatusOptions)[number];

export type CmsDocument = {
  id: string;
  titulo: string;
  slug: string;
  descricao: string | null;
  categoria: string | null;
  arquivo_url: string;
  thumbnail_url: string | null;
  tipo_arquivo: string | null;
  tamanho: number;
  ordem: number;
  downloads: number;
  destaque: boolean;
  status: DocumentStatus;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

export function normalizeDocumentStatus(value: string) {
  const normalized = value.toLowerCase();
  return documentStatusOptions.find((status) => status === normalized) ?? "rascunho";
}

export function inferDocumentType(fileNameOrMime: string | null | undefined) {
  const value = (fileNameOrMime ?? "").toLowerCase();

  if (value.includes("pdf") || value.endsWith(".pdf")) {
    return "PDF";
  }

  if (value.includes("word") || value.includes("msword") || value.endsWith(".doc") || value.endsWith(".docx")) {
    return "DOC";
  }

  if (value.includes("sheet") || value.includes("excel") || value.endsWith(".xls") || value.endsWith(".xlsx")) {
    return "XLS";
  }

  if (value.includes("presentation") || value.includes("powerpoint") || value.endsWith(".ppt") || value.endsWith(".pptx")) {
    return "PPT";
  }

  if (value.includes("zip") || value.endsWith(".zip") || value.endsWith(".rar")) {
    return "ZIP";
  }

  if (value.includes("image/")) {
    return "IMG";
  }

  const extension = value.split(".").pop()?.trim();
  return extension ? extension.toUpperCase() : "ARQ";
}

export function formatDocumentSize(bytes: number | null | undefined) {
  const value = Number(bytes ?? 0);

  if (!Number.isFinite(value) || value <= 0) {
    return "0 KB";
  }

  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const digits = size >= 10 || unitIndex === 0 ? 0 : 1;
  return `${size.toFixed(digits)} ${units[unitIndex]}`;
}

export function formatDownloads(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR").format(Number(value ?? 0));
}

export function formatDocumentDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function stripDocumentText(value: string | null, maxLength = 160) {
  return value
    ?.replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function buildDocumentDownloadPath(slug: string) {
  return `/api/documentos/${slug}/download`;
}

export function buildDocumentFilters(params: {
  search?: string;
  category?: string;
  status?: DocumentStatus | "";
}) {
  const filters: string[] = [];

  if (params.status) {
    filters.push(`status=eq.${encodeURIComponent(params.status)}`);
  }

  if (params.category) {
    filters.push(`categoria=eq.${encodeURIComponent(params.category)}`);
  }

  const search = sanitizeSearchTerm(params.search);
  if (search) {
    filters.push(
      `or=(titulo.ilike.*${encodeURIComponent(search)}*,descricao.ilike.*${encodeURIComponent(search)}*,categoria.ilike.*${encodeURIComponent(search)}*)`,
    );
  }

  return filters.length > 0 ? `&${filters.join("&")}` : "";
}

export function buildDocumentOrder(sort: string | null | undefined) {
  switch (sort) {
    case "downloads":
      return "destaque.desc,downloads.desc,updated_at.desc";
    case "titulo":
      return "titulo.asc,updated_at.desc";
    case "ordem":
      return "destaque.desc,ordem.asc,updated_at.desc";
    default:
      return "destaque.desc,updated_at.desc,created_at.desc";
  }
}

export function sanitizeSearchTerm(value: string | null | undefined) {
  return (value ?? "").trim().replace(/[(),]/g, " ");
}
