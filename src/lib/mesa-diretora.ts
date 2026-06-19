import { selectPublicRows } from "@/lib/supabase-public";
import {
  selectSupabaseRows,
  insertSupabaseRow,
  updateSupabaseRows,
  deleteSupabaseRows,
} from "@/lib/supabase-admin";

export type MesaDiretoraLayout = "hero" | "center" | "grid2" | "grid3" | "grid4";

export type CmsMesaGrupo = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  subtitulo: string | null;
  bg_image_url: string | null;
  title_color: string | null;
  ordem: number;
  ativo: boolean;
  layout: MesaDiretoraLayout;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

export type CmsMesaDiretora = {
  id: string;
  nome: string;
  cargo: string;
  grupo_id: string | null;
  grupo: string | null; // Legado para compatibilidade de dados
  campo: string | null;
  foto_url: string | null;
  bio: string | null;
  ordem: number;
  status: "rascunho" | "publicado";
  destaque: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

export function normalizeStatus(value: string): "rascunho" | "publicado" {
  const status = value.toLowerCase();
  return status === "publicado" ? "publicado" : "rascunho";
}

// ==========================================
// FUNÇÕES DE GRUPOS
// ==========================================

export async function listarGruposAtivos(): Promise<CmsMesaGrupo[]> {
  return selectPublicRows<CmsMesaGrupo>(
    "cms_mesa_grupos",
    "ativo=eq.true&order=ordem.asc,updated_at.desc&limit=100"
  );
}

export async function listarGruposAdmin(): Promise<CmsMesaGrupo[]> {
  const baseQuery = "select=id,nome,slug,descricao,subtitulo,bg_image_url,title_color,ordem,ativo,layout,created_at,updated_at,created_by";
  return selectSupabaseRows<CmsMesaGrupo>(
    "cms_mesa_grupos",
    `${baseQuery}&order=ordem.asc,updated_at.desc&limit=100`
  );
}

export async function criarGrupo(payload: Partial<CmsMesaGrupo>) {
  return insertSupabaseRow("cms_mesa_grupos", payload);
}

export async function editarGrupo(id: string, payload: Partial<CmsMesaGrupo>) {
  return updateSupabaseRows("cms_mesa_grupos", `id=eq.${encodeURIComponent(id)}`, payload);
}

export async function excluirGrupo(id: string) {
  // Verificar se há membros associados ao grupo antes de excluir
  const members = await selectSupabaseRows<{ id: string }>(
    "cms_mesa_diretora",
    `select=id&grupo_id=eq.${encodeURIComponent(id)}&limit=1`
  );
  if (members.length > 0) {
    throw new Error("Não é possível excluir o grupo porque ele possui membros associados.");
  }
  return deleteSupabaseRows("cms_mesa_grupos", `id=eq.${encodeURIComponent(id)}`);
}

// ==========================================
// FUNÇÕES DE MEMBROS
// ==========================================

export async function listarMembrosPublicados(): Promise<CmsMesaDiretora[]> {
  return selectPublicRows<CmsMesaDiretora>(
    "cms_mesa_diretora",
    "status=eq.publicado&order=ordem.asc,updated_at.desc&limit=200"
  );
}

export async function listarTodosNoAdmin(query = ""): Promise<CmsMesaDiretora[]> {
  const baseQuery = "select=id,nome,cargo,grupo_id,grupo,campo,foto_url,bio,ordem,status,destaque,created_at,updated_at,created_by";
  const filterQuery = query ? `&${query}` : "";
  return selectSupabaseRows<CmsMesaDiretora>(
    "cms_mesa_diretora",
    `${baseQuery}${filterQuery}&order=ordem.asc,updated_at.desc&limit=200`
  );
}

export async function criarMembro(payload: Partial<CmsMesaDiretora>) {
  return insertSupabaseRow("cms_mesa_diretora", payload);
}

export async function editarMembro(id: string, payload: Partial<CmsMesaDiretora>) {
  return updateSupabaseRows("cms_mesa_diretora", `id=eq.${encodeURIComponent(id)}`, payload);
}

export async function excluirMembro(id: string) {
  return deleteSupabaseRows("cms_mesa_diretora", `id=eq.${encodeURIComponent(id)}`);
}
