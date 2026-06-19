import { selectPublicRows } from "@/lib/supabase-public";
import {
  selectSupabaseRows,
  insertSupabaseRow,
  updateSupabaseRows,
  deleteSupabaseRows,
} from "@/lib/supabase-admin";

export type CmsInstitucional = {
  id: string;
  titulo: string;
  slug: string;
  status: "rascunho" | "publicado";
  ordem: number;
  subtitulo: string | null;
  descricao: string | null;
  conteudo: string | null;
  hero_image_url: string | null;
  hero_badge: string | null;
  hero_overlay_opacity: number | null;
  hero_alignment: "left" | "center" | "right" | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
};

const baseSelect =
  "select=id,titulo,slug,status,ordem,subtitulo,descricao,conteudo,hero_image_url,hero_badge,hero_overlay_opacity,hero_alignment,seo_title,seo_description,created_at,updated_at";

export async function listarInstitucionalPublico(): Promise<CmsInstitucional[]> {
  return selectPublicRows<CmsInstitucional>(
    "cms_institucional",
    `${baseSelect}&status=eq.publicado&order=ordem.asc,updated_at.desc&limit=100`
  );
}

export async function listarInstitucionalAdmin(query = ""): Promise<CmsInstitucional[]> {
  const filterQuery = query ? `&${query}` : "";
  return selectSupabaseRows<CmsInstitucional>(
    "cms_institucional",
    `${baseSelect}${filterQuery}&order=ordem.asc,updated_at.desc&limit=100`
  );
}

export async function criarInstitucional(payload: Partial<CmsInstitucional>) {
  return insertSupabaseRow("cms_institucional", payload);
}

export async function editarInstitucional(id: string, payload: Partial<CmsInstitucional>) {
  return updateSupabaseRows("cms_institucional", `id=eq.${encodeURIComponent(id)}`, payload);
}

export async function excluirInstitucional(id: string) {
  return deleteSupabaseRows("cms_institucional", `id=eq.${encodeURIComponent(id)}`);
}

export function normalizeInstitucionalStatus(value: string): "rascunho" | "publicado" {
  const status = value.toLowerCase();
  return status === "publicado" ? "publicado" : "rascunho";
}

export function normalizeHeroAlignment(value: string | null | undefined): "left" | "center" | "right" {
  if (value === "center" || value === "right") return value;
  return "left";
}
