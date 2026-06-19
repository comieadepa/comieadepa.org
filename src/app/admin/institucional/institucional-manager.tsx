"use client";

import { Edit, Eye, Plus, Search, Trash2, X, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { CmsInstitucional } from "@/lib/institucional";
import { MediaPickerAsset, MediaUrlField } from "../media-url-field";
import { RichTextField } from "../rich-text-field";
import { SecoesManager } from "./secoes-manager";
import { TemplateCreator } from "./template-creator";

type InstitucionalManagerProps = {
  initialItems: CmsInstitucional[];
  mediaAssets: MediaPickerAsset[];
  canCreate: boolean;
  canUpdate: boolean;
  canPublish: boolean;
  canDelete: boolean;
};

export function InstitucionalManager({
  initialItems,
  mediaAssets,
  canCreate,
  canUpdate,
  canPublish,
  canDelete,
}: InstitucionalManagerProps) {
  const items = initialItems;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "rascunho" | "publicado">("todos");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSecoesOpen, setIsSecoesOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CmsInstitucional | null>(null);

  // Form states
  const [formTitulo, setFormTitulo] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formStatus, setFormStatus] = useState<"rascunho" | "publicado">("rascunho");
  const [formOrdem, setFormOrdem] = useState(0);
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [formHeroBadge, setFormHeroBadge] = useState("");
  const [formHeroOpacity, setFormHeroOpacity] = useState(0.5);
  const [formHeroAlignment, setFormHeroAlignment] = useState<"left" | "center" | "right">("left");

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    return items
      .filter((item) => {
        if (statusFilter !== "todos" && item.status !== statusFilter) {
          return false;
        }

        if (!term) {
          return true;
        }

        return `${item.titulo} ${item.slug}`.toLowerCase().includes(term);
      })
      .sort((a, b) => a.ordem - b.ordem);
  }, [items, search, statusFilter]);

  function handleOpenCreate() {
    if (!canCreate) return;
    setEditingItem(null);
    setFormTitulo("");
    setFormSlug("");
    setFormStatus("rascunho");
    setFormOrdem(0);
    setIsSlugManual(false);
    setFormHeroBadge("");
    setFormHeroOpacity(0.5);
    setFormHeroAlignment("left");
    setIsModalOpen(true);
  }

  function handleOpenEdit(item: CmsInstitucional) {
    if (!canUpdate) return;
    setEditingItem(item);
    setFormTitulo(item.titulo);
    setFormSlug(item.slug);
    setFormStatus(item.status);
    setFormOrdem(item.ordem);
    setIsSlugManual(true);
    setFormHeroBadge(item.hero_badge ?? "");
    setFormHeroOpacity(item.hero_overlay_opacity ?? 0.5);
    setFormHeroAlignment(item.hero_alignment ?? "left");
    setIsModalOpen(true);
  }

  function slugify(text: string) {
    return text
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove acentos
      .replace(/[^a-z0-9 -]/g, "") // remove caracteres especiais
      .replace(/\s+/g, "-") // substitui espacos por -
      .replace(/-+/g, "-") // remove hifens repetidos
      .replace(/^-+/, "") // trim hifen inicio
      .replace(/-+$/, ""); // trim hifen fim
  }

  function handleTituloChange(value: string) {
    setFormTitulo(value);
    if (!isSlugManual) {
      setFormSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setFormSlug(slugify(value));
    setIsSlugManual(true);
  }

  async function handleToggleStatus(item: CmsInstitucional) {
    if (!canPublish) return;
    const newStatus = item.status === "publicado" ? "rascunho" : "publicado";

    try {
      const response = await fetch("/api/admin/institucional", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          titulo: item.titulo,
          slug: item.slug,
          status: newStatus,
          ordem: item.ordem,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        alert(err.error || "Erro ao atualizar status.");
        return;
      }

      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Erro ao conectar à API.");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canWrite) return;

    const formData = new FormData(e.currentTarget);

    const payload = {
      id: editingItem?.id,
      titulo: formTitulo,
      slug: formSlug,
      subtitulo: (formData.get("subtitulo") as string) || null,
      descricao: (formData.get("descricao") as string) || null,
      conteudo: (formData.get("conteudo") as string) || null,
      hero_image_url: (formData.get("hero_image_url") as string) || null,
      hero_badge: formHeroBadge || null,
      hero_overlay_opacity: formHeroOpacity,
      hero_alignment: formHeroAlignment,
      seo_title: (formData.get("seo_title") as string) || null,
      seo_description: (formData.get("seo_description") as string) || null,
      status: formStatus,
      ordem: formOrdem,
    };

    try {
      const response = await fetch("/api/admin/institucional", {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        alert(err.error || "Erro ao salvar.");
        return;
      }

      setIsModalOpen(false);
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Erro de comunicação com a API.");
    }
  }

  async function handleDelete(id: string) {
    if (!canDelete) return;
    if (!window.confirm("Excluir definitivamente esta página institucional?")) return;

    try {
      const response = await fetch(`/api/admin/institucional?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const err = await response.json();
        alert(err.error || "Erro ao excluir.");
        return;
      }

      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Erro de comunicação com a API.");
    }
  }

  const canWrite = editingItem ? canUpdate : canCreate;

  return (
    <div className="grid gap-6">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-[#d8c38b] bg-[#171006] p-6 text-white">
        <div className="flex flex-wrap gap-2">
          {(["todos", "rascunho", "publicado"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 text-xs font-black uppercase tracking-[0.12em] transition ${
                statusFilter === filter
                  ? "bg-[#f4cf6a] text-[#171006]"
                  : "border border-white/10 text-white/54 hover:border-[#f4cf6a] hover:text-[#f4cf6a]"
              }`}
            >
              {filter === "todos" ? "Todos" : filter === "publicado" ? "Publicado" : "Rascunho"}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Pesquisar por título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 border border-white/10 bg-white/[0.055] py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-[#f4cf6a]"
            />
            <Search size={14} className="absolute left-3.5 top-3 text-white/40" />
          </div>

          {canCreate && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 bg-[#f4cf6a] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#171006] hover:bg-[#ebd59b] transition"
            >
              <Plus size={16} />
              Nova Página Institucional
            </button>
          )}

          <TemplateCreator
            canCreate={canCreate}
            existingSlugs={items.map((i) => i.slug)}
          />
        </div>
      </div>

      {/* List Table */}
      <section className="border border-[#d8c38b] bg-white overflow-x-auto shadow-[0_18px_50px_rgba(23,16,6,.05)]">
        <table className="min-w-full divide-y divide-[#ead9a6] text-left text-sm">
          <thead className="bg-[#fffaf0] text-[11px] font-black uppercase tracking-[0.15em] text-[#8b2f2b]">
            <tr>
              <th className="px-6 py-4">Título</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Ordem</th>
              <th className="px-6 py-4">Atualização</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ead9a6] text-[#5a472c]">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-[#fffaf0]/40 transition">
                <td className="px-6 py-4 font-serif text-base font-bold text-[#171006]">{item.titulo}</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-500">/{item.slug}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleStatus(item)}
                    disabled={!canPublish}
                    className={`inline-flex px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em] cursor-pointer disabled:cursor-not-allowed ${
                      item.status === "publicado"
                        ? "bg-[#00b67a] text-white"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {item.status === "publicado" ? "Publicado" : "Rascunho"}
                  </button>
                </td>
                <td className="px-6 py-4 text-center font-bold">{item.ordem}</td>
                <td className="px-6 py-4 text-xs text-slate-500">
                  {new Date(item.updated_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3">
                    <a
                      href={`/admin/preview/institucional/${item.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.12em] text-[#8b2f2b]/70 hover:text-[#8b2f2b] transition"
                    >
                      <Eye size={12} />
                      Preview
                    </a>
                    {canUpdate && (
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.12em] text-[#0F3B63] hover:underline"
                      >
                        <Edit size={12} />
                        Editar
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.12em] text-red-700 hover:underline"
                      >
                        <Trash2 size={12} />
                        Excluir
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  Nenhuma página institucional encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl border border-[#d8c38b] bg-white shadow-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#ead9a6] bg-[#fffaf0] px-6 py-4 shrink-0">
              <h3 className="font-serif text-lg font-bold text-[#171006]">
                {editingItem ? "Editar Página Institucional" : "Nova Página Institucional"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-black transition">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex-1 grid gap-5">
              <div className="border-b border-[#ead9a6] pb-2">
                <h4 className="font-serif text-sm font-bold text-[#8b2f2b] uppercase tracking-wider">Conteúdo Principal</h4>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Título</span>
                  <input
                    type="text"
                    name="titulo"
                    required
                    value={formTitulo}
                    onChange={(e) => handleTituloChange(e.target.value)}
                    className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-2.5 outline-none focus:border-[#8b2f2b]"
                    placeholder="Ex: Estatuto da Convenção"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Slug URL</span>
                  <input
                    type="text"
                    name="slug"
                    required
                    value={formSlug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-2.5 outline-none focus:border-[#8b2f2b] font-mono text-xs"
                    placeholder="ex-estatuto-da-convencao"
                  />
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Subtítulo</span>
                <input
                  type="text"
                  name="subtitulo"
                  defaultValue={editingItem?.subtitulo ?? ""}
                  className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-2.5 outline-none focus:border-[#8b2f2b]"
                  placeholder="Subtítulo opcional de apoio"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Descrição Curta</span>
                <textarea
                  name="descricao"
                  defaultValue={editingItem?.descricao ?? ""}
                  rows={3}
                  className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-2.5 outline-none focus:border-[#8b2f2b]"
                  placeholder="Resumo ou descrição curta da página."
                />
              </label>

              <RichTextField
                name="conteudo"
                label="Conteúdo Principal"
                defaultValue={editingItem?.conteudo ?? ""}
                placeholder="Conteúdo completo em markdown."
              />

              <div className="border-b border-[#ead9a6] pb-2 mt-2">
                <h4 className="font-serif text-sm font-bold text-[#8b2f2b] uppercase tracking-wider">Design & Mídia</h4>
              </div>

              <MediaUrlField
                name="hero_image_url"
                label="Imagem Hero (Topo)"
                defaultValue={editingItem?.hero_image_url ?? ""}
                assets={mediaAssets}
                helper="Selecione ou cole a URL da imagem de topo da página."
              />

              {/* Hero Badge */}
              <label className="grid gap-1">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Badge do Hero</span>
                <input
                  type="text"
                  placeholder="Ex: INSTITUCIONAL, PRESIDENTE, DOCUMENTOS"
                  value={formHeroBadge}
                  onChange={(e) => setFormHeroBadge(e.target.value)}
                  className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-2.5 outline-none focus:border-[#8b2f2b]"
                />
                <span className="text-[11px] text-slate-400">Texto exibido em destaque acima do título no hero.</span>
              </label>

              {/* Hero Overlay Opacity */}
              <label className="grid gap-1">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">
                  Opacidade do Overlay ({Math.round(formHeroOpacity * 100)}%)
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={formHeroOpacity}
                  onChange={(e) => setFormHeroOpacity(Number(e.target.value))}
                  className="accent-[#8b2f2b] w-full"
                />
                <span className="text-[11px] text-slate-400">0% = sem escurecimento · 100% = completamente escuro</span>
              </label>

              {/* Hero Alignment */}
              <div className="grid gap-1">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Alinhamento do Conteúdo</span>
                <div className="flex gap-2">
                  {(["left", "center", "right"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFormHeroAlignment(opt)}
                      className={`flex-1 py-2 text-xs font-black uppercase tracking-[0.1em] border transition ${
                        formHeroAlignment === opt
                          ? "border-[#8b2f2b] bg-[#8b2f2b] text-white"
                          : "border-[#d8c38b] bg-[#fffaf0] text-[#5a472c] hover:border-[#8b2f2b]"
                      }`}
                    >
                      {opt === "left" ? "← Esquerda" : opt === "center" ? "↔ Centro" : "→ Direita"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-b border-[#ead9a6] pb-2 mt-2">
                <h4 className="font-serif text-sm font-bold text-[#8b2f2b] uppercase tracking-wider">Otimização de SEO</h4>
              </div>

              <label className="grid gap-1">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">SEO Title</span>
                <input
                  type="text"
                  name="seo_title"
                  defaultValue={editingItem?.seo_title ?? ""}
                  className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-2.5 outline-none focus:border-[#8b2f2b]"
                  placeholder="Título para motores de busca (opcional)"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">SEO Description</span>
                <textarea
                  name="seo_description"
                  defaultValue={editingItem?.seo_description ?? ""}
                  rows={2}
                  className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-2.5 outline-none focus:border-[#8b2f2b]"
                  placeholder="Descrição resumida para motores de busca (opcional)"
                />
              </label>

              {editingItem && (
                <div className="border-b border-[#ead9a6] pb-2 mt-2 flex justify-between items-center">
                  <h4 className="font-serif text-sm font-bold text-[#8b2f2b] uppercase tracking-wider">Seções de Conteúdo</h4>
                  <button
                    type="button"
                    onClick={() => setIsSecoesOpen(true)}
                    className="bg-[#0F3B63] text-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] hover:bg-slate-700 transition"
                  >
                    Gerenciar Seções
                  </button>
                </div>
              )}

              <div className="border-b border-[#ead9a6] pb-2 mt-2">
                <h4 className="font-serif text-sm font-bold text-[#8b2f2b] uppercase tracking-wider">Configuração</h4>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Status</span>
                  <select
                    name="status"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as "rascunho" | "publicado")}
                    className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-2.5 outline-none focus:border-[#8b2f2b]"
                  >
                    <option value="rascunho">Rascunho</option>
                    <option value="publicado" disabled={!canPublish}>Publicado</option>
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Ordem</span>
                  <input
                    type="number"
                    name="ordem"
                    value={formOrdem}
                    onChange={(e) => setFormOrdem(Number(e.target.value))}
                    className="border border-[#d8c38b] px-4 py-2.5 outline-none focus:border-[#8b2f2b]"
                    min={0}
                  />
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6 border-t border-[#ead9a6] pt-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-[#8b2f2b] hover:bg-[#fffaf0] transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-[#171006] px-5 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-white hover:bg-slate-800 transition"
                >
                  <Save size={14} />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingItem && (
        <SecoesManager
          institucionalId={editingItem.id}
          institucionalTitulo={editingItem.titulo}
          mediaAssets={mediaAssets}
          isOpen={isSecoesOpen}
          onClose={() => setIsSecoesOpen(false)}
        />
      )}
    </div>
  );
}
