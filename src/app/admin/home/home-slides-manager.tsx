"use client";

import { ExternalLink, Save, Sparkles, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { CmsHomeSlide, HomeSlideStatus } from "@/lib/home-slides";
import { MediaPickerAsset, MediaUrlField } from "../media-url-field";

type HomeSlidesManagerProps = {
  slides: CmsHomeSlide[];
  assets: MediaPickerAsset[];
  canCreate: boolean;
  canUpdate: boolean;
  canPublish: boolean;
  canArchive: boolean;
  canDelete: boolean;
  basePath?: string;
  embedded?: boolean;
};

const statusLabels: Record<HomeSlideStatus, string> = {
  rascunho: "Rascunho",
  publicado: "Publicado",
  arquivado: "Arquivado",
};

export function HomeSlidesManager({
  slides,
  assets,
  canCreate,
  canUpdate,
  canPublish,
  canArchive,
  canDelete,
  basePath = "/admin/home/hero",
  embedded = false,
}: HomeSlidesManagerProps) {
  const [editingId, setEditingId] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | HomeSlideStatus>("todos");
  const filteredSlides = useMemo(() => {
    if (statusFilter === "todos") {
      return slides;
    }
    return slides.filter((slide) => slide.status === statusFilter);
  }, [slides, statusFilter]);
  const editingSlide = slides.find((slide) => slide.id === editingId);
  const canWrite = editingSlide ? canUpdate : canCreate;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canWrite) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const isEditing = Boolean(formData.get("id"));

    try {
      const response = await fetch("/api/admin/home/slides", {
        method: isEditing ? "PUT" : "POST",
        body: formData,
      });

      if (response.redirected) {
        window.location.href = response.url;
        return;
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = typeof payload?.error === "string" ? payload.error : "Erro ao salvar slide.";
        window.location.href = `${basePath}?error=1&message=${encodeURIComponent(message)}`;
        return;
      }

      window.location.href = `${basePath}?success=1`;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar slide.";
      window.location.href = `${basePath}?error=1&message=${encodeURIComponent(message)}`;
    }
  }

  async function handleArchive(id: string) {
    if (!canArchive) {
      return;
    }

    await handleDeleteRequest(`/api/admin/home/slides?id=${encodeURIComponent(id)}`, "Erro ao arquivar slide.");
  }

  async function handleDelete(id: string) {
    if (!canDelete) {
      return;
    }

    const confirmed = window.confirm("Excluir definitivamente este slide?");
    if (!confirmed) {
      return;
    }

    await handleDeleteRequest(`/api/admin/home/slides?id=${encodeURIComponent(id)}&hard=1`, "Erro ao excluir slide.");
  }

  async function handleQuickStatus(slide: CmsHomeSlide, status: HomeSlideStatus) {
    if (!canUpdate) {
      return;
    }

    const formData = buildFormData(slide, status);
    try {
      const response = await fetch("/api/admin/home/slides", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = typeof payload?.error === "string" ? payload.error : "Erro ao atualizar slide.";
        window.location.href = `${basePath}?error=1&message=${encodeURIComponent(message)}`;
        return;
      }

      window.location.href = `${basePath}?success=1`;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar slide.";
      window.location.href = `${basePath}?error=1&message=${encodeURIComponent(message)}`;
    }
  }

  async function handleDeleteRequest(url: string, fallbackMessage: string) {
    try {
      const response = await fetch(url, { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = typeof payload?.error === "string" ? payload.error : fallbackMessage;
        window.location.href = `${basePath}?error=1&message=${encodeURIComponent(message)}`;
        return;
      }

      window.location.href = `${basePath}?success=1`;
    } catch (error) {
      const message = error instanceof Error ? error.message : fallbackMessage;
      window.location.href = `${basePath}?error=1&message=${encodeURIComponent(message)}`;
    }
  }

  return (
    <div className={`grid gap-6 ${embedded ? "xl:grid-cols-[1fr_340px]" : "xl:grid-cols-[1fr_380px]"}`}>
      <section className={`border border-[#d8c38b] bg-white/76 p-6 ${embedded ? "" : "shadow-[0_18px_50px_rgba(23,16,6,.08)]"}`}>
        <div className="flex flex-col gap-5 border-b border-[#ead9a6] pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Slider principal</p>
            <h2 className="mt-2 font-serif text-4xl font-black leading-tight">Hero administrável da home.</h2>
            <p className="mt-3 max-w-2xl leading-7 text-[#5a472c]">
              Defina as imagens de fundo, textos e ordem de exibição dos slides principais. Quando houver slides publicados,
              eles assumem a área hero da home com transição fade.
            </p>
          </div>
          <a
            href="/"
            target="_blank"
            className="inline-flex w-fit items-center justify-center gap-3 border border-[#8b2f2b]/30 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#8b2f2b]"
          >
            Ver portal
            <ExternalLink size={17} />
          </a>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
          <input type="hidden" name="id" value={editingSlide?.id ?? ""} />

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Etiqueta / data</span>
            <input
              name="data_label"
              defaultValue={editingSlide?.data_label ?? ""}
              disabled={!canWrite}
              className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Berço do pentecostes no Brasil"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Título</span>
            <input
              name="titulo"
              required
              defaultValue={editingSlide?.titulo ?? ""}
              disabled={!canWrite}
              className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="COMIEADEPA"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Subtítulo</span>
            <textarea
              name="subtitulo"
              defaultValue={editingSlide?.subtitulo ?? ""}
              disabled={!canWrite}
              className="min-h-24 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 leading-7 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="A primeira convenção assembleiana do Brasil..."
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Descrição</span>
            <textarea
              name="descricao"
              defaultValue={editingSlide?.descricao ?? ""}
              disabled={!canWrite}
              className="min-h-24 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 leading-7 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Mais de cem anos proclamando o Evangelho..."
            />
          </label>

          <MediaUrlField
            name="imagem_url"
            label="Imagem de fundo"
            defaultValue={editingSlide?.imagem_url ?? ""}
            assets={assets}
            helper="Use uma imagem horizontal em boa resolução para o hero."
            disabled={!canWrite}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Botão</span>
              <input
                name="botao_texto"
                defaultValue={editingSlide?.botao_texto ?? ""}
                disabled={!canWrite}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Conheça a história"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Link do botão</span>
              <input
                name="botao_url"
                defaultValue={editingSlide?.botao_url ?? ""}
                disabled={!canWrite}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="#a-comieadepa"
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Status</span>
              <select
                name="status"
                defaultValue={editingSlide?.status ?? "rascunho"}
                disabled={!canWrite}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="rascunho">Rascunho</option>
                {canPublish ? <option value="publicado">Publicado</option> : null}
                {canArchive ? <option value="arquivado">Arquivado</option> : null}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Ordem</span>
              <input
                name="ordem"
                type="number"
                defaultValue={editingSlide?.ordem ?? 0}
                disabled={!canWrite}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>
            <label className="inline-flex items-center gap-3 border border-dashed border-[#d8c38b] bg-[#f7efd6] px-4 py-3 text-sm font-semibold text-[#5a472c] md:self-end">
              <input
                name="abrir_nova_aba"
                type="checkbox"
                defaultChecked={editingSlide?.abrir_nova_aba ?? false}
                disabled={!canWrite}
                className="h-4 w-4 accent-[#8b2f2b]"
              />
              Abrir link em nova aba
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={!canWrite}
              className="inline-flex items-center justify-center gap-3 bg-[#171006] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {editingSlide ? "Atualizar slide" : "Salvar slide"}
            </button>
            {editingSlide ? (
              <button
                type="button"
                onClick={() => setEditingId("")}
                className="w-fit text-sm font-semibold text-[#8b2f2b] underline underline-offset-4"
              >
                Cancelar edição
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <aside className="h-fit border border-[#d8c38b] bg-[#171006] p-6 text-white">
        <div className="grid h-12 w-12 place-items-center bg-[#f4cf6a] text-[#171006]">
          <Sparkles size={23} />
        </div>
        <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Slides</p>
        <h3 className="mt-2 font-serif text-3xl font-black leading-tight">Lista do slider principal.</h3>
        <div className="mt-5 flex flex-wrap gap-2">
          {(["todos", "rascunho", "publicado", "arquivado"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value as typeof statusFilter)}
              className={`px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] transition ${
                statusFilter === value ? "bg-[#f4cf6a] text-[#171006]" : "border border-white/10 text-white/54 hover:border-[#f4cf6a] hover:text-[#f4cf6a]"
              }`}
            >
              {value === "todos" ? "Todos" : statusLabels[value]}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4">
          {filteredSlides.map((slide) => (
            <article key={slide.id} className="border border-white/10 bg-white/[0.055] p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f4cf6a]">{statusLabels[slide.status]}</p>
              <h3 className="mt-2 font-serif text-2xl font-black">{slide.titulo}</h3>
              {slide.data_label ? <p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/60">{slide.data_label}</p> : null}
              {slide.subtitulo ? <p className="mt-3 text-sm leading-6 text-white/58">{slide.subtitulo}</p> : null}
              <div className="mt-4 flex flex-wrap gap-3">
                {canUpdate ? (
                  <button
                    type="button"
                    onClick={() => setEditingId(slide.id)}
                    className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-[#f4cf6a]"
                  >
                    Editar
                  </button>
                ) : null}
                {canPublish && slide.status !== "publicado" ? (
                  <button
                    type="button"
                    onClick={() => handleQuickStatus(slide, "publicado")}
                    className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-white/60 transition hover:text-[#f4cf6a]"
                  >
                    Publicar
                  </button>
                ) : null}
                {canPublish && slide.status === "publicado" ? (
                  <button
                    type="button"
                    onClick={() => handleQuickStatus(slide, "rascunho")}
                    className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-white/60 transition hover:text-[#f4cf6a]"
                  >
                    Despublicar
                  </button>
                ) : null}
                {canArchive && slide.status !== "arquivado" ? (
                  <button
                    type="button"
                    onClick={() => handleArchive(slide.id)}
                    className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-white/50 transition hover:text-[#f4cf6a]"
                  >
                    Arquivar
                  </button>
                ) : null}
                {canDelete ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(slide.id)}
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/50 transition hover:text-[#f4cf6a]"
                  >
                    <Trash2 size={14} />
                    Excluir
                  </button>
                ) : null}
              </div>
            </article>
          ))}

          {filteredSlides.length === 0 ? (
            <div className="border border-white/10 bg-white/[0.055] p-6 text-white/62">Nenhum slide encontrado.</div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function buildFormData(slide: CmsHomeSlide, status: HomeSlideStatus) {
  const formData = new FormData();
  formData.set("id", slide.id);
  formData.set("titulo", slide.titulo);
  formData.set("subtitulo", slide.subtitulo ?? "");
  formData.set("descricao", slide.descricao ?? "");
  formData.set("data_label", slide.data_label ?? "");
  formData.set("imagem_url", slide.imagem_url);
  formData.set("botao_texto", slide.botao_texto ?? "");
  formData.set("botao_url", slide.botao_url ?? "");
  formData.set("ordem", String(slide.ordem));
  formData.set("status", status);
  if (slide.abrir_nova_aba) {
    formData.set("abrir_nova_aba", "on");
  }
  return formData;
}
