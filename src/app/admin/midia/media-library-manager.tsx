"use client";

import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileText,
  FolderOpen,
  Loader2,
  MoreVertical,
  Save,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { AdminEmptyState, AdminFilterPills } from "../admin-ui";

export type MediaAsset = {
  id: string;
  titulo: string | null;
  arquivo_url: string;
  tipo: string | null;
  pasta: string | null;
  created_at: string;
};

type MediaLibraryManagerProps = {
  initialAssets: MediaAsset[];
  canUpload: boolean;
  canDelete: boolean;
};

const FOLDERS = ["todos", "geral", "noticias", "galerias", "departamentos", "banners", "videos", "documentos"];

export function MediaLibraryManager({
  initialAssets,
  canUpload,
  canDelete,
}: MediaLibraryManagerProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [assets, setAssets] = useState<MediaAsset[]>(initialAssets);
  const [selectedFolder, setSelectedFolder] = useState("todos");
  const [typeFilter, setTypeFilter] = useState<"todos" | "imagens" | "documentos">("todos");
  const [search, setSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  // Form states for upload
  const [uploadFolder, setUploadFolder] = useState("geral");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit metadata modal state
  const [editingTitle, setEditingTitle] = useState("");
  const [editingFolder, setEditingFolder] = useState("geral");
  const [isUpdating, setIsUpdating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredAssets = useMemo(() => {
    const term = search.trim().toLowerCase();
    return assets.filter((asset) => {
      if (selectedFolder !== "todos" && (asset.pasta || "geral") !== selectedFolder) {
        return false;
      }
      if (typeFilter === "imagens" && !asset.tipo?.startsWith("image/")) {
        return false;
      }
      if (typeFilter === "documentos" && asset.tipo?.startsWith("image/")) {
        return false;
      }
      if (!term) return true;
      return (
        (asset.titulo || "").toLowerCase().includes(term) ||
        (asset.pasta || "").toLowerCase().includes(term) ||
        (asset.tipo || "").toLowerCase().includes(term) ||
        asset.arquivo_url.toLowerCase().includes(term)
      );
    });
  }, [assets, search, selectedFolder, typeFilter]);

  async function handleCopyUrl(url: string, id: string) {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0 || !canUpload || isUploading) return;

    setIsUploading(true);
    setUploadProgress(`Enviando ${files.length} arquivo(s)...`);
    setFeedback(null);

    const formData = new FormData();
    formData.set("pasta", uploadFolder);
    for (let i = 0; i < files.length; i++) {
      formData.append("arquivos", files[i]);
    }

    try {
      const response = await fetch("/api/admin/media", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "x-requested-with": "fetch",
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Erro ao enviar arquivos para a biblioteca.");
      }

      const newUploaded = (data.assets || []).map((a: { id?: string; titulo?: string; url?: string; tipo?: string; pasta?: string }) => ({
        id: a.id || crypto.randomUUID(),
        titulo: a.titulo || "Arquivo",
        arquivo_url: a.url || "",
        tipo: a.tipo || "image/jpeg",
        pasta: a.pasta || uploadFolder,
        created_at: new Date().toISOString(),
      }));

      setAssets((prev) => [...newUploaded, ...prev]);
      setFeedback({
        type: "success",
        message: `${newUploaded.length} arquivo(s) adicionado(s) à biblioteca!`,
      });

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Falha no envio de arquivos.",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleOpenInspect(asset: MediaAsset) {
    setSelectedAsset(asset);
    setEditingTitle(asset.titulo || "");
    setEditingFolder(asset.pasta || "geral");
  }

  async function handleSaveMetadata(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAsset || !canUpload || isUpdating) return;

    setIsUpdating(true);
    const formData = new FormData();
    formData.set("id", selectedAsset.id);
    formData.set("titulo", editingTitle);
    formData.set("pasta", editingFolder);

    try {
      const response = await fetch("/api/admin/media", {
        method: "PUT",
        headers: { Accept: "application/json" },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Erro ao salvar metadados.");
      }

      setAssets((prev) =>
        prev.map((a) => (a.id === selectedAsset.id ? { ...a, titulo: editingTitle, pasta: editingFolder } : a)),
      );
      setSelectedAsset((prev) => (prev ? { ...prev, titulo: editingTitle, pasta: editingFolder } : null));
      setFeedback({ type: "success", message: "Metadados da mídia atualizados com sucesso." });
      startTransition(() => router.refresh());
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Erro ao atualizar mídia." });
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDeleteAsset(id: string) {
    if (!canDelete) return;

    const confirmed = window.confirm("Excluir definitivamente este arquivo da biblioteca?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/media?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Erro ao excluir mídia.");
      }

      setAssets((prev) => prev.filter((a) => a.id !== id));
      if (selectedAsset?.id === id) {
        setSelectedAsset(null);
      }
      setFeedback({ type: "success", message: "Arquivo removido da biblioteca." });
      startTransition(() => router.refresh());
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Erro ao excluir arquivo." });
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
      {/* Upload Section */}
      <section className="h-fit border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Biblioteca Central de Mídia</p>
        <h2 className="mt-2 font-serif text-3xl font-black leading-tight text-[#171006]">
          Envio Rápido de Arquivos
        </h2>
        <p className="mt-3 text-xs leading-relaxed text-[#5a472c]">
          Imagens e documentos enviados aqui ficam disponíveis automaticamente para uso em Notícias, Galerias, Vídeos e demais módulos do portal.
        </p>

        {/* Feedback Banner */}
        {feedback ? (
          <div
            className={`my-4 flex items-center justify-between gap-3 border p-3.5 text-xs font-semibold ${
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

        {/* Upload Form */}
        <div className="mt-6 grid gap-4">
          <label className="grid gap-1.5">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Destino / Pasta</span>
            <select
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value)}
              disabled={!canUpload || isUploading}
              className="border border-[#d8c38b] bg-[#fffaf0] px-3 py-2.5 text-xs font-semibold outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {FOLDERS.filter((f) => f !== "todos").map((folder) => (
                <option key={folder} value={folder}>
                  {folder.toUpperCase()}
                </option>
              ))}
            </select>
          </label>

          <label className="grid cursor-pointer gap-1.5">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Selecione os Arquivos</span>
            <div className="flex min-h-36 flex-col items-center justify-center gap-2.5 border-2 border-dashed border-[#b98e3b] bg-[#f7efd6] p-6 text-center text-xs font-semibold text-[#8b2f2b] transition hover:bg-[#faebd0]">
              {isUploading ? (
                <>
                  <Loader2 size={28} className="animate-spin text-[#8b2f2b]" />
                  <p className="font-bold">{uploadProgress || "Enviando arquivos..."}</p>
                </>
              ) : (
                <>
                  <UploadCloud size={32} />
                  <p className="text-sm font-bold">Clique ou arraste arquivos aqui</p>
                  <p className="text-[11px] text-[#5a472c]">JPG, PNG, WEBP, GIF, PDF (até 10 MB cada)</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,application/pdf"
                disabled={!canUpload || isUploading}
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
            </div>
          </label>
        </div>
      </section>

      {/* Media Assets Gallery */}
      <section className="h-fit border border-[#d8c38b] bg-[#171006] p-6 text-white shadow-[0_18px_50px_rgba(23,16,6,.14)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FolderOpen size={20} className="text-[#f4cf6a]" />
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Acervo de Mídia</p>
            </div>
            <p className="mt-1 text-xs text-white/50">{filteredAssets.length} arquivo(s) listado(s)</p>
          </div>

          {/* Folder Pills */}
          <AdminFilterPills
            current={selectedFolder}
            onSelect={(val) => setSelectedFolder(val)}
            options={FOLDERS.map((f) => ({
              value: f,
              label: f.charAt(0).toUpperCase() + f.slice(1),
            }))}
          />
        </div>

        {/* Search & Type filter */}
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_160px]">
          <div className="flex items-center gap-2 border border-white/15 bg-white/10 px-3 py-2 text-xs">
            <Search size={15} className="text-[#f4cf6a]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-white placeholder:text-white/40 outline-none"
              placeholder="Buscar por nome do arquivo ou pasta..."
            />
            {search ? (
              <button type="button" onClick={() => setSearch("")} className="text-white/50 hover:text-white">
                <X size={13} />
              </button>
            ) : null}
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            className="border border-white/15 bg-white/10 px-3 py-2 text-xs text-white outline-none"
          >
            <option value="todos" className="bg-[#171006] text-white">
              Todos os tipos
            </option>
            <option value="imagens" className="bg-[#171006] text-white">
              Apenas Imagens
            </option>
            <option value="documentos" className="bg-[#171006] text-white">
              Apenas Documentos
            </option>
          </select>
        </div>

        {/* Asset Cards Grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAssets.map((asset) => {
            const isImage = asset.tipo?.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(asset.arquivo_url);
            const isCopied = copiedId === asset.id;

            return (
              <article
                key={asset.id}
                className="group relative flex flex-col justify-between overflow-hidden border border-white/10 bg-white/[0.055] transition hover:border-[#f4cf6a]/60"
              >
                {/* Media Thumbnail */}
                <div
                  onClick={() => handleOpenInspect(asset)}
                  className="relative aspect-video w-full cursor-pointer overflow-hidden bg-black/40"
                >
                  {isImage ? (
                    <Image
                      src={asset.arquivo_url}
                      alt={asset.titulo || "Mídia"}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-[#f4cf6a]">
                      <FileText size={36} />
                    </div>
                  )}
                  <span className="absolute left-2 top-2 bg-[#171006]/85 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-[#f4cf6a]">
                    {asset.pasta || "geral"}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between p-3.5">
                  <div>
                    <h3 className="font-serif text-sm font-bold text-white line-clamp-1">
                      {asset.titulo || "Arquivo sem título"}
                    </h3>
                    <p className="mt-1 font-mono text-[10px] text-white/50 line-clamp-1">
                      {asset.arquivo_url.split("/").pop()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-2.5">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(asset.arquivo_url, asset.id)}
                      className={`inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.12em] transition ${
                        isCopied ? "text-[#00b67a]" : "text-[#f4cf6a] hover:underline"
                      }`}
                    >
                      {isCopied ? <Check size={13} /> : <Copy size={13} />}
                      {isCopied ? "Copiado!" : "Copiar URL"}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={asset.arquivo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-white/60 transition hover:text-white"
                        title="Abrir arquivo em nova aba"
                      >
                        <ExternalLink size={14} />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleOpenInspect(asset)}
                        className="p-1 text-white/60 transition hover:text-[#f4cf6a]"
                        title="Detalhes e Edição"
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filteredAssets.length === 0 ? (
          <div className="mt-6">
            <AdminEmptyState
              title="Nenhum arquivo encontrado"
              description="Ajuste os filtros de pasta ou realize um novo upload para disponibilizar mídia no portal."
            />
          </div>
        ) : null}
      </section>

      {/* Modal / Drawer for Inspection and Metadata Edit */}
      {selectedAsset ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto border border-[#d8c38b] bg-[#171006] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <h3 className="font-serif text-xl font-bold text-[#f4cf6a]">Detalhes da Mídia</h3>
              <button
                type="button"
                onClick={() => setSelectedAsset(null)}
                className="text-white/60 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Preview container */}
            <div className="relative mt-4 aspect-video w-full overflow-hidden border border-white/15 bg-black">
              {selectedAsset.tipo?.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(selectedAsset.arquivo_url) ? (
                <Image
                  src={selectedAsset.arquivo_url}
                  alt={selectedAsset.titulo || "Preview"}
                  fill
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-[#f4cf6a]">
                  <FileText size={50} />
                </div>
              )}
            </div>

            {/* URL Display */}
            <div className="mt-4">
              <label className="text-[11px] font-black uppercase tracking-[0.14em] text-white/60">URL Pública</label>
              <div className="mt-1 flex items-center gap-2 border border-white/15 bg-white/5 p-2 text-xs font-mono text-[#f4cf6a]">
                <input readOnly value={selectedAsset.arquivo_url} className="w-full bg-transparent outline-none" />
                <button
                  type="button"
                  onClick={() => handleCopyUrl(selectedAsset.arquivo_url, selectedAsset.id)}
                  className="shrink-0 font-bold uppercase underline"
                >
                  {copiedId === selectedAsset.id ? "Copiado!" : "Copiar"}
                </button>
              </div>
            </div>

            {/* Edit metadata form */}
            <form onSubmit={handleSaveMetadata} className="mt-4 grid gap-3">
              <label className="grid gap-1">
                <span className="text-[11px] font-black uppercase tracking-[0.14em] text-white/60">Título da Imagem / Arquivo</span>
                <input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  disabled={!canUpload}
                  className="border border-white/20 bg-white/10 px-3 py-2 text-xs text-white outline-none focus:border-[#f4cf6a]"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-[11px] font-black uppercase tracking-[0.14em] text-white/60">Pasta</span>
                <select
                  value={editingFolder}
                  onChange={(e) => setEditingFolder(e.target.value)}
                  disabled={!canUpload}
                  className="border border-white/20 bg-[#171006] px-3 py-2 text-xs text-white outline-none focus:border-[#f4cf6a]"
                >
                  {FOLDERS.filter((f) => f !== "todos").map((f) => (
                    <option key={f} value={f}>
                      {f.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                <button
                  type="submit"
                  disabled={!canUpload || isUpdating}
                  className="inline-flex items-center gap-2 bg-[#f4cf6a] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#171006] transition hover:bg-[#ffe28a]"
                >
                  {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  Salvar Metadados
                </button>

                {canDelete ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteAsset(selectedAsset.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.12em] text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={13} />
                    Excluir da Biblioteca
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
