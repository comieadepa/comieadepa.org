"use client";

import { CalendarDays, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { MediaPickerAsset, MediaUrlField } from "../media-url-field";
import { RichTextField } from "../rich-text-field";

export type CmsPage = {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  conteudo: string | null;
  imagem_url: string | null;
  status: "rascunho" | "publicado" | "arquivado";
  ordem: number;
  seo_title: string | null;
  seo_description: string | null;
  publicado_em: string | null;
  created_at: string;
};

type PagesManagerProps = {
  pages: CmsPage[];
  assets: MediaPickerAsset[];
  canCreate: boolean;
  canUpdate: boolean;
  canPublish: boolean;
  canArchive: boolean;
  canDelete: boolean;
};

const statusLabels: Record<CmsPage["status"], string> = {
  rascunho: "Rascunho",
  publicado: "Publicado",
  arquivado: "Arquivado",
};

export function PagesManager({ pages, assets, canCreate, canUpdate, canPublish, canArchive, canDelete }: PagesManagerProps) {
  const [editingId, setEditingId] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | CmsPage["status"]>("todos");
  const filteredPages = useMemo(() => {
    if (statusFilter === "todos") {
      return pages;
    }
    return pages.filter((page) => page.status === statusFilter);
  }, [pages, statusFilter]);
  const editingPage = pages.find((page) => page.id === editingId);
  const canWrite = editingPage ? canUpdate : canCreate;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canWrite) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const isEditing = Boolean(formData.get("id"));

    try {
      const response = await fetch("/api/admin/paginas", {
        method: isEditing ? "PUT" : "POST",
        body: formData,
      });

      if (response.redirected) {
        window.location.href = response.url;
        return;
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = typeof payload?.error === "string" ? payload.error : "Erro ao salvar página.";
        window.location.href = `/admin/paginas?error=1&message=${encodeURIComponent(message)}`;
        return;
      }

      window.location.href = "/admin/paginas?success=1";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar página.";
      window.location.href = `/admin/paginas?error=1&message=${encodeURIComponent(message)}`;
    }
  }

  async function handleArchive(id: string) {
    if (!canArchive) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/paginas?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = typeof payload?.error === "string" ? payload.error : "Erro ao arquivar página.";
        window.location.href = `/admin/paginas?error=1&message=${encodeURIComponent(message)}`;
        return;
      }
      window.location.href = "/admin/paginas?success=1";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao arquivar página.";
      window.location.href = `/admin/paginas?error=1&message=${encodeURIComponent(message)}`;
    }
  }

  async function handleDelete(id: string) {
    if (!canDelete) {
      return;
    }

    const confirmDelete = window.confirm("Excluir definitivamente esta página?");
    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/paginas?id=${encodeURIComponent(id)}&hard=1`, { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = typeof payload?.error === "string" ? payload.error : "Erro ao excluir página.";
        window.location.href = `/admin/paginas?error=1&message=${encodeURIComponent(message)}`;
        return;
      }
      window.location.href = "/admin/paginas?success=1";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao excluir página.";
      window.location.href = `/admin/paginas?error=1&message=${encodeURIComponent(message)}`;
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <section className="border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
        <form onSubmit={handleSubmit} className="grid gap-5">
          <input type="hidden" name="id" value={editingPage?.id ?? ""} />
          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Título</span>
            <input
              name="titulo"
              required
              disabled={!canWrite}
              defaultValue={editingPage?.titulo}
              className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Ex.: História da Convenção"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Slug</span>
            <input
              name="slug"
              pattern="^[a-z0-9-]+$"
              title="Use apenas letras minúsculas, números e hífen."
              disabled={!canWrite}
              defaultValue={editingPage?.slug}
              className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="historia-da-convencao"
            />
            <span className="text-xs font-semibold text-[#8b2f2b]/80">Use apenas letras minúsculas, números e hífen.</span>
          </label>

          <div className="grid gap-5 md:grid-cols-3">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Status</span>
              <select
                name="status"
                disabled={!canWrite}
                defaultValue={editingPage?.status ?? "rascunho"}
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
                disabled={!canWrite}
                defaultValue={editingPage?.ordem ?? 0}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="0"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Publicar em</span>
              <span className="flex items-center gap-2 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3">
                <CalendarDays size={18} className="text-[#8b2f2b]" />
                <input
                  name="publicado_em"
                  type="datetime-local"
                  disabled={!canWrite}
                  defaultValue={formatDateTimeLocal(editingPage?.publicado_em)}
                  className="w-full bg-transparent outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
              </span>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Resumo</span>
            <textarea
              name="resumo"
              disabled={!canWrite}
              defaultValue={editingPage?.resumo ?? ""}
              className="min-h-24 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Resumo curto para listagens e SEO."
            />
          </label>

          <MediaUrlField
            name="imagem_url"
            label="Imagem de capa"
            defaultValue={editingPage?.imagem_url}
            assets={assets}
            helper="Imagem principal da página institucional."
            disabled={!canWrite}
          />

          <RichTextField
            name="conteudo"
            label="Conteúdo"
            defaultValue={editingPage?.conteudo}
            placeholder="Conteúdo completo da página institucional."
            disabled={!canWrite}
          />

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">SEO Title</span>
            <input
              name="seo_title"
              disabled={!canWrite}
              defaultValue={editingPage?.seo_title ?? ""}
              className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Título para Google e redes sociais"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">SEO Description</span>
            <textarea
              name="seo_description"
              disabled={!canWrite}
              defaultValue={editingPage?.seo_description ?? ""}
              className="min-h-20 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Descrição para metadados."
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={!canWrite}
              className="inline-flex w-fit items-center gap-3 bg-[#171006] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {editingPage ? "Atualizar página" : "Salvar página"}
            </button>
            {editingPage ? (
              <button
                type="button"
                onClick={() => setEditingId("")}
                className="text-sm font-semibold text-[#8b2f2b] underline underline-offset-4"
              >
                Cancelar edição
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <aside className="border border-[#d8c38b] bg-[#171006] p-6 text-white shadow-[0_18px_50px_rgba(23,16,6,.14)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Páginas</p>
            <h2 className="mt-2 font-serif text-4xl font-black">Institucionais</h2>
          </div>
          <div className="flex flex-wrap gap-2">
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
        </div>

        <div className="mt-6 grid gap-4">
          {filteredPages.map((page) => (
            <article key={page.id} className="border border-white/10 bg-white/[0.055] p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f4cf6a]">{statusLabels[page.status]}</p>
              <h3 className="mt-2 font-serif text-2xl font-black">{page.titulo}</h3>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/60">/{page.slug}</p>
              {page.resumo ? <p className="mt-3 text-sm leading-6 text-white/58">{page.resumo}</p> : null}
              <div className="mt-4 flex flex-wrap gap-3">
                {canUpdate ? (
                  <button
                    type="button"
                    onClick={() => setEditingId(page.id)}
                    className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-[#f4cf6a]"
                  >
                    Editar
                  </button>
                ) : null}
                <a
                  href={`/admin/preview/paginas/${page.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-white/72 transition hover:text-[#f4cf6a]"
                >
                  Prévia
                </a>
                {canArchive && page.status !== "arquivado" ? (
                  <button
                    type="button"
                    onClick={() => handleArchive(page.id)}
                    className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-white/50 transition hover:text-[#f4cf6a]"
                  >
                    Arquivar
                  </button>
                ) : null}
                {canDelete ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(page.id)}
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/50 transition hover:text-[#f4cf6a]"
                  >
                    <Trash2 size={14} />
                    Excluir
                  </button>
                ) : null}
              </div>
            </article>
          ))}

          {filteredPages.length === 0 ? (
            <div className="border border-white/10 bg-white/[0.055] p-6 text-white/62">Nenhuma página encontrada.</div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function formatDateTimeLocal(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}
