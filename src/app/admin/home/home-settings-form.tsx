"use client";

import { ExternalLink, ImageIcon, Save, Sparkles, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { canEditHomeField, homeSettingSections, HomeSettingKey } from "@/lib/home-settings";
import { CmsHomeSlide, HomeSlideStatus } from "@/lib/home-slides";
import { AdminRole } from "@/lib/admin-permissions";
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

const statusLabels: Record<HomeSlideStatus, string> = {
  rascunho: "Rascunho",
  publicado: "Publicado",
  arquivado: "Arquivado",
};

export function HomeSettingsForm({
  role = "admin",
  values,
  assets,
  canEdit = true,
  slides,
  canCreateSlide,
  canPublishSlide,
  canArchiveSlide,
  canDeleteSlide,
}: HomeSettingsFormProps) {
  const [activeSectionId, setActiveSectionId] = useState<string>(homeSettingSections[0]?.id ?? "");
  const [editingSlideId, setEditingSlideId] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | HomeSlideStatus>("todos");

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

  async function saveHomeSection(keys: string[], formData: FormData) {
    const payload = new FormData();
    for (const key of keys) {
      if (canEditHomeField(role, key as HomeSettingKey)) {
        payload.set(key, String(formData.get(key) ?? ""));
      }
    }

    const response = await fetch("/api/admin/home", {
      method: "POST",
      body: payload,
    });

    if (response.redirected) {
      window.location.href = response.url;
      return;
    }

    if (!response.ok) {
      throw new Error("Erro ao salvar seção.");
    }

    window.location.href = "/admin/home?success=1";
  }

  async function handleSubmitHero(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nativeEvent = event.nativeEvent as SubmitEvent;
    const submitter = nativeEvent.submitter as HTMLButtonElement | null;
    const action = submitter?.value;
    const formData = new FormData(event.currentTarget);

    try {
      if (action === "save-home") {
        if (!canEdit) {
          return;
        }

        await saveHomeSection(activeSection.fields.map((field) => field.name), formData);
        return;
      }

      if (action === "save-slide") {
        if (!canWriteSlide) {
          return;
        }

        const slidePayload = new FormData();
        const slideFields = ["id", "data_label", "titulo", "subtitulo", "descricao", "imagem_url", "botao_texto", "botao_url", "status", "ordem"] as const;
        for (const key of slideFields) {
          slidePayload.set(key, String(formData.get(key) ?? ""));
        }

        if (formData.get("abrir_nova_aba") === "on") {
          slidePayload.set("abrir_nova_aba", "on");
        }

        const isEditing = Boolean(slidePayload.get("id"));
        const response = await fetch("/api/admin/home/slides", {
          method: isEditing ? "PUT" : "POST",
          body: slidePayload,
        });

        if (response.redirected) {
          window.location.href = response.url;
          return;
        }

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(typeof payload?.error === "string" ? payload.error : "Erro ao salvar slide.");
        }

        window.location.href = "/admin/home?success=1";
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar ajustes.";
      window.location.href = `/admin/home?error=1&message=${encodeURIComponent(message)}`;
    }
  }

  async function handleQuickStatus(slide: CmsHomeSlide, status: HomeSlideStatus) {
    if (!canEdit) {
      return;
    }

    try {
      const response = await fetch("/api/admin/home/slides", {
        method: "PUT",
        body: buildSlideFormData(slide, status),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(typeof payload?.error === "string" ? payload.error : "Erro ao atualizar slide.");
      }

      window.location.href = "/admin/home?success=1";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar slide.";
      window.location.href = `/admin/home?error=1&message=${encodeURIComponent(message)}`;
    }
  }

  async function handleArchive(id: string) {
    if (!canArchiveSlide) {
      return;
    }

    await handleDeleteRequest(`/api/admin/home/slides?id=${encodeURIComponent(id)}`, "Erro ao arquivar slide.");
  }

  async function handleDelete(id: string) {
    if (!canDeleteSlide) {
      return;
    }

    if (!window.confirm("Excluir definitivamente este slide?")) {
      return;
    }

    await handleDeleteRequest(`/api/admin/home/slides?id=${encodeURIComponent(id)}&hard=1`, "Erro ao excluir slide.");
  }

  async function handleDeleteRequest(url: string, fallbackMessage: string) {
    try {
      const response = await fetch(url, { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(typeof payload?.error === "string" ? payload.error : fallbackMessage);
      }

      window.location.href = "/admin/home?success=1";
    } catch (error) {
      const message = error instanceof Error ? error.message : fallbackMessage;
      window.location.href = `/admin/home?error=1&message=${encodeURIComponent(message)}`;
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
      <nav className="h-fit border border-[#d8c38b] bg-white/76 p-3">
        <p className="px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Seções da home</p>
        <div className="mt-2 grid gap-2">
          {homeSettingSections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSectionId(section.id)}
              className={`px-4 py-3 text-left transition ${
                activeSection.id === section.id ? "bg-[#171006] text-white" : "border border-[#ead9a6] bg-[#f7efd6] text-[#5a472c] hover:bg-white"
              }`}
            >
              <span className={`block text-[10px] font-black uppercase tracking-[0.16em] ${activeSection.id === section.id ? "text-[#f4cf6a]" : "text-[#8b2f2b]"}`}>
                {section.eyebrow}
              </span>
              <span className="mt-1 block font-serif text-2xl font-black leading-tight">{section.title}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="grid gap-6 min-w-0">
        {isHeroSection ? (
          <form onSubmit={handleSubmitHero} className="min-w-0 border border-[#d8c38b] bg-white/76 p-4 shadow-[0_18px_50px_rgba(23,16,6,.08)] sm:p-6">
            <SectionHeader
              eyebrow="Abertura"
              title="Hero e slider principal"
              description="Um único editor para os ajustes da abertura e para o gerenciamento dos slides que alternam na home."
            />

            <div className="mt-6 grid gap-8">
              <section className="grid gap-5 border-b border-[#ead9a6] pb-8">
                <div className="flex items-center gap-3">
                  <Sparkles size={18} className="text-[#8b2f2b]" />
                  <h3 className="font-serif text-2xl font-black text-[#171006]">Ajustes da abertura</h3>
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
                      value="save-home"
                      className="inline-flex items-center justify-center gap-3 bg-[#171006] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={!canEdit}
                    >
                      <Save size={18} />
                      Salvar abertura
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 border border-[#d8c38b] bg-[#f7efd6] p-3 text-xs font-bold uppercase tracking-[0.12em] text-[#8b2f2b]">
                      Ajustes da abertura em modo de leitura.
                    </div>
                  )}
                  <a
                    href="/admin/midia"
                    className="inline-flex items-center justify-center gap-3 border border-[#8b2f2b]/30 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#8b2f2b]"
                  >
                    Biblioteca de mídia
                  </a>
                </div>
              </section>

              <section className="grid gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <ImageIcon size={18} className="text-[#8b2f2b]" />
                    <h3 className="font-serif text-2xl font-black text-[#171006]">Slider principal</h3>
                  </div>
                  <p className="mt-3 max-w-2xl leading-7 text-[#5a472c]">
                    Configure aqui a imagem de fundo, os textos e o CTA de cada slide do hero. Quando houver mais de um slide publicado, a home alternará automaticamente entre eles.
                  </p>
                </div>

                <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
                  <div key={editingSlide?.id ?? "new-slide"} className="grid min-w-0 gap-5">
                    <input type="hidden" name="id" value={editingSlide?.id ?? ""} />

                    <label className="grid gap-2">
                      <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Etiqueta / data</span>
                      <input
                        name="data_label"
                        defaultValue={editingSlide?.data_label ?? ""}
                        disabled={!canWriteSlide}
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
                        disabled={!canWriteSlide}
                        className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
                        placeholder="COMIEADEPA"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Subtítulo</span>
                      <textarea
                        name="subtitulo"
                        defaultValue={editingSlide?.subtitulo ?? ""}
                        disabled={!canWriteSlide}
                        className="min-h-24 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 leading-7 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
                        placeholder="A primeira convenção assembleiana do Brasil..."
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Descrição</span>
                      <textarea
                        name="descricao"
                        defaultValue={editingSlide?.descricao ?? ""}
                        disabled={!canWriteSlide}
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
                      disabled={!canWriteSlide}
                    />

                    <div className="grid gap-5 lg:grid-cols-2">
                      <label className="grid gap-2">
                        <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Texto do botão</span>
                        <input
                          name="botao_texto"
                          defaultValue={editingSlide?.botao_texto ?? ""}
                          disabled={!canWriteSlide}
                          className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
                          placeholder="Conheça a história"
                        />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Link do botão</span>
                        <input
                          name="botao_url"
                          defaultValue={editingSlide?.botao_url ?? ""}
                          disabled={!canWriteSlide}
                          className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
                          placeholder="#a-comieadepa"
                        />
                      </label>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-3">
                      <label className="grid gap-2">
                        <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Status</span>
                        <select
                          name="status"
                          defaultValue={editingSlide?.status ?? "rascunho"}
                          disabled={!canWriteSlide}
                          className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="rascunho">Rascunho</option>
                          {canPublishSlide ? <option value="publicado">Publicado</option> : null}
                          {canArchiveSlide ? <option value="arquivado">Arquivado</option> : null}
                        </select>
                      </label>

                      <label className="grid gap-2">
                        <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Ordem</span>
                        <input
                          name="ordem"
                          type="number"
                          defaultValue={editingSlide?.ordem ?? 0}
                          disabled={!canWriteSlide}
                          className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </label>

                      <label className="inline-flex min-h-[52px] items-center gap-3 border border-dashed border-[#d8c38b] bg-[#f7efd6] px-4 py-3 text-sm font-semibold text-[#5a472c] lg:self-end">
                        <input
                          name="abrir_nova_aba"
                          type="checkbox"
                          defaultChecked={editingSlide?.abrir_nova_aba ?? false}
                          disabled={!canWriteSlide}
                          className="h-4 w-4 accent-[#8b2f2b]"
                        />
                        Abrir em nova aba
                      </label>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="submit"
                        value="save-slide"
                        className="inline-flex items-center justify-center gap-3 bg-[#171006] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={!canWriteSlide}
                      >
                        <Save size={18} />
                        {editingSlide ? "Atualizar slide" : "Salvar slide"}
                      </button>
                      {editingSlide ? (
                        <button
                          type="button"
                          onClick={() => setEditingSlideId("")}
                          className="w-fit text-sm font-semibold text-[#8b2f2b] underline underline-offset-4"
                        >
                          Cancelar edição
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="border border-[#d8c38b] bg-[#171006] p-5 text-white">
                    <div className="grid h-12 w-12 place-items-center bg-[#f4cf6a] text-[#171006]">
                      <Sparkles size={23} />
                    </div>
                    <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Slides</p>
                    <h3 className="mt-2 font-serif text-3xl font-black leading-tight">Lista do slider principal</h3>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {(["todos", "rascunho", "publicado", "arquivado"] as const).map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setStatusFilter(value)}
                          className={`px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] transition ${
                            statusFilter === value ? "bg-[#f4cf6a] text-[#171006]" : "border border-white/10 text-white/60 hover:border-[#f4cf6a] hover:text-[#f4cf6a]"
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
                          <h4 className="mt-2 font-serif text-2xl font-black">{slide.titulo}</h4>
                          {slide.data_label ? <p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/60">{slide.data_label}</p> : null}
                          {slide.subtitulo ? <p className="mt-3 text-sm leading-6 text-white/60">{slide.subtitulo}</p> : null}

                          <div className="mt-4 flex flex-wrap gap-3">
                            {canEdit ? (
                              <button
                                type="button"
                                onClick={() => setEditingSlideId(slide.id)}
                                className="text-xs font-black uppercase tracking-[0.14em] text-[#f4cf6a]"
                              >
                                Editar
                              </button>
                            ) : null}

                            {canPublishSlide && slide.status !== "publicado" ? (
                              <button
                                type="button"
                                onClick={() => handleQuickStatus(slide, "publicado")}
                                className="text-xs font-black uppercase tracking-[0.14em] text-white/60 hover:text-[#f4cf6a]"
                              >
                                Publicar
                              </button>
                            ) : null}

                            {canPublishSlide && slide.status === "publicado" ? (
                              <button
                                type="button"
                                onClick={() => handleQuickStatus(slide, "rascunho")}
                                className="text-xs font-black uppercase tracking-[0.14em] text-white/60 hover:text-[#f4cf6a]"
                              >
                                Despublicar
                              </button>
                            ) : null}

                            {canArchiveSlide && slide.status !== "arquivado" ? (
                              <button
                                type="button"
                                onClick={() => handleArchive(slide.id)}
                                className="text-xs font-black uppercase tracking-[0.14em] text-white/50 hover:text-[#f4cf6a]"
                              >
                                Arquivar
                              </button>
                            ) : null}

                            {canDeleteSlide ? (
                              <button
                                type="button"
                                onClick={() => handleDelete(slide.id)}
                                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/50 hover:text-[#f4cf6a]"
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
                  </div>
                </div>
              </section>
            </div>
          </form>
        ) : (
          <form
            action="/api/admin/home"
            method="post"
            className="min-w-0 border border-[#d8c38b] bg-white/76 p-4 shadow-[0_18px_50px_rgba(23,16,6,.08)] sm:p-6"
          >
            <SectionHeader eyebrow={activeSection.eyebrow} title={activeSection.title} description={activeSection.description} />

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
                  className="inline-flex items-center justify-center gap-3 bg-[#171006] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!canEdit}
                >
                  <Save size={18} />
                  Salvar seção
                </button>
              ) : (
                <div className="flex items-center gap-2 border border-[#d8c38b] bg-[#f7efd6] p-4 text-xs font-bold uppercase tracking-[0.12em] text-[#8b2f2b]">
                  Seção institucional em modo de leitura (governança restrita).
                </div>
              )}
              <a
                href="/admin/midia"
                className="inline-flex items-center justify-center gap-3 border border-[#8b2f2b]/30 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#8b2f2b]"
              >
                Biblioteca de mídia
              </a>
            </div>
          </form>
        )}

        <aside className="h-fit border border-[#d8c38b] bg-[#171006] p-6 text-white">
          <div className="grid h-12 w-12 place-items-center bg-[#f4cf6a] text-[#171006]">
            <Sparkles size={23} />
          </div>
          <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Controle editorial</p>
          <h3 className="mt-2 font-serif text-3xl font-black leading-tight">Mudanças publicam direto na home.</h3>
          <p className="mt-4 leading-7 text-white/62">
            Esta tela edita chamadas, textos e imagens da página inicial. Notícias, vídeos e departamentos destacados continuam sendo escolhidos nos módulos próprios.
          </p>
          <div className="mt-6 grid gap-3 text-sm text-white/70">
            <span className="border border-white/10 bg-white/[0.055] p-3">Use textos curtos nos títulos.</span>
            <span className="border border-white/10 bg-white/[0.055] p-3">Prefira imagens horizontais nos banners.</span>
            <span className="border border-white/10 bg-white/[0.055] p-3">Revise a home em uma nova aba depois de salvar.</span>
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
    <div className="flex flex-col gap-5 border-b border-[#ead9a6] pb-6 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">{eyebrow}</p>
        <h2 className="mt-2 font-serif text-4xl font-black leading-tight">{title}</h2>
        <p className="mt-3 max-w-2xl leading-7 text-[#5a472c]">{description}</p>
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
      <label className="grid gap-2">
        <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">{field.label}</span>
        <textarea
          name={field.name}
          defaultValue={values[field.name] ?? ""}
          className="min-h-32 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 leading-7 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
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
    <label className="grid gap-2">
      <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">{field.label}</span>
      <input
        name={field.name}
        type={field.type === "number" ? "number" : "text"}
        defaultValue={values[field.name] ?? ""}
        className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
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
