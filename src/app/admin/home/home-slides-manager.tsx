"use client";

import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ExternalLink,
  Eye,
  ImageIcon,
  Info,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { CmsHomeSlide, HomeSlideStatus } from "@/lib/home-slides";
import { HeroSlideCanvas } from "@/components/site/HeroSlideCanvas";
import { AdminFilterPills, AdminStatusBadge } from "../admin-ui";
import { MediaPickerAsset, MediaUrlField } from "../media-url-field";

type HomeSlidesManagerProps = {
  slides: CmsHomeSlide[];
  assets: MediaPickerAsset[];
  canCreate: boolean;
  canUpdate: boolean;
  canPublish: boolean;
  canArchive: boolean;
  canDelete: boolean;
};

export function HomeSlidesManager({
  slides: initialSlides,
  assets,
  canCreate,
  canUpdate,
  canPublish,
  canArchive,
  canDelete,
}: HomeSlidesManagerProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [slides, setSlides] = useState<CmsHomeSlide[]>(initialSlides);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"todos" | HomeSlideStatus>("todos");

  // Form states for Live Preview
  const [formImage, setFormImage] = useState("");
  const [formDataLabel, setFormDataLabel] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formButtonText, setFormButtonText] = useState("");
  const [formButtonUrl, setFormButtonUrl] = useState("");
  const [formOpenNewTab, setFormOpenNewTab] = useState(false);
  const [formStatus, setFormStatus] = useState<HomeSlideStatus>("publicado");

  // Async loading states
  const [isSaving, setIsSaving] = useState(false);
  const [processingSlideId, setProcessingSlideId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const filteredSlides = useMemo(() => {
    const sorted = [...slides].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
    if (statusFilter === "todos") return sorted;
    return sorted.filter((slide) => slide.status === statusFilter);
  }, [slides, statusFilter]);

  const counts = useMemo(
    () => ({
      todos: slides.length,
      publicado: slides.filter((s) => s.status === "publicado").length,
      rascunho: slides.filter((s) => s.status === "rascunho").length,
      arquivado: slides.filter((s) => s.status === "arquivado").length,
    }),
    [slides],
  );

  const editingSlide = useMemo(() => slides.find((s) => s.id === editingId), [slides, editingId]);
  const canWrite = editingSlide ? canUpdate : canCreate;

  function openCreateForm() {
    setEditingId(null);
    setFormImage("");
    setFormDataLabel("");
    setFormTitle("");
    setFormSubtitle("");
    setFormDescription("");
    setFormButtonText("Saiba Mais");
    setFormButtonUrl("");
    setFormOpenNewTab(false);
    setFormStatus("publicado");
    setFeedback(null);
    setIsFormOpen(true);
  }

  function openEditForm(slide: CmsHomeSlide) {
    setEditingId(slide.id);
    setFormImage(slide.imagem_url || "");
    setFormDataLabel(slide.data_label || "");
    setFormTitle(slide.titulo || "");
    setFormSubtitle(slide.subtitulo || "");
    setFormDescription(slide.descricao || "");
    setFormButtonText(slide.botao_texto || "");
    setFormButtonUrl(slide.botao_url || "");
    setFormOpenNewTab(Boolean(slide.abrir_nova_aba));
    setFormStatus(slide.status || "publicado");
    setFeedback(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingId(null);
    setFeedback(null);
  }

  async function handleSaveSlide(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canWrite || isSaving) return;

    setIsSaving(true);
    setFeedback(null);

    const formData = new FormData(event.currentTarget);
    const isEditing = Boolean(editingId);

    // Auto-calculate order if new
    if (!isEditing) {
      const maxOrder = slides.reduce((max, s) => Math.max(max, s.ordem ?? 0), 0);
      formData.set("ordem", String(maxOrder + 1));
    } else if (editingSlide) {
      formData.set("ordem", String(editingSlide.ordem ?? 0));
    }

    try {
      const response = await fetch("/api/admin/home/slides", {
        method: isEditing ? "PUT" : "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Erro ao salvar slide.");
      }

      setFeedback({
        type: "success",
        message: isEditing ? "Slide atualizado com sucesso!" : "Novo slide cadastrado com sucesso!",
      });

      // Update local state and refresh
      startTransition(() => {
        router.refresh();
      });

      // Reload updated slides list
      const fetchList = await fetch("/api/admin/home/slides", { headers: { Accept: "application/json" } });
      if (fetchList.ok) {
        const updatedList = await fetchList.json();
        if (Array.isArray(updatedList)) setSlides(updatedList);
      }

      setTimeout(() => {
        closeForm();
      }, 900);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao salvar slide.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleStatus(slide: CmsHomeSlide) {
    if (processingSlideId) return;

    const nextStatus: HomeSlideStatus = slide.status === "publicado" ? "rascunho" : "publicado";

    if (nextStatus === "publicado" && !canPublish) {
      setFeedback({ type: "error", message: "Sem permissão para publicar slides." });
      return;
    }

    setProcessingSlideId(slide.id);
    try {
      const response = await fetch("/api/admin/home/slides", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          id: slide.id,
          status: nextStatus,
        }),
      });

      if (!response.ok) {
        const resData = await response.json().catch(() => ({}));
        throw new Error(resData.error || "Erro ao alterar status.");
      }

      setSlides((prev) =>
        prev.map((s) => (s.id === slide.id ? { ...s, status: nextStatus, updated_at: new Date().toISOString() } : s)),
      );

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao alterar status do slide.",
      });
    } finally {
      setProcessingSlideId(null);
    }
  }

  async function handleMove(slideId: string, direction: "up" | "down") {
    if (processingSlideId) return;

    const sorted = [...slides].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
    const currentIndex = sorted.findIndex((s) => s.id === slideId);
    if (currentIndex < 0) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const currentSlide = sorted[currentIndex];
    const targetSlide = sorted[targetIndex];

    const updatedSlides = [...sorted];
    // Swap order values
    const tempOrder = currentSlide.ordem ?? currentIndex;
    currentSlide.ordem = targetSlide.ordem ?? targetIndex;
    targetSlide.ordem = tempOrder;

    // Ensure strictly unique sequential ordering
    updatedSlides.forEach((s, idx) => {
      s.ordem = idx + 1;
    });

    setSlides([...updatedSlides]);
    setProcessingSlideId(slideId);

    try {
      const response = await fetch("/api/admin/home/slides", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          action: "reorder",
          reorder: updatedSlides.map((s) => ({ id: s.id, ordem: s.ordem })),
        }),
      });

      if (!response.ok) {
        const resData = await response.json().catch(() => ({}));
        throw new Error(resData.error || "Erro ao reordenar slides.");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao salvar nova ordem.",
      });
    } finally {
      setProcessingSlideId(null);
    }
  }

  async function handleDeleteSlide(slideId: string) {
    if (!canDelete && !canArchive) return;

    const confirmed = window.confirm("Tem certeza que deseja excluir este slide do destaque principal?");
    if (!confirmed) return;

    setProcessingSlideId(slideId);
    try {
      const response = await fetch(`/api/admin/home/slides?id=${encodeURIComponent(slideId)}&hard=1`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        const resData = await response.json().catch(() => ({}));
        throw new Error(resData.error || "Erro ao excluir slide.");
      }

      setSlides((prev) => prev.filter((s) => s.id !== slideId));
      if (editingId === slideId) closeForm();

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao excluir slide.",
      });
    } finally {
      setProcessingSlideId(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`flex items-center justify-between gap-3 border p-4 shadow-sm transition ${
            feedback.type === "success"
              ? "border-[#171006]/20 bg-[#f4cf6a]/20 text-[#171006]"
              : "border-[#8b2f2b]/30 bg-[#8b2f2b]/10 text-[#8b2f2b]"
          }`}
        >
          <div className="flex items-center gap-2.5 text-sm font-bold">
            {feedback.type === "success" ? <CheckCircle2 size={18} className="text-[#8b2f2b]" /> : <X size={18} />}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-bold uppercase tracking-wider text-[#5a472c] hover:opacity-70"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Top Bar: Action + Filters */}
      <div className="flex flex-col gap-4 border border-[#d8c38b] bg-white/80 p-6 shadow-[0_18px_50px_rgba(23,16,6,.06)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#8b2f2b]">Slider Principal</span>
            <span className="rounded bg-[#f4cf6a] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#171006]">
              {slides.length} {slides.length === 1 ? "Slide" : "Slides"}
            </span>
          </div>
          <h2 className="mt-1 font-serif text-2xl font-black text-[#171006]">Destaques da Home</h2>
          <p className="mt-1 text-xs text-[#5a472c]">
            Gerencie os banners que aparecem no destaque principal da página inicial do portal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {canCreate && !isFormOpen && (
            <button
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 bg-[#8b2f2b] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white shadow-sm transition hover:bg-[#6e2421]"
            >
              <Plus size={16} />
              Novo Slide
            </button>
          )}
        </div>
      </div>

      {/* Formulário de Criação / Edição (Modal ou Painel Aberto) */}
      {isFormOpen && (
        <section className="border-2 border-[#8b2f2b] bg-white p-6 shadow-[0_24px_70px_rgba(23,16,6,.12)] lg:p-8">
          <div className="flex items-center justify-between border-b border-[#d8c38b]/50 pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8b2f2b]">
                {editingId ? "Edição de Slide" : "Novo Cadastro"}
              </p>
              <h3 className="font-serif text-2xl font-black text-[#171006]">
                {editingId ? "Editar Slide do Hero" : "Cadastrar Novo Slide"}
              </h3>
            </div>
            <button
              onClick={closeForm}
              className="inline-flex items-center gap-1 border border-[#d8c38b] px-3 py-1.5 text-xs font-bold text-[#5a472c] hover:bg-[#fffaf0]"
            >
              <X size={14} />
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSaveSlide} className="mt-6 space-y-8">
            {editingId && <input type="hidden" name="id" value={editingId} />}

            {/* ========================================================================= */}
            {/* 1. PRIMEIRA LINHA: LIVE PREVIEW WIDESCREEN 16:9 (LARGURA TOTAL 100%)       */}
            {/* ========================================================================= */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-[#8b2f2b]" />
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-[#8b2f2b]">
                    Prévia do Hero (Widescreen 16:9)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[#0F3B63] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#F8D77B]">
                    Proporção Real 16:9
                  </span>
                  <span className="hidden text-[11px] text-[#5a472c]/70 sm:inline">
                    Simulação fiel do Hero público
                  </span>
                </div>
              </div>

              {/* Canvas Panorâmico 16:9 em Largura Total (Componente Compartilhado com o Site) */}
              <div className="w-full overflow-hidden rounded-xl border border-[#0F3B63]/30 shadow-2xl">
                <HeroSlideCanvas
                  slide={{
                    dataLabel: formDataLabel,
                    title: formTitle,
                    subtitle: formSubtitle,
                    description: formDescription,
                    imageUrl: formImage,
                    buttonText: formButtonText,
                    buttonUrl: formButtonUrl,
                    openInNewTab: formOpenNewTab,
                  }}
                  isPreview={true}
                />
              </div>

              <div className="flex items-center justify-between px-1 text-[11px] text-[#5a472c]/70">
                <span>Enquadramento: <strong>16:9 Widescreen (1920×1080)</strong></span>
                <span>Renderizador: <strong>HeroSlideCanvas (1:1 com o Portal)</strong></span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 2. SEGUNDA LINHA: CAMPOS EM DUAS COLUNAS EQUILIBRADAS NO DESKTOP          */}
            {/* ========================================================================= */}
            <div className="grid w-full min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
              {/* COLUNA ESQUERDA: 1. Imagem de Fundo + 2. Textos e Conteúdo */}
              <div className="w-full min-w-0 max-w-full space-y-6">
                {/* BLOCO 1: IMAGEM */}
                <div className="w-full min-w-0 max-w-full border border-[#d8c38b] bg-[#fffaf0]/60 p-5 shadow-xs">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8b2f2b]">1. Imagem de Fundo</p>
                  <div className="mt-3 w-full min-w-0">
                    <MediaUrlField
                      name="imagem_url"
                      label="Banner do Slide (Alta Resolução)"
                      defaultValue={formImage}
                      onChange={(val) => setFormImage(val)}
                      placeholder="https://... ou escolha da biblioteca"
                      assets={assets}
                      folder="slides"
                      maxSizeInMb={5}
                      allowedMimeTypes={["image/jpeg", "image/png", "image/webp"]}
                      required
                    />
                    
                    {/* Orientação Visual e Técnica para a Equipe de Mídia */}
                    <div className="mt-3 rounded border border-[#d8c38b]/70 bg-[#f7efd6]/60 p-3 text-xs leading-relaxed text-[#5a472c]">
                      <div className="flex items-start gap-2">
                        <Info size={16} className="mt-0.5 shrink-0 text-[#8b2f2b]" />
                        <div className="min-w-0 space-y-0.5">
                          <p className="font-bold text-[#171006]">
                            Formato recomendado: 1920 × 1080 px (16:9) • JPG, PNG ou WebP • tamanho máximo: 5 MB
                          </p>
                          <p className="text-[11px] text-[#5a472c]/80">
                            Imagens menores podem perder qualidade no Hero.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BLOCO 2: CONTEÚDO */}
                <div className="w-full min-w-0 max-w-full border border-[#d8c38b] bg-[#fffaf0]/60 p-5 space-y-4 shadow-xs">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8b2f2b]">2. Textos e Conteúdo</p>

                  <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="grid w-full min-w-0 gap-1">
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">
                        Selo / Etiqueta Superior
                      </span>
                      <input
                        name="data_label"
                        value={formDataLabel}
                        onChange={(e) => setFormDataLabel(e.target.value)}
                        placeholder="Ex.: 125ª AGO, CONVOCAÇÃO"
                        className="w-full min-w-0 max-w-full border border-[#d8c38b] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#8b2f2b]"
                      />
                    </label>

                    <label className="grid w-full min-w-0 gap-1">
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">
                        Subtítulo Dourado
                      </span>
                      <input
                        name="subtitulo"
                        value={formSubtitle}
                        onChange={(e) => setFormSubtitle(e.target.value)}
                        placeholder="Ex.: Palavra, Comunhão e Unidade"
                        className="w-full min-w-0 max-w-full border border-[#d8c38b] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#8b2f2b]"
                      />
                    </label>
                  </div>

                  <label className="grid w-full min-w-0 gap-1">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">
                      Título Principal <span className="text-[#8b2f2b]">*</span>
                    </span>
                    <input
                      name="titulo"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Ex.: Convenção Estadual no Pará"
                      className="w-full min-w-0 max-w-full border border-[#d8c38b] bg-white px-3.5 py-2.5 text-sm font-bold outline-none focus:border-[#8b2f2b]"
                    />
                  </label>

                  <label className="grid w-full min-w-0 gap-1">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">
                      Descrição / Texto de Apoio
                    </span>
                    <textarea
                      name="descricao"
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Breve resumo informativo sobre o tema do banner."
                      className="w-full min-w-0 max-w-full border border-[#d8c38b] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#8b2f2b]"
                    />
                  </label>
                </div>
              </div>

              {/* COLUNA DIREITA: 3. Botão de Ação + 4. Estado de Publicação + Botões de Salvar */}
              <div className="w-full min-w-0 max-w-full space-y-6">
                {/* BLOCO 3: BOTÃO / AÇÃO */}
                <div className="w-full min-w-0 max-w-full border border-[#d8c38b] bg-[#fffaf0]/60 p-5 space-y-4 shadow-xs">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8b2f2b]">3. Botão de Ação (CTA)</p>

                  <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="grid w-full min-w-0 gap-1">
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Texto do Botão</span>
                      <input
                        name="botao_texto"
                        value={formButtonText}
                        onChange={(e) => setFormButtonText(e.target.value)}
                        placeholder="Ex.: Saiba Mais, Inscreva-se"
                        className="w-full min-w-0 max-w-full border border-[#d8c38b] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#8b2f2b]"
                      />
                    </label>

                    <label className="grid w-full min-w-0 gap-1">
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Link de Destino (URL)</span>
                      <input
                        name="botao_url"
                        value={formButtonUrl}
                        onChange={(e) => setFormButtonUrl(e.target.value)}
                        placeholder="Ex.: https://eventos... ou /noticias/..."
                        className="w-full min-w-0 max-w-full border border-[#d8c38b] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#8b2f2b]"
                      />
                    </label>
                  </div>

                  <label className="flex w-full min-w-0 max-w-full items-start gap-2.5 pt-1 text-xs font-bold text-[#5a472c] cursor-pointer">
                    <input
                      type="checkbox"
                      name="abrir_nova_aba"
                      checked={formOpenNewTab}
                      onChange={(e) => setFormOpenNewTab(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#d8c38b] text-[#8b2f2b] focus:ring-[#8b2f2b]"
                    />
                    <span className="min-w-0 flex-1 leading-snug">Abrir link em nova aba do navegador</span>
                  </label>
                </div>

                {/* BLOCO 4: PUBLICAÇÃO */}
                <div className="w-full min-w-0 max-w-full border border-[#d8c38b] bg-[#fffaf0]/60 p-5 shadow-xs">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8b2f2b]">4. Estado de Publicação</p>
                  <div className="mt-3 flex w-full min-w-0 flex-wrap gap-4">
                    {(["publicado", "rascunho", "arquivado"] as const).map((st) => (
                      <label key={st} className="flex min-w-0 max-w-full items-center gap-2 text-xs font-black uppercase tracking-wider text-[#171006] cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value={st}
                          checked={formStatus === st}
                          onChange={() => setFormStatus(st)}
                          className="shrink-0 text-[#8b2f2b] focus:ring-[#8b2f2b]"
                        />
                        <span className="min-w-0 truncate">
                          {st === "publicado" ? "Publicado (Visível na Home)" : st === "rascunho" ? "Rascunho (Oculto)" : "Arquivado"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Botões de Ação do Formulário */}
                <div className="flex w-full min-w-0 flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex min-w-0 items-center gap-2 bg-[#8b2f2b] px-7 py-3.5 text-xs font-black uppercase tracking-[0.14em] text-white shadow-sm transition hover:bg-[#6e2421] disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {editingId ? "Salvar Alterações" : "Cadastrar Slide"}
                  </button>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="min-w-0 border border-[#d8c38b] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#5a472c] hover:bg-[#fffaf0]"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </form>
        </section>
      )}

      {/* Filtros Compactos */}
      <div className="flex items-center justify-between border-b border-[#d8c38b] pb-3">
        <AdminFilterPills
          current={statusFilter}
          onSelect={(val) => setStatusFilter(val as "todos" | HomeSlideStatus)}
          options={[
            { value: "todos", label: "Todos", count: counts.todos },
            { value: "publicado", label: "Publicados", count: counts.publicado },
            { value: "rascunho", label: "Rascunhos", count: counts.rascunho },
            { value: "arquivado", label: "Arquivados", count: counts.arquivado },
          ]}
        />
        <span className="text-xs font-bold text-[#5a472c]">
          Exibindo {filteredSlides.length} de {slides.length}
        </span>
      </div>

      {/* Lista Visual de Cards dos Slides */}
      {filteredSlides.length === 0 ? (
        <div className="mt-8 border border-[#d8c38b] bg-white/70 p-12 text-center shadow-sm">
          <div className="mx-auto grid h-12 w-12 place-items-center bg-[#f4cf6a]/20 text-[#8b2f2b]">
            <ImageIcon size={24} />
          </div>
          <p className="mt-4 font-serif text-xl font-black text-[#171006]">Nenhum slide encontrado</p>
          <p className="mt-1 text-sm text-[#5a472c]">
            {statusFilter === "todos"
              ? "Cadastre o primeiro slide para o destaque principal da página inicial."
              : `Não há slides com status "${statusFilter}".`}
          </p>
          {canCreate && (
            <button
              onClick={openCreateForm}
              className="mt-5 inline-flex items-center gap-2 bg-[#8b2f2b] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white shadow-sm transition hover:bg-[#6e2421]"
            >
              <Plus size={16} />
              Criar Slide
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSlides.map((slide, index) => {
            const isFirst = index === 0;
            const isLast = index === filteredSlides.length - 1;
            const isProcessing = processingSlideId === slide.id;
            const positionNumber = String(index + 1).padStart(2, "0");

            return (
              <div
                key={slide.id}
                className={`group relative grid gap-4 border p-4 transition md:grid-cols-[80px_160px_1fr_auto] md:items-center ${
                  slide.status === "publicado"
                    ? "border-[#d8c38b] bg-white/90 shadow-[0_10px_30px_rgba(23,16,6,.04)] hover:border-[#8b2f2b]"
                    : "border-[#d8c38b]/50 bg-[#fffaf0]/50 opacity-80"
                }`}
              >
                {/* 1. Número da Posição & Reordenação */}
                <div className="flex items-center gap-2 md:flex-col md:justify-center">
                  <span className="font-serif text-xl font-black text-[#8b2f2b]">{positionNumber}</span>
                  <div className="flex gap-1 md:flex-row">
                    <button
                      type="button"
                      disabled={isFirst || isProcessing}
                      onClick={() => handleMove(slide.id, "up")}
                      title="Mover para cima"
                      className="grid h-7 w-7 place-items-center border border-[#d8c38b] bg-white text-[#5a472c] transition hover:border-[#8b2f2b] hover:text-[#8b2f2b] disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={isLast || isProcessing}
                      onClick={() => handleMove(slide.id, "down")}
                      title="Mover para baixo"
                      className="grid h-7 w-7 place-items-center border border-[#d8c38b] bg-white text-[#5a472c] transition hover:border-[#8b2f2b] hover:text-[#8b2f2b] disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                </div>

                {/* 2. Miniatura Real do Banner */}
                <div className="relative h-24 w-full overflow-hidden rounded border border-[#d8c38b] bg-[#171006]">
                  {slide.imagem_url ? (
                    <Image
                      src={slide.imagem_url}
                      alt={slide.titulo}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-white/40">
                      <ImageIcon size={24} />
                    </div>
                  )}
                  {slide.data_label && (
                    <span className="absolute bottom-1 left-1 max-w-[90%] truncate rounded bg-[#0F3B63]/90 px-1.5 py-0.5 text-[9px] font-black uppercase text-[#F8D77B] backdrop-blur-xs">
                      {slide.data_label}
                    </span>
                  )}
                </div>

                {/* 3. Informações Textuais do Slide */}
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-serif text-lg font-black text-[#171006] truncate">{slide.titulo}</h4>
                    <AdminStatusBadge status={slide.status} />
                  </div>

                  {slide.subtitulo && (
                    <p className="text-xs font-bold text-[#8b2f2b] line-clamp-1">{slide.subtitulo}</p>
                  )}

                  {slide.descricao && (
                    <p className="text-xs text-[#5a472c]/80 line-clamp-1">{slide.descricao}</p>
                  )}

                  {/* Detalhe do CTA */}
                  {slide.botao_texto && (
                    <div className="flex items-center gap-2 pt-1 text-[11px] font-semibold text-[#5a472c]">
                      <span className="rounded bg-[#f4cf6a]/30 px-2 py-0.5 font-bold text-[#171006]">
                        CTA: {slide.botao_texto}
                      </span>
                      {slide.botao_url && (
                        <span className="truncate text-[#5a472c]/60 max-w-xs">{slide.botao_url}</span>
                      )}
                      {slide.abrir_nova_aba && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-[#8b2f2b]">
                          <ExternalLink size={10} />
                          (Nova aba)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. Ações Rápidas */}
                <div className="flex flex-wrap items-center gap-2 border-t border-[#d8c38b]/40 pt-3 md:border-t-0 md:pt-0">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => openEditForm(slide)}
                    className="border border-[#d8c38b] bg-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#171006] transition hover:border-[#8b2f2b] hover:text-[#8b2f2b]"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleToggleStatus(slide)}
                    className={`border px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition ${
                      slide.status === "publicado"
                        ? "border-[#5a472c]/30 text-[#5a472c] hover:bg-[#fffaf0]"
                        : "border-[#8b2f2b] bg-[#8b2f2b]/10 text-[#8b2f2b] hover:bg-[#8b2f2b] hover:text-white"
                    }`}
                  >
                    {slide.status === "publicado" ? "Desativar" : "Publicar"}
                  </button>

                  {(canDelete || canArchive) && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleDeleteSlide(slide.id)}
                      title="Excluir slide"
                      className="grid h-8 w-8 place-items-center border border-[#8b2f2b]/30 text-[#8b2f2b] transition hover:bg-[#8b2f2b] hover:text-white disabled:opacity-30"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
