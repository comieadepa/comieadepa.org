"use client";

import { Save, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { CmsMesaGrupo, MesaDiretoraLayout } from "@/lib/mesa-diretora";
import { MediaPickerAsset, MediaUrlField } from "../../media-url-field";

type MesaDiretoraGroupsManagerProps = {
  initialGroups: CmsMesaGrupo[];
  mediaAssets: MediaPickerAsset[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

const layoutLabels: Record<MesaDiretoraLayout, string> = {
  hero: "Destaque Gigante (Hero)",
  center: "Destaque Médio Centralizado",
  grid2: "Grade de 2 colunas",
  grid3: "Grade de 3 colunas",
  grid4: "Grade de 4 colunas",
};

export function MesaDiretoraGroupsManager({
  initialGroups,
  mediaAssets,
  canCreate,
  canUpdate,
  canDelete,
}: MesaDiretoraGroupsManagerProps) {
  const groups = initialGroups;
  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "ativos" | "inativos">("todos");

  const editingGroup = groups.find((group) => group.id === editingId);
  const canWrite = editingGroup ? canUpdate : canCreate;

  const filteredGroups = useMemo(() => {
    const term = search.trim().toLowerCase();

    return groups.filter((group) => {
      if (statusFilter === "ativos" && !group.ativo) {
        return false;
      }
      if (statusFilter === "inativos" && group.ativo) {
        return false;
      }

      if (!term) {
        return true;
      }

      return `${group.nome} ${group.slug} ${group.descricao ?? ""}`
        .toLowerCase()
        .includes(term);
    });
  }, [groups, search, statusFilter]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canWrite) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const id = formData.get("id") as string;
    const isEditing = Boolean(id);

    const payload: Record<string, string | number | boolean | null> = {
      nome: formData.get("nome") as string,
      slug: (formData.get("slug") as string) || null,
      descricao: (formData.get("descricao") as string) || null,
      subtitulo: (formData.get("subtitulo") as string) || null,
      bg_image_url: (formData.get("bg_image_url") as string) || null,
      title_color: (formData.get("title_color") as string) || null,
      ordem: Number(formData.get("ordem") || 0),
      layout: formData.get("layout") as string,
      ativo: formData.get("ativo") === "on",
    };

    if (isEditing) {
      payload.id = id;
    }

    try {
      const response = await fetch("/api/admin/mesa-diretora/grupos", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message = typeof data?.error === "string" ? data.error : "Erro ao salvar grupo.";
        window.location.href = `/admin/mesa-diretora/grupos?error=1&message=${encodeURIComponent(message)}`;
        return;
      }

      window.location.href = "/admin/mesa-diretora/grupos?success=1";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar grupo.";
      window.location.href = `/admin/mesa-diretora/grupos?error=1&message=${encodeURIComponent(message)}`;
    }
  }

  async function handleDelete(id: string) {
    if (!canDelete) {
      return;
    }

    const confirmed = window.confirm("Excluir definitivamente este grupo?");
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/mesa-diretora/grupos?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message = typeof data?.error === "string" ? data.error : "Erro ao excluir grupo.";
        window.location.href = `/admin/mesa-diretora/grupos?error=1&message=${encodeURIComponent(message)}`;
        return;
      }

      window.location.href = "/admin/mesa-diretora/grupos?success=1";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao excluir grupo.";
      window.location.href = `/admin/mesa-diretora/grupos?error=1&message=${encodeURIComponent(message)}`;
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      {/* Form Section */}
      <section className="border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
        <h2 className="mb-6 font-serif text-2xl font-black text-[#171006]">
          {editingGroup ? "Editar Grupo" : "Novo Grupo"}
        </h2>
        <form onSubmit={handleSubmit} className="grid gap-5">
          {editingGroup && <input type="hidden" name="id" value={editingGroup.id} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Nome do Grupo</span>
              <input
                type="text"
                name="nome"
                required
                disabled={!canWrite}
                defaultValue={editingGroup?.nome ?? ""}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:opacity-60"
                placeholder="Ex: Vice-Presidentes"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Slug URL (Opcional)</span>
              <input
                type="text"
                name="slug"
                disabled={!canWrite}
                defaultValue={editingGroup?.slug ?? ""}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:opacity-60"
                placeholder="Ex: vice-presidentes"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Layout de Exibição</span>
              <select
                name="layout"
                required
                disabled={!canWrite}
                defaultValue={editingGroup?.layout ?? "grid3"}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:opacity-60"
              >
                {(Object.keys(layoutLabels) as MesaDiretoraLayout[]).map((key) => (
                  <option key={key} value={key}>
                    {layoutLabels[key]}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Cor do Título (CSS / Hex)</span>
              <input
                type="text"
                name="title_color"
                disabled={!canWrite}
                defaultValue={editingGroup?.title_color ?? ""}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:opacity-60"
                placeholder="Ex: #0F3B63 ou slate-800"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Subtítulo da Seção (Opcional)</span>
            <input
              type="text"
              name="subtitulo"
              disabled={!canWrite}
              defaultValue={editingGroup?.subtitulo ?? ""}
              className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:opacity-60"
              placeholder="Ex: Auxiliando a presidência em todas as funções"
            />
          </label>

          <MediaUrlField
            name="bg_image_url"
            label="Imagem de Fundo Específica do Grupo (Opcional)"
            defaultValue={editingGroup?.bg_image_url ?? ""}
            assets={mediaAssets}
            helper="Se fornecida, substitui a imagem padrão de fundo para esta seção específica."
            disabled={!canWrite}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Ordem de Exibição</span>
              <input
                type="number"
                name="ordem"
                disabled={!canWrite}
                defaultValue={editingGroup?.ordem ?? 0}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:opacity-60"
                placeholder="Ex: 10"
              />
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none mt-7">
              <input
                type="checkbox"
                name="ativo"
                disabled={!canWrite}
                defaultChecked={editingGroup?.ativo ?? true}
                className="h-5 w-5 accent-[#8b2f2b]"
              />
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Grupo Ativo</span>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Descrição do Grupo (Opcional)</span>
            <textarea
              name="descricao"
              disabled={!canWrite}
              defaultValue={editingGroup?.descricao ?? ""}
              className="min-h-24 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:opacity-60"
              placeholder="Ex: Breve detalhamento sobre as obrigações deste grupo."
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row mt-4">
            <button
              type="submit"
              disabled={!canWrite}
              className="inline-flex w-fit items-center gap-3 bg-[#171006] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer hover:bg-[#2c2212] transition"
            >
              <Save size={18} />
              {editingGroup ? "Atualizar Grupo" : "Salvar Grupo"}
            </button>
            {editingGroup && (
              <button
                type="button"
                onClick={() => setEditingId("")}
                className="text-sm font-semibold text-[#8b2f2b] underline underline-offset-4 cursor-pointer"
              >
                Cancelar edição
              </button>
            )}
          </div>
        </form>
      </section>

      {/* List Section */}
      <aside className="border border-[#d8c38b] bg-[#171006] p-6 text-white shadow-[0_18px_50px_rgba(23,16,6,.14)]">
        <div className="grid gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Painel de Controle</p>
            <h2 className="mt-2 font-serif text-3xl font-black">Listagem de Grupos</h2>
          </div>

          <div className="relative mt-2">
            <input
              type="text"
              placeholder="Pesquisar por nome, slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-white/10 bg-white/[0.055] py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-[#f4cf6a]"
            />
            <Search size={16} className="absolute left-3.5 top-3.5 text-white/40" />
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {(["todos", "ativos", "inativos"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] transition ${
                  statusFilter === value
                    ? "bg-[#f4cf6a] text-[#171006]"
                    : "border border-white/10 text-white/54 hover:border-[#f4cf6a] hover:text-[#f4cf6a]"
                }`}
              >
                {value === "todos"
                  ? "Todos"
                  : value === "ativos"
                  ? "Ativos"
                  : "Inativos"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 max-h-[65vh] overflow-y-auto pr-1">
          {filteredGroups.map((group) => (
            <article key={group.id} className="border border-white/10 bg-white/[0.055] p-4 flex gap-3 justify-between items-start">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] ${
                    group.ativo ? "bg-[#00b67a] text-white" : "bg-white/10 text-white/50"
                  }`}>
                    {group.ativo ? "Ativo" : "Inativo"}
                  </span>
                  <span className="text-[10px] text-white/40">Ordem: {group.ordem}</span>
                </div>
                <h3 className="mt-2 font-serif text-xl font-black truncate">{group.nome}</h3>
                <p className="text-xs font-semibold text-[#f4cf6a] mt-0.5 truncate">
                  {layoutLabels[group.layout]}
                </p>
                <p className="text-[10px] text-white/40 mt-1 truncate">Slug: /{group.slug}</p>
                {group.subtitulo && <p className="text-[10px] text-white/54 mt-1.5 italic line-clamp-1">{group.subtitulo}</p>}
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                {canUpdate && (
                  <button
                    type="button"
                    onClick={() => setEditingId(group.id)}
                    className="text-xs font-black uppercase tracking-[0.14em] text-[#f4cf6a] hover:underline"
                  >
                    Editar
                  </button>
                )}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => handleDelete(group.id)}
                    className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.14em] text-white/50 hover:text-red-400 transition"
                  >
                    <Trash2 size={12} />
                    Excluir
                  </button>
                )}
              </div>
            </article>
          ))}

          {filteredGroups.length === 0 && (
            <div className="border border-white/10 bg-white/[0.055] p-6 text-center text-white/54 text-sm">
              Nenhum grupo encontrado.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
