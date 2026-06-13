export const homeSlideStatusOptions = ["rascunho", "publicado", "arquivado"] as const;
export type HomeSlideStatus = (typeof homeSlideStatusOptions)[number];

export type CmsHomeSlide = {
  id: string;
  titulo: string;
  subtitulo: string | null;
  descricao: string | null;
  data_label: string | null;
  imagem_url: string;
  botao_texto: string | null;
  botao_url: string | null;
  ordem: number;
  status: HomeSlideStatus;
  abrir_nova_aba: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

export function normalizeHomeSlideStatus(value: string) {
  const normalized = value.toLowerCase();
  return homeSlideStatusOptions.find((status) => status === normalized) ?? "rascunho";
}
