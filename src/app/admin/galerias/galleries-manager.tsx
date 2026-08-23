"use client";

import {
  Archive,
  CalendarDays,
  CheckCircle2,
  Eye,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Search,
  Sparkles,
  Star,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { CmsGallery, CmsGalleryPhoto, GalleryStatus, formatGalleryDate } from "@/lib/galerias";
import { MediaPickerAsset, MediaUrlField } from "../media-url-field";
import { AdminEmptyState, AdminFilterPills, AdminStatusBadge } from "../admin-ui";

type GalleriesManagerProps = {
  galleries: CmsGallery[];
  photos: CmsGalleryPhoto[];
  categories: string[];
  mediaAssets: MediaPickerAsset[];
  canCreate: boolean;
  canUpdate: boolean;
  canPublish: boolean;
  canArchive: boolean;
  canDelete: boolean;
};

export function GalleriesManager({
  galleries: initialGalleries,
  photos: initialPhotos,
  categories,
  mediaAssets,
  canCreate,
  canUpdate,
  canPublish,
  canArchive,
  canDelete,
}: GalleriesManagerProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [galleries, setGalleries] = useState<CmsGallery[]>(initialGalleries);
  const [photos, setPhotos] = useState<CmsGalleryPhoto[]>(initialPhotos);
  const [editingId, setEditingId] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [search, setSearch] = useState("");

  // Form states
  const [titulo, setTitulo] = useState("");
  const [slug, setSlug] = useState("");
  const [categoria, setCategoria] = useState("");
  const [status, setStatus] = useState<GalleryStatus>("rascunho");
  const [ordem, setOrdem] = useState(0);
  const [dataEvento, setDataEvento] = useState("");
  const [destaque, setDestaque] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [capaUrl, setCapaUrl] = useState("");

  // Async states
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const batchPhotosInputRef = useRef<HTMLInputElement>(null);

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

  function handleStartEdit(gallery: CmsGallery) {
    setEditingId(gallery.id);
    setTitulo(gallery.titulo);
    setSlug(gallery.slug);
    setCategoria(gallery.categoria ?? "");
    setStatus(gallery.status);
    setOrdem(gallery.ordem ?? 0);
    setDataEvento(gallery.data_evento?.slice(0, 10) ?? "");
    setDestaque(gallery.destaque ?? false);
    setDescricao(gallery.descricao ?? "");
    setCapaUrl(gallery.capa_url ?? "");
    setFeedback(null);
  }

  function handleNewGallery() {
    setEditingId("");
    setTitulo("");
    setSlug("");
    setCategoria("");
    setStatus("rascunho");
    setOrdem(0);
    setDataEvento("");
    setDestaque(false);
    setDescricao("");
    setCapaUrl("");
    setFeedback(null);
  }

  function generateSlug() {
    if (!titulo.trim()) return;
    const generated = titulo
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generated);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canWrite || isSaving) return;

    if (!titulo.trim()) {
      setFeedback({ type: "error", message: "Informe o título da galeria para continuar." });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("id", editingId);
    formData.set("titulo", titulo);
    formData.set("slug", slug || titulo);
    formData.set("categoria", categoria);
    formData.set("status", status);
    formData.set("ordem", String(ordem));
    formData.set("data_evento", dataEvento);
    formData.set("descricao", descricao);
    formData.set("capa_url", capaUrl);
    if (destaque) {
      formData.set("destaque", "on");
    } else {
      formData.delete("destaque");
    }

    const isEditing = Boolean(editingId);

    try {
      const response = await fetch("/api/admin/galerias", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          Accept: "application/json",
          "x-requested-with": "fetch",
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.error) {
        throw new Error(data.error || "Erro ao salvar galeria.");
      }

      setFeedback({
        type: "success",
        message: isEditing ? "Galeria atualizada com sucesso!" : "Galeria criada com sucesso!",
      });

      const savedId = editingId || data.id;

      if (!isEditing && savedId) {
        setEditingId(savedId);
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Erro ao salvar galeria.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleBatchPhotoUpload(files: FileList | null) {
    if (!files || files.length === 0 || !editingId || isUploadingPhotos) return;

    setIsUploadingPhotos(true);
    setUploadMessage(`Enviando ${files.length} foto(s)...`);
    setFeedback(null);

    const formData = new FormData();
    formData.set("galeria_id", editingId);
    for (let i = 0; i < files.length; i++) {
      formData.append("fotos", files[i]);
    }

    try {
      const response = await fetch("/api/admin/galerias/fotos", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "x-requested-with": "fetch",
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Erro ao enviar fotos adicionais.");
      }

      const newPhotos: CmsGalleryPhoto[] = (data.photos || []).map((p: { id?: string; imagem_url?: string }, index: number) => ({
        id: p.id || crypto.randomUUID(),
        galeria_id: editingId,
        imagem_url: p.imagem_url || "",
        legenda: null,
        credito: null,
        ordem: editingPhotos.length + index,
        created_at: new Date().toISOString(),
      }));

      setPhotos((prev) => [...prev, ...newPhotos]);
      setFeedback({
        type: "success",
        message: `${newPhotos.length} foto(s) adicionada(s) à galeria com sucesso!`,
      });

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Falha no upload das fotos.",
      });
    } finally {
      setIsUploadingPhotos(false);
      setUploadMessage(null);
      if (batchPhotosInputRef.current) {
        batchPhotosInputRef.current.value = "";
      }
    }
  }

  async function handleArchive(id: string) {
    try {
      const response = await fetch(`/api/admin/galerias?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Erro ao arquivar galeria.");
      }

      setGalleries((prev) => prev.map((g) => (g.id === id ? { ...g, status: "arquivado" } : g)));
      setFeedback({ type: "success", message: "Galeria arquivada com sucesso." });
      startTransition(() => router.refresh());
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Erro ao arquivar galeria." });
    }
  }

  async function handleDelete(id: string) {
    if (!canDelete) return;

    const confirmed = window.confirm("Excluir definitivamente esta galeria e todo o seu acervo?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/galerias?id=${encodeURIComponent(id)}&hard=1`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Erro ao excluir galeria.");
      }

      setGalleries((prev) => prev.filter((g) => g.id !== id));
      if (editingId === id) {
        handleNewGallery();
      }
      setFeedback({ type: "success", message: "Galeria excluída com sucesso." });
      startTransition(() => router.refresh());
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Erro ao excluir galeria." });
    }
  }

  async function handleQuickStatus(gallery: CmsGallery, nextStatus: GalleryStatus) {
    if (!canUpdate) return;

    try {
      const formData = new FormData();
      formData.set("id", gallery.id);
      formData.set("titulo", gallery.titulo);
      formData.set("slug", gallery.slug);
      formData.set("descricao", gallery.descricao ?? "");
      formData.set("categoria", gallery.categoria ?? "");
      formData.set("status", nextStatus);
      formData.set("ordem", String(gallery.ordem));
      formData.set("data_evento", gallery.data_evento ?? "");
      if (gallery.destaque) {
        formData.set("destaque", "on");
      }

      const response = await fetch("/api/admin/galerias", {
        method: "PUT",
        headers: { Accept: "application/json", "x-requested-with": "fetch" },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.error) {
        throw new Error(data.error || "Erro ao atualizar status da galeria.");
      }

      setGalleries((prev) => prev.map((g) => (g.id === gallery.id ? { ...g, status: nextStatus } : g)));
      if (editingId === gallery.id) {
        setStatus(nextStatus);
      }
      setFeedback({
        type: "success",
        message: nextStatus === "publicado" ? "Galeria publicada com sucesso!" : "Status atualizado com sucesso.",
      });
      startTransition(() => router.refresh());
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Erro ao atualizar status." });
    }
  }

  async function handlePhotoSave(photo: CmsGalleryPhoto, values: { legenda: string; credito: string; ordem: number }) {
    const formData = new FormData();
    formData.set("id", photo.id);
    formData.set("legenda", values.legenda);
    formData.set("credito", values.credito);
    formData.set("ordem", String(values.ordem));

    try {
      const response = await fetch("/api/admin/galerias/fotos", {
        method: "PUT",
        headers: { Accept: "application/json", "x-requested-with": "fetch" },
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Erro ao atualizar foto.");
      }

      setPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? { ...p, legenda: values.legenda, credito: values.credito, ordem: values.ordem } : p)),
      );
      setFeedback({ type: "success", message: "Foto atualizada com sucesso!" });
      startTransition(() => router.refresh());
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Erro ao salvar foto." });
    }
  }

  async function handlePhotoDelete(id: string) {
    const confirmed = window.confirm("Excluir esta foto da galeria?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/galerias/fotos?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Erro ao excluir foto.");
      }

      setPhotos((prev) => prev.filter((p) => p.id !== id));
      setFeedback({ type: "success", message: "Foto removida com sucesso." });
      startTransition(() => router.refresh());
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Erro ao excluir foto." });
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      {/* Main Form Section */}
      <section className="border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
        {/* Header bar */}
        <div className="flex flex-col gap-4 border-b border-[#d8c38b]/40 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">
                {editingGallery ? "Edição de Galeria" : "Nova Galeria"}
              </p>
              {editingGallery ? <AdminStatusBadge status={status} /> : null}
            </div>
            <h2 className="mt-1 font-serif text-3xl font-black text-[#171006]">
              {editingGallery ? "Editar Galeria e Fotos" : "Cadastrar Nova Galeria"}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {editingGallery ? (
              <>
                <a
                  href={`/galeria/${editingGallery.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border border-[#d8c38b] bg-white px-3.5 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#8b2f2b] transition hover:bg-[#fffaf0]"
                >
                  <Eye size={14} />
                  Ver no Portal
                </a>
                <button
                  type="button"
                  onClick={handleNewGallery}
                  className="inline-flex items-center gap-2 bg-[#171006] px-3.5 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#f4cf6a] transition hover:bg-[#2c2212]"
                >
                  <Plus size={14} />
                  Nova Galeria
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* Feedback Banner */}
        {feedback ? (
          <div
            className={`my-4 flex items-center justify-between gap-3 border p-4 text-sm font-semibold ${
              feedback.type === "success"
                ? "border-[#00b67a]/40 bg-[#e8fff4] text-[#075f3f]"
                : "border-[#8b2f2b]/40 bg-[#fff1ed] text-[#8b2f2b]"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? <CheckCircle2 size={18} /> : <X size={18} />}
              <span>{feedback.message}</span>
            </div>
            <button type="button" onClick={() => setFeedback(null)} className="text-xs underline opacity-70 hover:opacity-100">
              Fechar
            </button>
          </div>
        ) : null}

        {/* Gallery Metadata Form */}
        <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
          <input type="hidden" name="id" value={editingGallery?.id ?? ""} />

          {/* Title */}
          <label className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Título da Galeria</span>
              <span className="text-xs text-[#5a472c]/60">{titulo.length} caracteres</span>
            </div>
            <input
              name="titulo"
              required
              disabled={!canWrite}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 text-base font-semibold outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Ex.: 45º Congresso Geral COMIEADEPA - Belém"
            />
          </label>

          {/* Slug with Auto-generate helper */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Slug (URL amigável)</span>
              <button
                type="button"
                onClick={generateSlug}
                disabled={!canWrite || !titulo.trim()}
                className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.12em] text-[#8b2f2b] underline underline-offset-4 disabled:opacity-40"
              >
                <Sparkles size={13} />
                Gerar do título
              </button>
            </div>
            <input
              name="slug"
              pattern="^[a-z0-9-]+$"
              title="Use apenas letras minúsculas, números e hífen."
              disabled={!canWrite}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 font-mono text-sm outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="congresso-geral-comieadepa-belem"
            />
          </div>

          {/* Category, Status, Order */}
          <div className="grid gap-5 md:grid-cols-4">
            <label className="grid gap-2 md:col-span-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Categoria</span>
              <input
                name="categoria"
                disabled={!canWrite}
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Congressos, Reuniões, Eventos..."
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Status</span>
              <select
                name="status"
                disabled={!canWrite}
                value={status}
                onChange={(e) => setStatus(e.target.value as GalleryStatus)}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 font-bold outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
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
                value={ordem}
                onChange={(e) => setOrdem(Number(e.target.value) || 0)}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>
          </div>

          {/* Event Date and Destaque */}
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Data do evento</span>
              <span className="flex items-center gap-2 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3">
                <CalendarDays size={18} className="text-[#8b2f2b]" />
                <input
                  name="data_evento"
                  type="date"
                  disabled={!canWrite}
                  value={dataEvento}
                  onChange={(e) => setDataEvento(e.target.value)}
                  className="w-full bg-transparent outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
              </span>
            </label>

            <label className="inline-flex items-center gap-3 border border-dashed border-[#d8c38b] bg-[#fffaf0] px-4 py-3 text-sm font-semibold text-[#5a472c] md:self-end">
              <input
                name="destaque"
                type="checkbox"
                checked={destaque}
                onChange={(e) => setDestaque(e.target.checked)}
                disabled={!canWrite}
                className="h-5 w-5 accent-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              />
              Destacar galeria na página inicial
            </label>
          </div>

          {/* Description */}
          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Descrição do evento</span>
            <textarea
              name="descricao"
              disabled={!canWrite}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="min-h-24 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Resumo dos registros fotográficos, local e momentos marcantes..."
            />
          </label>

          {/* Cover using MediaUrlField & Initial Photos upload */}
          <div className="grid gap-5 md:grid-cols-2">
            <MediaUrlField
              name="capa_url"
              label="Capa da Galeria"
              defaultValue={capaUrl}
              assets={mediaAssets}
              helper="Selecione da biblioteca ou envie do computador. Caso não informe, a primeira foto enviada será usada como capa."
              disabled={!canWrite}
            />

            {!editingGallery ? (
              <label className="grid gap-2">
                <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Fotos iniciais (em lote)</span>
                <div className="flex flex-col justify-center border border-dashed border-[#b98e3b] bg-[#f7efd6] p-4 text-sm text-[#8b2f2b]">
                  <input
                    name="fotos"
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={!canWrite}
                    className="w-full text-xs file:mr-3 file:border-0 file:bg-[#171006] file:px-3 file:py-2 file:font-black file:uppercase file:tracking-[0.12em] file:text-[#f4cf6a] disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <span className="mt-2 text-xs text-[#5a472c]">
                    Você pode selecionar várias fotos de uma só vez para criar a galeria.
                  </span>
                </div>
              </label>
            ) : null}
          </div>

          {/* Action Bar */}
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#d8c38b]/40 pt-5">
            <button
              type="submit"
              disabled={!canWrite || isSaving}
              className="inline-flex items-center gap-2.5 bg-[#171006] px-6 py-3.5 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#2c2212] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin text-[#f4cf6a]" /> : <Save size={16} />}
              {editingGallery ? "Salvar Alterações" : "Salvar Galeria"}
            </button>

            {canPublish && status !== "publicado" && editingGallery ? (
              <button
                type="button"
                disabled={!canWrite || isSaving}
                onClick={() => handleQuickStatus(editingGallery, "publicado")}
                className="inline-flex items-center gap-2 bg-[#00a86b] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#00915c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 size={16} />
                Publicar Galeria
              </button>
            ) : null}

            {canArchive && status !== "arquivado" && editingGallery ? (
              <button
                type="button"
                disabled={!canWrite || isSaving}
                onClick={() => handleArchive(editingGallery.id)}
                className="inline-flex items-center gap-2 border border-[#d8c38b]/60 bg-transparent px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#5a472c] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Archive size={14} />
                Arquivar
              </button>
            ) : null}

            {editingGallery ? (
              <button
                type="button"
                onClick={handleNewGallery}
                className="text-xs font-bold text-[#8b2f2b] underline underline-offset-4 hover:opacity-80"
              >
                Cancelar edição
              </button>
            ) : null}
          </div>
        </form>

        {/* Photos Management Section in Edit Mode */}
        {editingGallery ? (
          <section className="mt-10 border-t-2 border-[#d8c38b]/60 pt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ImagePlus size={20} className="text-[#8b2f2b]" />
                  <h3 className="font-serif text-2xl font-black text-[#171006]">Fotos da Galeria</h3>
                </div>
                <p className="mt-1 text-xs text-[#5a472c]">
                  Total de {editingPhotos.length} foto(s) cadastradas nesta galeria.
                </p>
              </div>

              {canWrite ? (
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 bg-[#8b2f2b] px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-[#f4cf6a] transition hover:bg-[#6e221f]">
                  {isUploadingPhotos ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      {uploadMessage || "Enviando..."}
                    </>
                  ) : (
                    <>
                      <UploadCloud size={15} />
                      Adicionar fotos à galeria
                    </>
                  )}
                  <input
                    ref={batchPhotosInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={isUploadingPhotos}
                    onChange={(e) => handleBatchPhotoUpload(e.target.files)}
                  />
                </label>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {editingPhotos.map((photo) => (
                <PhotoEditorCard
                  key={photo.id}
                  photo={photo}
                  onSave={handlePhotoSave}
                  onDelete={handlePhotoDelete}
                  canUpdate={canUpdate}
                />
              ))}
            </div>

            {editingPhotos.length === 0 ? (
              <div className="mt-6">
                <AdminEmptyState
                  title="Nenhuma foto cadastrada nesta galeria"
                  description="Utilize o botão acima para enviar fotos do evento em lote."
                />
              </div>
            ) : null}
          </section>
        ) : null}
      </section>

      {/* Gallery List Sidebar */}
      <aside className="h-fit border border-[#d8c38b] bg-[#171006] p-6 text-white shadow-[0_18px_50px_rgba(23,16,6,.14)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Acervo Visual</p>
            <span className="text-xs text-white/50">{filteredGalleries.length} galeria(s)</span>
          </div>

          <button
            type="button"
            onClick={handleNewGallery}
            className="inline-flex items-center gap-1.5 bg-[#f4cf6a] px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#171006] transition hover:bg-[#ffe599]"
          >
            <Plus size={13} />
            Novo
          </button>
        </div>

        {/* Search bar */}
        <div className="mt-4 flex items-center gap-2 border border-white/15 bg-white/10 px-3 py-2 text-sm">
          <Search size={16} className="text-[#f4cf6a]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder:text-white/40 outline-none"
            placeholder="Buscar galeria por título, categoria ou slug..."
          />
          {search ? (
            <button type="button" onClick={() => setSearch("")} className="text-white/50 hover:text-white">
              <X size={14} />
            </button>
          ) : null}
        </div>

        {/* Status Filter Pills */}
        <div className="mt-4">
          <AdminFilterPills
            current={statusFilter}
            onSelect={(val) => setStatusFilter(val)}
            options={[
              { value: "todos", label: "Todos" },
              { value: "rascunho", label: "Rascunhos" },
              { value: "publicado", label: "Publicados" },
              { value: "arquivado", label: "Arquivados" },
            ]}
          />
        </div>

        {/* Category Filter Select */}
        {categories.length > 0 ? (
          <div className="mt-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-white/15 bg-white/10 px-3 py-2 text-xs text-white outline-none"
            >
              <option value="todas" className="bg-[#171006] text-white">
                Todas as categorias ({categories.length})
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-[#171006] text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {/* Galleries List */}
        <div className="mt-6 grid gap-4">
          {filteredGalleries.map((gallery) => {
            const galleryPhotos = photosByGallery.get(gallery.id) ?? [];
            const isCurrent = editingId === gallery.id;

            return (
              <article
                key={gallery.id}
                className={`border p-4 transition ${
                  isCurrent
                    ? "border-[#f4cf6a] bg-white/15 shadow-md"
                    : "border-white/10 bg-white/[0.055] hover:border-white/25"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AdminStatusBadge status={gallery.status} />
                    {gallery.destaque ? (
                      <span className="inline-flex bg-[#f4cf6a] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-[#171006]">
                        Home
                      </span>
                    ) : null}
                  </div>
                  {gallery.destaque ? <Star size={16} className="shrink-0 text-[#f4cf6a]" /> : null}
                </div>

                <h3 className="mt-3 font-serif text-lg font-black leading-snug text-white">{gallery.titulo}</h3>

                <p className="mt-1 font-mono text-xs text-white/50">/{gallery.slug}</p>

                <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-white/60">
                  <span>{gallery.categoria || "Geral"}</span>
                  <span>{formatGalleryDate(gallery.data_evento)}</span>
                  <span>{galleryPhotos.length} foto(s)</span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-3">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(gallery)}
                    className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-[#f4cf6a] hover:underline"
                  >
                    Editar
                  </button>

                  <a
                    href={`/galeria/${gallery.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.14em] text-white/70 transition hover:text-white"
                  >
                    <Eye size={12} />
                    Prévia
                  </a>

                  {canPublish && gallery.status !== "publicado" ? (
                    <button
                      type="button"
                      onClick={() => handleQuickStatus(gallery, "publicado")}
                      className="text-xs font-black uppercase tracking-[0.14em] text-[#00b67a] hover:underline"
                    >
                      Publicar
                    </button>
                  ) : null}

                  {canPublish && gallery.status === "publicado" ? (
                    <button
                      type="button"
                      onClick={() => handleQuickStatus(gallery, "rascunho")}
                      className="text-xs font-black uppercase tracking-[0.14em] text-white/50 hover:text-white"
                    >
                      Despublicar
                    </button>
                  ) : null}

                  {canArchive && gallery.status !== "arquivado" ? (
                    <button
                      type="button"
                      onClick={() => handleArchive(gallery.id)}
                      className="text-xs font-black uppercase tracking-[0.14em] text-white/40 hover:text-white"
                    >
                      Arquivar
                    </button>
                  ) : null}

                  {canDelete ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(gallery.id)}
                      className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.14em] text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={12} />
                      Excluir
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}

          {filteredGalleries.length === 0 ? (
            <div className="border border-white/10 bg-white/[0.055] p-6 text-center text-xs text-white/50">
              Nenhuma galeria encontrada com os filtros selecionados.
            </div>
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
  const [isSaving, setIsSaving] = useState(false);

  async function handleSavePhoto() {
    if (!canUpdate || isSaving) return;
    setIsSaving(true);
    try {
      await onSave(photo, { legenda, credito, ordem });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <article className="border border-[#d8c38b] bg-[#fffaf0] p-4 shadow-sm">
      <div className="relative aspect-[4/3] overflow-hidden border border-[#d8c38b] bg-white">
        <Image src={photo.imagem_url} alt={photo.legenda || "Foto da galeria"} fill className="object-cover" unoptimized />
      </div>

      <div className="mt-4 grid gap-3">
        <label className="grid gap-1">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Legenda</span>
          <input
            value={legenda}
            onChange={(event) => setLegenda(event.target.value)}
            disabled={!canUpdate}
            className="border border-[#d8c38b] bg-white px-3 py-2 text-xs outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="Descrição ou momento registrado na foto..."
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Crédito Fotográfico</span>
            <input
              value={credito}
              onChange={(event) => setCredito(event.target.value)}
              disabled={!canUpdate}
              className="border border-[#d8c38b] bg-white px-3 py-2 text-xs outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Ex.: Pr. João / COMIEADEPA"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Ordem</span>
            <input
              value={ordem}
              onChange={(event) => setOrdem(Number(event.target.value) || 0)}
              type="number"
              disabled={!canUpdate}
              className="border border-[#d8c38b] bg-white px-3 py-2 text-xs outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 border-t border-[#d8c38b]/30 pt-3">
        <button
          type="button"
          onClick={handleSavePhoto}
          disabled={!canUpdate || isSaving}
          className="inline-flex items-center gap-2 bg-[#171006] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#2c2212] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? <Loader2 size={12} className="animate-spin text-[#f4cf6a]" /> : <Save size={12} />}
          Salvar Dados
        </button>
        <button
          type="button"
          onClick={() => onDelete(photo.id)}
          disabled={!canUpdate}
          className="inline-flex items-center gap-1.5 border border-[#8b2f2b]/30 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#8b2f2b] transition hover:bg-[#8b2f2b]/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 size={12} />
          Excluir
        </button>
      </div>
    </article>
  );
}
