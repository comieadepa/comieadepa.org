"use client";

import {
  CheckCircle2,
  ExternalLink,
  ImageIcon,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { canEditHomeField, homeSettingSections } from "@/lib/home-settings";
import { CmsHomeSlide, HomeSlideStatus } from "@/lib/home-slides";
import { AdminRole } from "@/lib/admin-permissions";
import { AdminEmptyState, AdminFilterPills, AdminStatusBadge } from "../admin-ui";
import { MediaPickerAsset, MediaUrlField } from "../media-url-field";

type HomeSettingsFormProps = {
  role?: AdminRole;
  values: Record<string, string>;
  assets: MediaPickerAsset[];
  canEdit?: boolean;
  slides: CmsHomeSlide[];
  canCreateSlide: boolean;
  canPublishSlide: boolean;
  canArchiveSlide: boolean;
  canDeleteSlide: boolean;
};

export function HomeSettingsForm({
  role = "admin",
  values: initialValues,
  assets,
  canEdit = true,
  slides: initialSlides,
  canCreateSlide,
  canPublishSlide,
  canArchiveSlide,
  canDeleteSlide,
}: HomeSettingsFormProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [slides, setSlides] = useState<CmsHomeSlide[]>(initialSlides);
  const [activeSectionId, setActiveSectionId] = useState<string>(homeSettingSections[0]?.id ?? "");
  const [editingSlideId, setEditingSlideId] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | HomeSlideStatus>("todos");

  // Async states
  const [isSavingSection, setIsSavingSection] = useState(false);
  const [isSavingSlide, setIsSavingSlide] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const activeSection = useMemo(
    () => homeSettingSections.find((section) => section.id === activeSectionId) ?? homeSettingSections[0],
    [activeSectionId],
  );

  const filteredSlides = useMemo(() => {
    if (statusFilter === "todos") {
      return slides;
    }
    return slides.filter((slide) => slide.status === statusFilter);
  }, [slides, statusFilter]);

  const editingSlide = slides.find((slide) => slide.id === editingSlideId);
  const canWriteSlide = editingSlide ? canEdit : canCreateSlide;
  const isHeroSection = activeSection?.id === "hero";

  if (!activeSection) {
    return null;
  }

  async function handleSaveSection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit || isSavingSection) return;

    setIsSavingSection(true);
    setFeedback(null);

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const payload = new FormData();

    const currentSectionFields = activeSection.fields;
    const newValuesToSet: Record<string, string> = {};

    for (const field of currentSectionFields) {
      if (canEditHomeField(role, field.name)) {
        const val = String(formData.get(field.name) ?? "");
        payload.set(field.name, val);
        newValuesToSet[field.name] = val;
      }
    }

    try {
      const response = await fetch("/api/admin/home", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "x-requested-with": "fetch",
        },
        body: payload,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.error) {
        throw new Error(data.error || "Erro ao salvar seção da home.");
      }

      setValues((prev) => ({ ...prev, ...newValuesToSet }));
      setFeedback({
        type: "success",
        message: `Ajustes da seção "${activeSection.title}" salvos com sucesso!`,
      });

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Falha ao salvar seção da home.",
      });
    } finally {
      setIsSavingSection(false);
    }
  }

  async function handleSaveSlide(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canWriteSlide || isSavingSlide) return;

    setIsSavingSlide(true);
    setFeedback(null);

    const formData = new FormData(event.currentTarget);
    const slidePayload = new FormData();
    const slideFields = [
      "id",
      "data_label",
      "titulo",
      "subtitulo",
      "descricao",
      "imagem_url",
      "botao_texto",
      "botao_url",
      "status",
      "ordem",
    ] as const;

    for (const key of slideFields) {
      slidePayload.set(key, String(formData.get(key) ?? ""));
    }

    if (formData.get("abrir_nova_aba") === "on") {
      slidePayload.set("abrir_nova_aba", "on");
    }

    const isEditing = Boolean(slidePayload.get("id"));

    try {
      const response = await fetch("/api/admin/home/slides", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          Accept: "application/json",
          "x-requested-with": "fetch",
        },
        body: slidePayload,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.error) {
        throw new Error(data.error || "Erro ao salvar slide.");
      }

      const savedId = editingSlideId || data.id || crypto.randomUUID();
      const updatedSlide: CmsHomeSlide = {
        id: savedId,
        titulo: String(slidePayload.get("titulo")),
        subtitulo: String(slidePayload.get("subtitulo")) || null,
        descricao: String(slidePayload.get("descricao")) || null,
        data_label: String(slidePayload.get("data_label")) || null,
        imagem_url: String(slidePayload.get("imagem_url")),
        botao_texto: String(slidePayload.get("botao_texto")) || null,
        botao_url: String(slidePayload.get("botao_url")) || null,
        ordem: Number(slidePayload.get("ordem")) || 0,
        status: (slidePayload.get("status") as HomeSlideStatus) || "rascunho",
        abrir_nova_aba: slidePayload.get("abrir_nova_aba") === "on",
        created_at: editingSlide?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: editingSlide?.created_by || null,
      };

      if (isEditing) {
        setSlides((prev) => prev.map((s) => (s.id === savedId ? updatedSlide : s)));
      } else {
        setSlides((prev) => [updatedSlide, ...prev]);
        setEditingSlideId("");
      }

      setFeedback({
        type: "success",
        message: isEditing ? "Slide atualizado com sucesso!" : "Novo slide adicionado ao slider!",
      });

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao salvar slide.",
      });
    } finally {
      setIsSavingSlide(false);
    }
  }

  async function handleQuickStatus(slide: CmsHomeSlide, nextStatus: HomeSlideStatus) {
    if (!canEdit) return;

    const slidePayload = buildSlideFormData(slide, nextStatus);

    try {
      const response = await fetch("/api/admin/home/slides", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "x-requested-with": "fetch",
        },
        body: slidePayload,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.error) {
        throw new Error(data.error || "Erro ao atualizar status do slide.");
      }

      setSlides((prev) => prev.map((s) => (s.id === slide.id ? { ...s, status: nextStatus } : s)));
      setFeedback({
        type: "success",
        message: nextStatus === "publicado" ? "Slide publicado na home!" : "Slide despublicado para rascunho.",
      });

      startTransition(() => router.refresh());
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao atualizar status do slide.",
      });
    }
  }

  async function handleArchive(id: string) {
    if (!canArchiveSlide) return;

    try {
      const response = await fetch(`/api/admin/home/slides?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.error) {
        throw new Error(data.error || "Erro ao arquivar slide.");
      }

      setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, status: "arquivado" } : s)));
      setFeedback({ type: "success", message: "Slide arquivado com sucesso." });
      startTransition(() => router.refresh());
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao arquivar slide.",
      });
    }
  }

  async function handleDelete(id: string) {
    if (!canDeleteSlide) return;

    if (!window.confirm("Excluir definitivamente este slide do acervo?")) return;

    try {
      const response = await fetch(`/api/admin/home/slides?id=${encodeURIComponent(id)}&hard=1`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.error) {
        throw new Error(data.error || "Erro ao excluir slide.");
      }

      setSlides((prev) => prev.filter((s) => s.id !== id));
      if (editingSlideId === id) {
        setEditingSlideId("");
      }
      setFeedback({ type: "success", message: "Slide excluído definitivamente." });
      startTransition(() => router.refresh());
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao excluir slide.",
      });
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
      {/* Navigation tabs */}
      <nav className="h-fit border border-[#d8c38b] bg-white/76 p-3 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
        <p className="px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Seções da Home</p>
        <div className="mt-2 grid gap-2">
          {homeSettingSections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => {
                setActiveSectionId(section.id);
                setFeedback(null);
              }}
              className={`px-4 py-3 text-left transition ${
                activeSection.id === section.id
                  ? "bg-[#171006] text-white"
                  : "border border-[#ead9a6] bg-[#f7efd6] text-[#5a472c] hover:bg-white"
              }`}
            >
              <span
                className={`block text-[10px] font-black uppercase tracking-[0.16em] ${
                  activeSection.id === section.id ? "text-[#f4cf6a]" : "text-[#8b2f2b]"
                }`}
              >
                {section.eyebrow}
              </span>
              <span className="mt-1 block font-serif text-xl font-black leading-tight">{section.title}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main editor area */}
      <div className="grid min-w-0 gap-6">
        {/* Feedback Banner */}
        {feedback ? (
          <div
            className={`flex items-center justify-between gap-3 border p-4 text-xs font-semibold ${
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

        {isHeroSection ? (
          <div className="min-w-0 border border-[#d8c38b] bg-white/76 p-4 shadow-[0_18px_50px_rgba(23,16,6,.08)] sm:p-6">
            <SectionHeader
              eyebrow="Abertura"
              title="Hero e Slider Principal"
              description="Gerencie os ajustes da primeira dobra e os slides que alternam na página inicial do portal."
            />

            <div className="mt-6 grid gap-8">
              {/* Hero Settings Section */}
              <form onSubmit={handleSaveSection} className="grid gap-5 border-b border-[#ead9a6] pb-8">
                <div className="flex items-center gap-3">
                  <Sparkles size={18} className="text-[#8b2f2b]" />
                  <h3 className="font-serif text-2xl font-black text-[#171006]">Ajustes da Abertura</h3>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {activeSection.fields.map((field) => (
                    <FieldRenderer
                      key={field.name}
                      field={field}
                      values={values}
                      assets={assets}
                      canEdit={canEdit && canEditHomeField(role, field.name)}
                    />
                  ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {activeSection.fields.some((field) => canEdit && canEditHomeField(role, field.name)) ? (
                    <button
                      type="submit"
                      disabled={!canEdit || isSavingSection}
                      className="inline-flex items-center justify-center gap-3 bg-[#171006] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#2c2212] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSavingSection ? <Loader2 size={18} className="animate-spin text-[#f4cf6a]" /> : <Save size={18} />}
                      Salvar abertura
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 border border-[#d8c38b] bg-[#f7efd6] p-3 text-xs font-bold uppercase tracking-[0.12em] text-[#8b2f2b]">
                      Ajustes da abertura em modo de leitura.
                    </div>
                  )}
                  <a
                    href="/admin/midia"
                    className="inline-flex items-center justify-center gap-3 border border-[#8b2f2b]/30 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#8b2f2b] transition hover:bg-[#8b2f2b]/10"
                  >
                    Biblioteca de Mídia
                  </a>
                </div>
              </form>

              {/* Slides Management Section */}
              <section className="grid gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <ImageIcon size={18} className="text-[#8b2f2b]" />
                    <h3 className="font-serif text-2xl font-black text-[#171006]">Slider Principal</h3>
                  </div>
                  <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[#5a472c]">
                    Configure a imagem de fundo, os títulos e os links de cada slide. Quando houver mais de um slide publicado, a home alternará automaticamente entre eles.
                  </p>
                </div>

                <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_380px]">
                  {/* Slide Editor Form */}
                  <form onSubmit={handleSaveSlide} key={editingSlide?.id ?? "new-slide"} className="grid min-w-0 gap-4">
                    <input type="hidden" name="id" value={editingSlide?.id ?? ""} />

                    <div className="flex items-center justify-between border-b border-[#d8c38b]/30 pb-2">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#8b2f2b]">
                        {editingSlide ? `Editar Slide: ${editingSlide.titulo}` : "Criar Novo Slide"}
                      </p>
                      {editingSlide ? (
                        <button
                          type="button"
                          onClick={() => setEditingSlideId("")}
                          className="text-xs font-bold text-[#8b2f2b] underline underline-offset-4"
                        >
                          Novo slide
                        </button>
                      ) : null}
                    </div>

                    <label className="grid gap-1.5">
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Etiqueta / Data</span>
                      <input
                        name="data_label"
                        defaultValue={editingSlide?.data_label ?? ""}
                        disabled={!canWriteSlide}
                        className="border border-[#d8c38b] bg-[#fffaf0] px-3 py-2 text-xs outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
                        placeholder="Ex.: Berço do pentecostes no Brasil"
                      />
                    </label>

                    <label className="grid gap-1.5">
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Título do Slide</span>
                      <input
                        name="titulo"
                        required
                        defaultValue={editingSlide?.titulo ?? ""}
                        disabled={!canWriteSlide}
                        className="border border-[#d8c38b] bg-[#fffaf0] px-3 py-2 text-xs font-semibold outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
                        placeholder="Ex.: COMIEADEPA"
                      />
                    </label>

                    <label className="grid gap-1.5">
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Subtítulo</span>
                      <textarea
                        name="subtitulo"
                        defaultValue={editingSlide?.subtitulo ?? ""}
                        disabled={!canWriteSlide}
                        className="min-h-16 border border-[#d8c38b] bg-[#fffaf0] px-3 py-2 text-xs leading-relaxed outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
                        placeholder="A primeira convenção assembleiana do Brasil..."
                      />
                    </label>

                    <label className="grid gap-1.5">
                      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Descrição</span>
                      <textarea
                        name="descricao"
                        defaultValue={editingSlide?.descricao ?? ""}
                        disabled={!canWriteSlide}
                        className="min-h-16 border border-[#d8c38b] bg-[#fffaf0] px-3 py-2 text-xs leading-relaxed outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
                        placeholder="Mais de cem anos proclamando o Evangelho..."
                      />
                    </label>

                    <MediaUrlField
                      name="imagem_url"
                      label="Imagem de Fundo"
                      defaultValue={editingSlide?.imagem_url ?? ""}
                      assets={assets}
                      helper="Use uma imagem horizontal em boa resolução da biblioteca."
                      disabled={!canWriteSlide}
                    />

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-1.5">
                        <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Texto do Botão</span>
                        <input
                          name="botao_texto"
                          defaultValue={editingSlide?.botao_texto ?? ""}
                          disabled={!canWriteSlide}
                          className="border border-[#d8c38b] bg-[#fffaf0] px-3 py-2 text-xs outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
                          placeholder="Conheça a história"
                        />
                      </label>
                      <label className="grid gap-1.5">
                        <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Link do Botão</span>
                        <input
                          name="botao_url"
                          defaultValue={editingSlide?.botao_url ?? ""}
                          disabled={!canWriteSlide}
                          className="border border-[#d8c38b] bg-[#fffaf0] px-3 py-2 text-xs font-mono outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
                          placeholder="#a-comieadepa"
                        />
                      </label>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <label className="grid gap-1.5">
                        <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Status</span>
                        <select
                          name="status"
                          defaultValue={editingSlide?.status ?? "rascunho"}
                          disabled={!canWriteSlide}
                          className="border border-[#d8c38b] bg-[#fffaf0] px-3 py-2 text-xs font-semibold outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="rascunho">Rascunho</option>
                          {canPublishSlide ? <option value="publicado">Publicado</option> : null}
                          {canArchiveSlide ? <option value="arquivado">Arquivado</option> : null}
                        </select>
                      </label>

                      <label className="grid gap-1.5">
                        <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Ordem</span>
                        <input
                          name="ordem"
                          type="number"
                          defaultValue={editingSlide?.ordem ?? 0}
                          disabled={!canWriteSlide}
                          className="border border-[#d8c38b] bg-[#fffaf0] px-3 py-2 text-xs outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </label>

                      <label className="inline-flex items-center gap-2 border border-dashed border-[#d8c38b] bg-[#f7efd6] px-3 py-2 text-xs font-semibold text-[#5a472c] sm:self-end">
                        <input
                          name="abrir_nova_aba"
                          type="checkbox"
                          defaultChecked={editingSlide?.abrir_nova_aba ?? false}
                          disabled={!canWriteSlide}
                          className="h-4 w-4 accent-[#8b2f2b]"
                        />
                        Nova aba
                      </label>
                    </div>

                    <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="submit"
                        disabled={!canWriteSlide || isSavingSlide}
                        className="inline-flex items-center justify-center gap-2 bg-[#171006] px-5 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#2c2212] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSavingSlide ? <Loader2 size={15} className="animate-spin text-[#f4cf6a]" /> : <Save size={15} />}
                        {editingSlide ? "Atualizar Slide" : "Salvar Slide"}
                      </button>

                      {editingSlide ? (
                        <button
                          type="button"
                          onClick={() => setEditingSlideId("")}
                          className="w-fit text-xs font-bold text-[#8b2f2b] underline underline-offset-4"
                        >
                          Cancelar edição
                        </button>
                      ) : null}
                    </div>
                  </form>

                  {/* Slides List Panel */}
                  <div className="border border-[#d8c38b] bg-[#171006] p-5 text-white shadow-md">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Acervo do Slider</p>
                        <h4 className="font-serif text-lg font-bold text-white">Slides Cadastrados</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingSlideId("")}
                        className="inline-flex items-center gap-1 bg-[#f4cf6a] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#171006] transition hover:bg-[#ffe28a]"
                      >
                        <Plus size={13} />
                        Novo
                      </button>
                    </div>

                    {/* Filter Pills */}
                    <div className="mt-3">
                      <AdminFilterPills
                        current={statusFilter}
                        onSelect={(val) => setStatusFilter(val as typeof statusFilter)}
                        options={[
                          { value: "todos", label: "Todos" },
                          { value: "publicado", label: "Publicados" },
                          { value: "rascunho", label: "Rascunhos" },
                          { value: "arquivado", label: "Arquivados" },
                        ]}
                      />
                    </div>

                    {/* Slide Cards */}
                    <div className="mt-4 grid gap-3">
                      {filteredSlides.map((slide) => {
                        const isCurrent = editingSlideId === slide.id;

                        return (
                          <article
                            key={slide.id}
                            className={`border p-3.5 transition ${
                              isCurrent
                                ? "border-[#f4cf6a] bg-white/15"
                                : "border-white/10 bg-white/[0.055] hover:border-white/25"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <AdminStatusBadge status={slide.status} />
                              <span className="font-mono text-[10px] text-white/50">Ordem: {slide.ordem}</span>
                            </div>

                            <h5 className="mt-2 font-serif text-base font-bold text-white line-clamp-1">
                              {slide.titulo}
                            </h5>

                            {slide.subtitulo ? (
                              <p className="mt-1 text-xs text-white/60 line-clamp-1">{slide.subtitulo}</p>
                            ) : null}

                            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-2.5">
                              {canEdit ? (
                                <button
                                  type="button"
                                  onClick={() => setEditingSlideId(slide.id)}
                                  className="text-xs font-black uppercase tracking-[0.14em] text-[#f4cf6a] hover:underline"
                                >
                                  Editar
                                </button>
                              ) : null}

                              {canPublishSlide && slide.status !== "publicado" ? (
                                <button
                                  type="button"
                                  onClick={() => handleQuickStatus(slide, "publicado")}
                                  className="text-xs font-black uppercase tracking-[0.14em] text-white/70 hover:text-white"
                                >
                                  Publicar
                                </button>
                              ) : null}

                              {canPublishSlide && slide.status === "publicado" ? (
                                <button
                                  type="button"
                                  onClick={() => handleQuickStatus(slide, "rascunho")}
                                  className="text-xs font-black uppercase tracking-[0.14em] text-white/50 hover:text-white"
                                >
                                  Despublicar
                                </button>
                              ) : null}

                              {canArchiveSlide && slide.status !== "arquivado" ? (
                                <button
                                  type="button"
                                  onClick={() => handleArchive(slide.id)}
                                  className="text-xs font-black uppercase tracking-[0.14em] text-white/50 hover:text-white"
                                >
                                  Arquivar
                                </button>
                              ) : null}

                              {canDeleteSlide ? (
                                <button
                                  type="button"
                                  onClick={() => handleDelete(slide.id)}
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

                      {filteredSlides.length === 0 ? (
                        <div className="mt-2">
                          <AdminEmptyState
                            title="Nenhum slide encontrado"
                            description="Altere o filtro de status para ver outros slides."
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        ) : (
          /* Institutional / Editorial Section Form */
          <form
            onSubmit={handleSaveSection}
            className="min-w-0 border border-[#d8c38b] bg-white/76 p-4 shadow-[0_18px_50px_rgba(23,16,6,.08)] sm:p-6"
          >
            <SectionHeader
              eyebrow={activeSection.eyebrow}
              title={activeSection.title}
              description={activeSection.description}
            />

            <div className="mt-6 grid gap-5">
              {activeSection.fields.map((field) => (
                <FieldRenderer
                  key={field.name}
                  field={field}
                  values={values}
                  assets={assets}
                  canEdit={canEdit && canEditHomeField(role, field.name)}
                />
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 border-t border-[#ead9a6] pt-6 sm:flex-row">
              {activeSection.fields.some((field) => canEdit && canEditHomeField(role, field.name)) ? (
                <button
                  type="submit"
                  disabled={!canEdit || isSavingSection}
                  className="inline-flex items-center justify-center gap-3 bg-[#171006] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#2c2212] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingSection ? <Loader2 size={18} className="animate-spin text-[#f4cf6a]" /> : <Save size={18} />}
                  Salvar seção
                </button>
              ) : (
                <div className="flex items-center gap-2 border border-[#d8c38b] bg-[#f7efd6] p-4 text-xs font-bold uppercase tracking-[0.12em] text-[#8b2f2b]">
                  Seção institucional em modo de leitura (governança restrita).
                </div>
              )}
              <a
                href="/admin/midia"
                className="inline-flex items-center justify-center gap-3 border border-[#8b2f2b]/30 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#8b2f2b] transition hover:bg-[#8b2f2b]/10"
              >
                Biblioteca de Mídia
              </a>
            </div>
          </form>
        )}

        {/* Info panel */}
        <aside className="h-fit border border-[#d8c38b] bg-[#171006] p-6 text-white">
          <div className="grid h-12 w-12 place-items-center bg-[#f4cf6a] text-[#171006]">
            <Sparkles size={23} />
          </div>
          <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Controle Editorial</p>
          <h3 className="mt-2 font-serif text-2xl font-black leading-tight">Mudanças publicam direto na Home</h3>
          <p className="mt-3 text-xs leading-relaxed text-white/60">
            Esta tela gerencia as chamadas principais, textos e imagens da página inicial. Notícias, vídeos e departamentos continuam sendo alimentados em seus módulos específicos.
          </p>
          <div className="mt-4 grid gap-2 text-xs text-white/70">
            <span className="border border-white/10 bg-white/[0.055] p-2.5">Use títulos objetivos e chamativos.</span>
            <span className="border border-white/10 bg-white/[0.055] p-2.5">Prefira imagens horizontais em alta definição.</span>
            <span className="border border-white/10 bg-white/[0.055] p-2.5">Abra a home em nova aba para homologar as mudanças.</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-[#ead9a6] pb-5 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8b2f2b]">{eyebrow}</p>
        <h2 className="mt-1 font-serif text-3xl font-black leading-tight text-[#171006]">{title}</h2>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[#5a472c]">{description}</p>
      </div>
      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-fit items-center justify-center gap-2 border border-[#8b2f2b]/30 px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-[#8b2f2b] transition hover:bg-[#8b2f2b]/10"
      >
        Ver portal
        <ExternalLink size={15} />
      </a>
    </div>
  );
}

function FieldRenderer({
  field,
  values,
  assets,
  canEdit,
}: {
  field: (typeof homeSettingSections)[number]["fields"][number];
  values: Record<string, string>;
  assets: MediaPickerAsset[];
  canEdit: boolean;
}) {
  if (field.type === "textarea") {
    return (
      <label className="grid gap-1.5">
        <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">{field.label}</span>
        <textarea
          name={field.name}
          defaultValue={values[field.name] ?? ""}
          className="min-h-28 border border-[#d8c38b] bg-[#fffaf0] px-3 py-2.5 text-xs leading-relaxed outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
          placeholder={field.placeholder}
          disabled={!canEdit}
        />
      </label>
    );
  }

  if (field.type === "image") {
    return (
      <div className="md:col-span-2">
        <MediaUrlField
          name={field.name}
          label={field.label}
          defaultValue={values[field.name] ?? ""}
          placeholder={field.placeholder}
          helper={field.helper}
          assets={assets}
          disabled={!canEdit}
        />
      </div>
    );
  }

  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">{field.label}</span>
      <input
        name={field.name}
        type={field.type === "number" ? "number" : "text"}
        defaultValue={values[field.name] ?? ""}
        className="border border-[#d8c38b] bg-[#fffaf0] px-3 py-2 text-xs outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
        placeholder={field.placeholder}
        disabled={!canEdit}
        min={field.type === "number" ? 3 : undefined}
      />
    </label>
  );
}

function buildSlideFormData(slide: CmsHomeSlide, status: HomeSlideStatus) {
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
