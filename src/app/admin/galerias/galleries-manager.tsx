"use client";

import { CalendarDays, Eye, ImagePlus, Save, Search, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { CmsGallery, CmsGalleryPhoto, GalleryStatus, galleryStatusOptions, formatGalleryDate } from "@/lib/galerias";

type GalleriesManagerProps = {
  galleries: CmsGallery[];
  photos: CmsGalleryPhoto[];
  categories: string[];
  canCreate: boolean;
  canUpdate: boolean;
  canPublish: boolean;
  canArchive: boolean;
  canDelete: boolean;
};

const statusLabels: Record<GalleryStatus, string> = {
  rascunho: "Rascunho",
  publicado: "Publicado",
  arquivado: "Arquivado",
};

export function GalleriesManager({
  galleries,
  photos,
  categories,
  canCreate,
  canUpdate,
  canPublish,
  canArchive,
  canDelete,
}: GalleriesManagerProps) {
  const [editingId, setEditingId] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | GalleryStatus>("todos");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [search, setSearch] = useState("");

  const photosByGallery = useMemo(() => {
    const map = new Map<string, CmsGalleryPhoto[]>();
    for (const photo of photos) {
      const current = map.get(photo.galeria_id) ?? [];
      current.push(photo);
      map.set(photo.galeria_id, current);
    }
    return map;
  }, [photos]);

  const filteredGalleries = useMemo(() => {
    const term = search.trim().toLowerCase();
    return galleries.filter((gallery) => {
      if (statusFilter !== "todos" && gallery.status !== statusFilter) {
        return false;
      }
      if (categoryFilter !== "todas" && (gallery.categoria ?? "") !== categoryFilter) {
        return false;
      }
      if (!term) {
        return true;
      }
      return `${gallery.titulo} ${gallery.descricao ?? ""} ${gallery.categoria ?? ""} ${gallery.slug}`.toLowerCase().includes(term);
    });
  }, [categoryFilter, galleries, search, statusFilter]);

  const editingGallery = galleries.find((gallery) => gallery.id === editingId);
  const editingPhotos = editingGallery ? photosByGallery.get(editingGallery.id) ?? [] : [];
  const canWrite = editingGallery ? canUpdate : canCreate;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canWrite) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const isEditing = Boolean(formData.get("id"));

    try {
      const response = await fetch("/api/admin/galerias", {
        method: isEditing ? "PUT" : "POST",
        body: formData,
      });

      if (response.redirected) {
        window.location.href = response.url;
        return;
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = typeof payload?.error === "string" ? payload.error : "Erro ao salvar galeria.";
        window.location.href = `/admin/galerias?error=1&message=${encodeURIComponent(message)}`;
        return;
      }

      window.location.href = "/admin/galerias?success=1";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar galeria.";
      window.location.href = `/admin/galerias?error=1&message=${encodeURIComponent(message)}`;
    }
  }

  async function handleArchive(id: string) {
    await handleDeleteRequest(`/api/admin/galerias?id=${encodeURIComponent(id)}`, "Erro ao arquivar galeria.");
  }

  async function handleDelete(id: string) {
    if (!canDelete) {
      return;
    }

    const confirmed = window.confirm("Excluir definitivamente esta galeria?");
    if (!confirmed) {
      return;
    }

    await handleDeleteRequest(`/api/admin/galerias?id=${encodeURIComponent(id)}&hard=1`, "Erro ao excluir galeria.");
  }

  async function handleQuickStatus(gallery: CmsGallery, status: GalleryStatus) {
    if (!canUpdate) {
      return;
    }

    try {
      const formData = new FormData();
      formData.set("id", gallery.id);
      formData.set("titulo", gallery.titulo);
      formData.set("slug", gallery.slug);
      formData.set("descricao", gallery.descricao ?? "");
      formData.set("categoria", gallery.categoria ?? "");
      formData.set("status", status);
      formData.set("ordem", String(gallery.ordem));
      formData.set("data_evento", gallery.data_evento ?? "");
      if (gallery.destaque) {
        formData.set("destaque", "on");
      }

      const response = await fetch("/api/admin/galerias", { method: "PUT", body: formData });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = typeof payload?.error === "string" ? payload.error : "Erro ao atualizar status.";
        window.location.href = `/admin/galerias?error=1&message=${encodeURIComponent(message)}`;
        return;
      }
      window.location.href = "/admin/galerias?success=1";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar status.";
      window.location.href = `/admin/galerias?error=1&message=${encodeURIComponent(message)}`;
    }
  }

  async function handlePhotoSave(photo: CmsGalleryPhoto, values: { legenda: string; credito: string; ordem: number }) {
    const formData = new FormData();
    formData.set("id", photo.id);
    formData.set("legenda", values.legenda);
    formData.set("credito", values.credito);
    formData.set("ordem", String(values.ordem));

    try {
      const response = await fetch("/api/admin/galerias/fotos", { method: "PUT", body: formData });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = typeof payload?.error === "string" ? payload.error : "Erro ao atualizar foto.";
        window.location.href = `/admin/galerias?error=1&message=${encodeURIComponent(message)}`;
        return;
      }
      window.location.href = "/admin/galerias?success=1";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar foto.";
      window.location.href = `/admin/galerias?error=1&message=${encodeURIComponent(message)}`;
    }
  }

  async function handlePhotoDelete(id: string) {
    const confirmed = window.confirm("Excluir esta foto da galeria?");
    if (!confirmed) {
      return;
    }

    await handleDeleteRequest(`/api/admin/galerias/fotos?id=${encodeURIComponent(id)}`, "Erro ao excluir foto.", "DELETE");
  }

  async function handleDeleteRequest(url: string, fallbackMessage: string, method = "DELETE") {
    try {
      const response = await fetch(url, { method });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = typeof payload?.error === "string" ? payload.error : fallbackMessage;
        window.location.href = `/admin/galerias?error=1&message=${encodeURIComponent(message)}`;
        return;
      }
      window.location.href = "/admin/galerias?success=1";
    } catch (error) {
      const message = error instanceof Error ? error.message : fallbackMessage;
      window.location.href = `/admin/galerias?error=1&message=${encodeURIComponent(message)}`;
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_430px]">
      <section className="border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
        <form onSubmit={handleSubmit} className="grid gap-5">
          <input type="hidden" name="id" value={editingGallery?.id ?? ""} />

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Titulo</span>
            <input
              name="titulo"
              required
              disabled={!canWrite}
              defaultValue={editingGallery?.titulo}
              className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Ex.: Congresso estadual"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Slug</span>
            <input
              name="slug"
              pattern="^[a-z0-9-]+$"
              title="Use apenas letras minusculas, numeros e hifen."
              disabled={!canWrite}
              defaultValue={editingGallery?.slug}
              className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="congresso-estadual"
            />
          </label>

          <div className="grid gap-5 md:grid-cols-4">
            <label className="grid gap-2 md:col-span-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Categoria</span>
              <input
                name="categoria"
                disabled={!canWrite}
                defaultValue={editingGallery?.categoria ?? ""}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Congressos, Reuniões, Eventos..."
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Status</span>
              <select
                name="status"
                disabled={!canWrite}
                defaultValue={editingGallery?.status ?? "rascunho"}
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
                defaultValue={editingGallery?.ordem ?? 0}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Data do evento</span>
              <span className="flex items-center gap-2 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3">
                <CalendarDays size={18} className="text-[#8b2f2b]" />
                <input
                  name="data_evento"
                  type="date"
                  disabled={!canWrite}
                  defaultValue={editingGallery?.data_evento?.slice(0, 10) ?? ""}
                  className="w-full bg-transparent outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
              </span>
            </label>

            <label className="inline-flex items-center gap-3 border border-dashed border-[#d8c38b] bg-[#fffaf0] px-4 py-3 text-sm font-semibold text-[#5a472c] md:self-end">
              <input
                name="destaque"
                type="checkbox"
                defaultChecked={editingGallery?.destaque ?? false}
                disabled={!canWrite}
                className="h-4 w-4 accent-[#8b2f2b]"
              />
              Destacar galeria no portal
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Descrição</span>
            <textarea
              name="descricao"
              disabled={!canWrite}
              defaultValue={editingGallery?.descricao ?? ""}
              className="min-h-28 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Resumo da galeria para listagem e página interna."
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Capa da galeria</span>
              <input
                name="capa"
                type="file"
                accept="image/*"
                disabled={!canWrite}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 text-sm outline-none file:mr-4 file:border-0 file:bg-[#171006] file:px-4 file:py-2 file:font-black file:uppercase file:tracking-[0.12em] file:text-[#f4cf6a] disabled:cursor-not-allowed disabled:opacity-60"
              />
              {editingGallery?.capa_url ? (
                <div className="relative aspect-[16/10] overflow-hidden border border-[#d8c38b] bg-[#f7efd6]">
                  <Image src={editingGallery.capa_url} alt={editingGallery.titulo} fill className="object-cover" />
                </div>
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Upload múltiplo de fotos</span>
              <input
                name="fotos"
                type="file"
                accept="image/*"
                multiple
                disabled={!canWrite}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 text-sm outline-none file:mr-4 file:border-0 file:bg-[#171006] file:px-4 file:py-2 file:font-black file:uppercase file:tracking-[0.12em] file:text-[#f4cf6a] disabled:cursor-not-allowed disabled:opacity-60"
              />
              <span className="text-xs text-[#5a472c]">
                {editingGallery ? "Selecione novas fotos para acrescentar nesta galeria." : "Ao criar a galeria, você pode enviar várias fotos de uma vez."}
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={!canWrite}
              className="inline-flex w-fit items-center gap-3 bg-[#171006] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {editingGallery ? "Atualizar galeria" : "Salvar galeria"}
            </button>
            {editingGallery ? (
              <button
                type="button"
                onClick={() => setEditingId("")}
                className="text-sm font-semibold text-[#8b2f2b] underline underline-offset-4"
              >
                Cancelar edicao
              </button>
            ) : null}
          </div>
        </form>

        {editingGallery ? (
          <section className="mt-8 border-t border-[#d8c38b] pt-6">
            <div className="flex items-center gap-3">
              <ImagePlus size={18} className="text-[#8b2f2b]" />
              <h2 className="font-serif text-3xl font-black">Fotos da galeria</h2>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {editingPhotos.map((photo) => (
                <PhotoEditorCard key={photo.id} photo={photo} onSave={handlePhotoSave} onDelete={handlePhotoDelete} canUpdate={canUpdate} />
              ))}
            </div>

            {editingPhotos.length === 0 ? (
              <div className="mt-5 border border-[#d8c38b] bg-[#fffaf0] p-6 text-[#5a472c]">
                Nenhuma foto cadastrada nesta galeria ainda.
              </div>
            ) : null}
          </section>
        ) : null}
      </section>

      <aside className="border border-[#d8c38b] bg-[#171006] p-6 text-white shadow-[0_18px_50px_rgba(23,16,6,.14)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Galerias</p>
            <h2 className="mt-2 font-serif text-4xl font-black">Acervo visual</h2>
          </div>
          <label className="flex items-center gap-3 border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white/70">
            <Search size={16} className="text-[#f4cf6a]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent outline-none" placeholder="Pesquisar" />
          </label>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className="border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white outline-none"
          >
            <option value="todos">Todos os status</option>
            {galleryStatusOptions.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="border border-white/10 bg-white/[0.06] px-3 py-3 text-sm text-white outline-none"
          >
            <option value="todas">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 grid gap-4">
          {filteredGalleries.map((gallery) => {
            const galleryPhotos = photosByGallery.get(gallery.id) ?? [];

            return (
              <article key={gallery.id} className="border border-white/10 bg-white/[0.055] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f4cf6a]">{statusLabels[gallery.status]}</p>
                    <h3 className="mt-2 font-serif text-2xl font-black">{gallery.titulo}</h3>
                  </div>
                  {gallery.destaque ? <Star size={16} className="shrink-0 text-[#f4cf6a]" /> : null}
                </div>

                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/60">/{gallery.slug}</p>
                <div className="mt-4 grid gap-2 text-sm text-white/68">
                  <p>{gallery.categoria || "Sem categoria"}</p>
                  <p>{formatGalleryDate(gallery.data_evento)}</p>
                  <p>{galleryPhotos.length} foto(s)</p>
                </div>
                {gallery.descricao ? <p className="mt-4 text-sm leading-6 text-white/58">{gallery.descricao}</p> : null}

                <div className="mt-5 flex flex-wrap gap-3">
                  {canUpdate ? (
                    <button type="button" onClick={() => setEditingId(gallery.id)} className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-[#f4cf6a]">
                      Editar
                    </button>
                  ) : null}

                  <a
                    href={`/galeria/${gallery.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/72 transition hover:text-[#f4cf6a]"
                  >
                    <Eye size={14} />
                    Ver galeria
                  </a>

                  {canPublish && gallery.status !== "publicado" ? (
                    <button type="button" onClick={() => handleQuickStatus(gallery, "publicado")} className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-white/60 transition hover:text-[#f4cf6a]">
                      Publicar
                    </button>
                  ) : null}

                  {canPublish && gallery.status === "publicado" ? (
                    <button type="button" onClick={() => handleQuickStatus(gallery, "rascunho")} className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-white/60 transition hover:text-[#f4cf6a]">
                      Despublicar
                    </button>
                  ) : null}

                  {canArchive && gallery.status !== "arquivado" ? (
                    <button type="button" onClick={() => handleArchive(gallery.id)} className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-white/50 transition hover:text-[#f4cf6a]">
                      Arquivar
                    </button>
                  ) : null}

                  {canDelete ? (
                    <button type="button" onClick={() => handleDelete(gallery.id)} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/50 transition hover:text-[#f4cf6a]">
                      <Trash2 size={14} />
                      Excluir
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}

          {filteredGalleries.length === 0 ? (
            <div className="border border-white/10 bg-white/[0.055] p-6 text-white/62">Nenhuma galeria encontrada com os filtros atuais.</div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function PhotoEditorCard({
  photo,
  onSave,
  onDelete,
  canUpdate,
}: {
  photo: CmsGalleryPhoto;
  onSave: (photo: CmsGalleryPhoto, values: { legenda: string; credito: string; ordem: number }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  canUpdate: boolean;
}) {
  const [legenda, setLegenda] = useState(photo.legenda ?? "");
  const [credito, setCredito] = useState(photo.credito ?? "");
  const [ordem, setOrdem] = useState(photo.ordem);

  return (
    <article className="border border-[#d8c38b] bg-[#fffaf0] p-4">
      <div className="relative aspect-[4/3] overflow-hidden border border-[#d8c38b] bg-white">
        <Image src={photo.imagem_url} alt={photo.legenda || "Foto da galeria"} fill className="object-cover" />
      </div>

      <div className="mt-4 grid gap-3">
        <label className="grid gap-2">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Legenda</span>
          <input value={legenda} onChange={(event) => setLegenda(event.target.value)} disabled={!canUpdate} className="border border-[#d8c38b] bg-white px-3 py-2 outline-none disabled:cursor-not-allowed disabled:opacity-60" />
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Crédito</span>
          <input value={credito} onChange={(event) => setCredito(event.target.value)} disabled={!canUpdate} className="border border-[#d8c38b] bg-white px-3 py-2 outline-none disabled:cursor-not-allowed disabled:opacity-60" />
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Ordem</span>
          <input value={ordem} onChange={(event) => setOrdem(Number(event.target.value) || 0)} type="number" disabled={!canUpdate} className="border border-[#d8c38b] bg-white px-3 py-2 outline-none disabled:cursor-not-allowed disabled:opacity-60" />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onSave(photo, { legenda, credito, ordem })}
          disabled={!canUpdate}
          className="inline-flex items-center gap-2 bg-[#171006] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={14} />
          Salvar
        </button>
        <button
          type="button"
          onClick={() => onDelete(photo.id)}
          disabled={!canUpdate}
          className="inline-flex items-center gap-2 border border-[#8b2f2b]/20 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 size={14} />
          Excluir
        </button>
      </div>
    </article>
  );
}
