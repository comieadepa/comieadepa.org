"use client";

import {
  CheckCircle2,
  Eye,
  Link2,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  X,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { MediaPickerAsset, MediaUrlField } from "../media-url-field";
import { AdminEmptyState, AdminFilterPills, AdminStatusBadge } from "../admin-ui";

export type CmsVideo = {
  id: string;
  titulo: string;
  tipo: string;
  youtube_url: string;
  youtube_id: string | null;
  thumbnail_url: string | null;
  departamento_id: string | null;
  destaque_home: boolean;
  ativo: boolean;
  ordem: number;
  created_at: string;
};

export type CmsDepartmentOption = {
  id: string;
  nome: string;
};

type VideosManagerProps = {
  videos: CmsVideo[];
  mediaAssets: MediaPickerAsset[];
  departments: CmsDepartmentOption[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  return match ? match[1] : null;
}

export function VideosManager({
  videos: initialVideos,
  mediaAssets,
  departments,
  canCreate,
  canUpdate,
  canDelete,
}: VideosManagerProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [videos, setVideos] = useState<CmsVideo[]>(initialVideos);
  const [editingId, setEditingId] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [deptFilter, setDeptFilter] = useState("todos");
  const [search, setSearch] = useState("");

  // Form states
  const [titulo, setTitulo] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [tipo, setTipo] = useState("video");
  const [departamentoId, setDepartamentoId] = useState("");
  const [ordem, setOrdem] = useState(1);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [destaqueHome, setDestaqueHome] = useState(false);

  // Async states
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const editingVideo = videos.find((v) => v.id === editingId);
  const canWrite = editingVideo ? canUpdate : canCreate;

  const currentYoutubeId = useMemo(() => {
    return extractYoutubeId(youtubeUrl);
  }, [youtubeUrl]);

  const previewThumbnail = useMemo(() => {
    if (thumbnailUrl) return thumbnailUrl;
    if (currentYoutubeId) return `https://i.ytimg.com/vi/${currentYoutubeId}/hqdefault.jpg`;
    return null;
  }, [thumbnailUrl, currentYoutubeId]);

  const departmentsMap = useMemo(() => {
    return new Map(departments.map((d) => [d.id, d.nome]));
  }, [departments]);

  const filteredVideos = useMemo(() => {
    const term = search.trim().toLowerCase();
    return videos.filter((video) => {
      if (statusFilter === "ativos" && !video.ativo) return false;
      if (statusFilter === "inativos" && video.ativo) return false;
      if (deptFilter !== "todos" && (video.departamento_id || "") !== deptFilter) return false;

      if (!term) return true;
      const deptName = video.departamento_id ? departmentsMap.get(video.departamento_id) || "" : "COMIEADEPA";
      return `${video.titulo} ${video.tipo} ${deptName} ${video.youtube_id || ""}`.toLowerCase().includes(term);
    });
  }, [departmentsMap, deptFilter, search, statusFilter, videos]);

  function handleStartEdit(video: CmsVideo) {
    setEditingId(video.id);
    setTitulo(video.titulo);
    setYoutubeUrl(video.youtube_url);
    setTipo(video.tipo || "video");
    setDepartamentoId(video.departamento_id || "");
    setOrdem(video.ordem ?? 1);
    setThumbnailUrl(video.thumbnail_url || "");
    setDestaqueHome(video.destaque_home ?? false);
    setFeedback(null);
  }

  function handleNewVideo() {
    setEditingId("");
    setTitulo("");
    setYoutubeUrl("");
    setTipo("video");
    setDepartamentoId("");
    setOrdem(1);
    setThumbnailUrl("");
    setDestaqueHome(false);
    setFeedback(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canWrite || isSaving) return;

    if (!titulo.trim() || !youtubeUrl.trim()) {
      setFeedback({ type: "error", message: "Informe o título e a URL do YouTube." });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    const formData = new FormData();
    formData.set("id", editingId);
    formData.set("titulo", titulo);
    formData.set("youtube_url", youtubeUrl);
    formData.set("tipo", tipo);
    formData.set("departamento_id", departamentoId);
    formData.set("ordem", String(ordem));
    formData.set("thumbnail_url", thumbnailUrl);
    if (destaqueHome) {
      formData.set("destaque_home", "on");
    }

    const isEditing = Boolean(editingId);

    try {
      const response = await fetch("/api/admin/videos", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "x-requested-with": "fetch",
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.error) {
        throw new Error(data.error || "Erro ao salvar vídeo.");
      }

      setFeedback({
        type: "success",
        message: isEditing ? "Vídeo atualizado com sucesso!" : "Vídeo adicionado com sucesso!",
      });

      const savedId = editingId || data.id;

      if (!isEditing && savedId) {
        setEditingId(savedId);
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao salvar vídeo.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleActive(video: CmsVideo) {
    if (!canUpdate) return;

    const nextState = !video.ativo;
    const action = nextState ? "activate" : "deactivate";

    const formData = new FormData();
    formData.set("id", video.id);
    formData.set("action", action);

    try {
      const response = await fetch("/api/admin/videos", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "x-requested-with": "fetch",
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.error) {
        throw new Error(data.error || "Erro ao atualizar status do vídeo.");
      }

      setVideos((prev) => prev.map((v) => (v.id === video.id ? { ...v, ativo: nextState } : v)));
      setFeedback({
        type: "success",
        message: nextState ? "Vídeo ativado no portal." : "Vídeo desativado do portal.",
      });
      startTransition(() => router.refresh());
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao alternar status do vídeo.",
      });
    }
  }

  async function handleDelete(id: string) {
    if (!canDelete) return;

    const confirmed = window.confirm("Excluir definitivamente este vídeo do acervo?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/videos?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Erro ao excluir vídeo.");
      }

      setVideos((prev) => prev.filter((v) => v.id !== id));
      if (editingId === id) {
        handleNewVideo();
      }
      setFeedback({ type: "success", message: "Vídeo excluído com sucesso." });
      startTransition(() => router.refresh());
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao excluir vídeo.",
      });
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[460px_1fr]">
      {/* Form Section */}
      <section className="h-fit border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
        <div className="flex flex-col gap-3 border-b border-[#d8c38b]/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">
                {editingVideo ? "Edição de Vídeo" : "Novo Vídeo"}
              </p>
              {editingVideo ? (
                <AdminStatusBadge status={editingVideo.ativo ? "ativo" : "inativo"} />
              ) : null}
            </div>
            <h2 className="mt-1 font-serif text-2xl font-black text-[#171006]">
              {editingVideo ? "Editar Detalhes do Vídeo" : "Adicionar Vídeo do Canal"}
            </h2>
          </div>

          {editingVideo ? (
            <button
              type="button"
              onClick={handleNewVideo}
              className="inline-flex items-center gap-1 bg-[#171006] px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#f4cf6a] transition hover:bg-[#2c2212]"
            >
              <Plus size={13} />
              Novo
            </button>
          ) : null}
        </div>

        {/* Feedback banner */}
        {feedback ? (
          <div
            className={`my-4 flex items-center justify-between gap-3 border p-4 text-xs font-semibold ${
              feedback.type === "success"
                ? "border-[#00b67a]/40 bg-[#e8fff4] text-[#075f3f]"
                : "border-[#8b2f2b]/40 bg-[#fff1ed] text-[#8b2f2b]"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? <CheckCircle2 size={16} /> : <X size={16} />}
              <span>{feedback.message}</span>
            </div>
            <button type="button" onClick={() => setFeedback(null)} className="underline opacity-70 hover:opacity-100">
              Fechar
            </button>
          </div>
        ) : null}

        {/* Video Form */}
        <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
          <input type="hidden" name="id" value={editingId} />

          {/* Title */}
          <label className="grid gap-1.5">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Título do Vídeo</span>
            <input
              name="titulo"
              required
              disabled={!canWrite}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Ex.: Palavra da Presidência - Culto de Abertura"
            />
          </label>

          {/* YouTube URL */}
          <label className="grid gap-1.5">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">URL do YouTube</span>
            <span className="flex items-center gap-2 border border-[#d8c38b] bg-[#fffaf0] px-3 py-2.5">
              <Link2 size={16} className="text-[#8b2f2b]" />
              <input
                name="youtube_url"
                required
                disabled={!canWrite}
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full bg-transparent text-xs font-mono outline-none disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </span>
          </label>

          {/* Live Thumbnail / YouTube Preview */}
          {previewThumbnail ? (
            <div className="relative aspect-video w-full overflow-hidden border border-[#d8c38b] bg-black">
              <Image src={previewThumbnail} alt={titulo || "Thumbnail do vídeo"} fill className="object-cover" unoptimized />
              <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[#ed1d24] text-white shadow-lg">
                  <Youtube size={20} />
                </div>
              </div>
            </div>
          ) : null}

          {/* Type, Department, Order */}
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Tipo</span>
              <select
                name="tipo"
                disabled={!canWrite}
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="border border-[#d8c38b] bg-[#fffaf0] px-3 py-2 text-xs font-semibold outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="video">Vídeo</option>
                <option value="shorts">Shorts</option>
                <option value="live">Live / Ao Vivo</option>
              </select>
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Departamento</span>
              <select
                name="departamento_id"
                disabled={!canWrite}
                value={departamentoId}
                onChange={(e) => setDepartamentoId(e.target.value)}
                className="border border-[#d8c38b] bg-[#fffaf0] px-3 py-2 text-xs font-semibold outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">COMIEADEPA (Geral)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Ordem</span>
              <input
                name="ordem"
                type="number"
                disabled={!canWrite}
                value={ordem}
                onChange={(e) => setOrdem(Number(e.target.value) || 1)}
                className="border border-[#d8c38b] bg-[#fffaf0] px-3 py-2 text-xs outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>
          </div>

          {/* Thumbnail Picker */}
          <MediaUrlField
            name="thumbnail_url"
            label="Thumbnail Personalizada (Opcional)"
            defaultValue={thumbnailUrl}
            assets={mediaAssets}
            helper="Use quando quiser substituir a capa automática do YouTube por uma imagem da biblioteca."
            disabled={!canWrite}
          />

          {/* Destaque Home checkbox */}
          <label className="flex items-center gap-3 border border-[#d8c38b] bg-[#f7efd6] p-3 text-xs font-semibold text-[#342411]">
            <input
              name="destaque_home"
              type="checkbox"
              checked={destaqueHome}
              onChange={(e) => setDestaqueHome(e.target.checked)}
              disabled={!canWrite}
              className="h-4 w-4 accent-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
            />
            Exibir vídeo com destaque na página inicial
          </label>

          {/* Action buttons */}
          <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-[#d8c38b]/30 pt-4">
            <button
              type="submit"
              disabled={!canWrite || isSaving}
              className="inline-flex items-center gap-2 bg-[#171006] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#2c2212] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? <Loader2 size={15} className="animate-spin text-[#f4cf6a]" /> : <Save size={15} />}
              {editingVideo ? "Atualizar Vídeo" : "Adicionar Vídeo"}
            </button>

            {editingVideo ? (
              <button
                type="button"
                onClick={handleNewVideo}
                className="text-xs font-bold text-[#8b2f2b] underline underline-offset-4 hover:opacity-80"
              >
                Cancelar edição
              </button>
            ) : null}
          </div>
        </form>
      </section>

      {/* Videos List Section */}
      <section className="h-fit border border-[#d8c38b] bg-[#171006] p-6 text-white shadow-[0_18px_50px_rgba(23,16,6,.14)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Youtube size={20} className="text-[#ed1d24]" />
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Acervo de Vídeos</p>
            </div>
            <p className="mt-1 text-xs text-white/50">{filteredVideos.length} vídeo(s) listados</p>
          </div>

          {/* Filter Pills */}
          <AdminFilterPills
            current={statusFilter}
            onSelect={(val) => setStatusFilter(val)}
            options={[
              { value: "todos", label: "Todos" },
              { value: "ativos", label: "Ativos" },
              { value: "inativos", label: "Inativos" },
            ]}
          />
        </div>

        {/* Search and Department Filter Bar */}
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_200px]">
          <div className="flex items-center gap-2 border border-white/15 bg-white/10 px-3 py-2 text-xs">
            <Search size={15} className="text-[#f4cf6a]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-white placeholder:text-white/40 outline-none"
              placeholder="Buscar por título, tipo ou código..."
            />
            {search ? (
              <button type="button" onClick={() => setSearch("")} className="text-white/50 hover:text-white">
                <X size={13} />
              </button>
            ) : null}
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="border border-white/15 bg-white/10 px-3 py-2 text-xs text-white outline-none"
          >
            <option value="todos" className="bg-[#171006] text-white">
              Todos os departamentos
            </option>
            {departments.map((d) => (
              <option key={d.id} value={d.id} className="bg-[#171006] text-white">
                {d.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Videos Grid / List */}
        <div className="mt-6 grid gap-4">
          {filteredVideos.map((video) => {
            const isCurrent = editingId === video.id;
            const deptName = video.departamento_id ? departmentsMap.get(video.departamento_id) : "COMIEADEPA";

            return (
              <article
                key={video.id}
                className={`flex flex-col gap-4 border p-4 transition sm:flex-row sm:items-center ${
                  isCurrent
                    ? "border-[#f4cf6a] bg-white/15 shadow-md"
                    : "border-white/10 bg-white/[0.055] hover:border-white/25"
                }`}
              >
                {/* Thumbnail Icon */}
                <div className="relative h-16 w-24 shrink-0 overflow-hidden border border-white/15 bg-black">
                  {video.thumbnail_url || video.youtube_id ? (
                    <Image
                      src={
                        video.thumbnail_url ||
                        `https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`
                      }
                      alt={video.titulo}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : null}
                  <div className="absolute inset-0 grid place-items-center bg-black/30 text-white">
                    <Youtube size={22} className="text-[#ed1d24]" />
                  </div>
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#f4cf6a]">
                      {video.tipo}
                    </span>
                    <AdminStatusBadge status={video.ativo ? "ativo" : "inativo"} />
                    {video.destaque_home ? (
                      <span className="bg-[#f4cf6a] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-[#171006]">
                        Home
                      </span>
                    ) : null}
                    <span className="text-[10px] text-white/40">• {deptName}</span>
                  </div>

                  <h3 className="mt-1.5 font-serif text-base font-bold text-white line-clamp-1">
                    {video.titulo}
                  </h3>

                  <p className="mt-0.5 font-mono text-[11px] text-white/50">
                    ID: {video.youtube_id || "N/A"}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-3 sm:border-0 sm:pt-0">
                  {canUpdate ? (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(video)}
                      className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-[#f4cf6a] hover:underline"
                    >
                      Editar
                    </button>
                  ) : null}

                  <a
                    href={`/admin/preview/videos/${video.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.14em] text-white/70 transition hover:text-white"
                  >
                    <Eye size={12} />
                    Prévia
                  </a>

                  {canUpdate ? (
                    <button
                      type="button"
                      onClick={() => handleToggleActive(video)}
                      className="text-xs font-black uppercase tracking-[0.14em] text-white/50 transition hover:text-white"
                    >
                      {video.ativo ? "Desativar" : "Ativar"}
                    </button>
                  ) : null}

                  {canDelete ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(video.id)}
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

          {filteredVideos.length === 0 ? (
            <AdminEmptyState
              title="Nenhum vídeo encontrado"
              description="Ajuste os filtros de status ou o termo de busca para visualizar outros conteúdos."
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
