"use client";

import { Save, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  CmsMesaDiretora,
  CmsMesaGrupo,
} from "@/lib/mesa-diretora";
import { MediaPickerAsset, MediaUrlField } from "../media-url-field";

type MesaDiretoraManagerProps = {
  initialMembers: CmsMesaDiretora[];
  groups: CmsMesaGrupo[];
  mediaAssets: MediaPickerAsset[];
  canCreate: boolean;
  canUpdate: boolean;
  canPublish: boolean;
  canDelete: boolean;
};

const statusLabels: Record<string, string> = {
  rascunho: "Rascunho",
  publicado: "Publicado",
};

export function MesaDiretoraManager({
  initialMembers,
  groups,
  mediaAssets,
  canCreate,
  canUpdate,
  canPublish,
  canDelete,
}: MesaDiretoraManagerProps) {
  const members = initialMembers;
  const [editingId, setEditingId] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "rascunho" | "publicado">("todos");
  const [groupFilter, setGroupFilter] = useState<"todos" | string>("todos");
  const [search, setSearch] = useState("");

  const editingMember = members.find((member) => member.id === editingId);
  const canWrite = editingMember ? canUpdate : canCreate;

  const filteredMembers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return members.filter((member) => {
      if (statusFilter !== "todos" && member.status !== statusFilter) {
        return false;
      }

      if (groupFilter !== "todos" && member.grupo_id !== groupFilter) {
        return false;
      }

      if (!term) {
        return true;
      }

      return `${member.nome} ${member.cargo} ${member.campo ?? ""} ${member.bio ?? ""}`
        .toLowerCase()
        .includes(term);
    });
  }, [members, search, statusFilter, groupFilter]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canWrite) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const id = formData.get("id") as string;
    const isEditing = Boolean(id);

    // Convert FormData to JSON
    const payload: Record<string, string | number | boolean | null> = {
      nome: formData.get("nome") as string,
      cargo: formData.get("cargo") as string,
      grupo_id: formData.get("grupo_id") as string,
      campo: (formData.get("campo") as string) || null,
      foto_url: (formData.get("foto_url") as string) || null,
      bio: (formData.get("bio") as string) || null,
      ordem: Number(formData.get("ordem") || 0),
      status: formData.get("status") as string,
      destaque: formData.get("destaque") === "on",
    };

    if (isEditing) {
      payload.id = id;
    }

    try {
      const response = await fetch("/api/admin/mesa-diretora", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message = typeof data?.error === "string" ? data.error : "Erro ao salvar membro.";
        window.location.href = `/admin/mesa-diretora?error=1&message=${encodeURIComponent(message)}`;
        return;
      }

      window.location.href = "/admin/mesa-diretora?success=1";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar membro.";
      window.location.href = `/admin/mesa-diretora?error=1&message=${encodeURIComponent(message)}`;
    }
  }

  async function handleDelete(id: string) {
    if (!canDelete) {
      return;
    }

    const confirmed = window.confirm("Excluir definitivamente este membro da Mesa Diretora?");
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/mesa-diretora?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message = typeof data?.error === "string" ? data.error : "Erro ao excluir membro.";
        window.location.href = `/admin/mesa-diretora?error=1&message=${encodeURIComponent(message)}`;
        return;
      }

      window.location.href = "/admin/mesa-diretora?success=1";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao excluir membro.";
      window.location.href = `/admin/mesa-diretora?error=1&message=${encodeURIComponent(message)}`;
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      {/* Form Section */}
      <section className="border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
        <h2 className="mb-6 font-serif text-2xl font-black text-[#171006]">
          {editingMember ? "Editar Membro" : "Novo Membro"}
        </h2>
        <form onSubmit={handleSubmit} className="grid gap-5">
          {editingMember && <input type="hidden" name="id" value={editingMember.id} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Nome Completo</span>
              <input
                type="text"
                name="nome"
                required
                disabled={!canWrite}
                defaultValue={editingMember?.nome ?? ""}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:opacity-60"
                placeholder="Ex: Pr. Nome Exemplo"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Cargo / Função</span>
              <input
                type="text"
                name="cargo"
                required
                disabled={!canWrite}
                defaultValue={editingMember?.cargo ?? ""}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:opacity-60"
                placeholder="Ex: 1º Vice-Presidente"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Grupo Hierárquico</span>
              <select
                name="grupo_id"
                required
                disabled={!canWrite}
                defaultValue={editingMember?.grupo_id ?? ""}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:opacity-60"
              >
                <option value="">Selecione um grupo...</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.nome}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Campo Eclesiástico / Cidade</span>
              <input
                type="text"
                name="campo"
                disabled={!canWrite}
                defaultValue={editingMember?.campo ?? ""}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:opacity-60"
                placeholder="Ex: Belém - PA"
              />
            </label>
          </div>

          <MediaUrlField
            name="foto_url"
            label="Foto do Membro"
            defaultValue={editingMember?.foto_url ?? ""}
            assets={mediaAssets}
            helper="Foto oficial (formato retrato, fundo neutro) para exibição pública."
            disabled={!canWrite}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Ordem de Exibição</span>
              <input
                type="number"
                name="ordem"
                disabled={!canWrite}
                defaultValue={editingMember?.ordem ?? 0}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:opacity-60"
                placeholder="Ex: 1"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Status de Publicação</span>
              <select
                name="status"
                disabled={!canWrite}
                defaultValue={editingMember?.status ?? "rascunho"}
                className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:opacity-60"
              >
                <option value="rascunho">Rascunho</option>
                <option value="publicado" disabled={!canPublish}>Publicado</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Biografia Resumida (Opcional)</span>
            <textarea
              name="bio"
              disabled={!canWrite}
              defaultValue={editingMember?.bio ?? ""}
              className="min-h-24 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:opacity-60"
              placeholder="Breve biografia ou dados históricos sobre o membro da mesa."
            />
          </label>

          <label className="flex items-center gap-3 cursor-pointer select-none py-1">
            <input
              type="checkbox"
              name="destaque"
              disabled={!canWrite}
              defaultChecked={editingMember?.destaque ?? false}
              className="h-5 w-5 accent-[#8b2f2b]"
            />
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Destacar Membro</span>
          </label>

          <div className="flex flex-col gap-3 sm:flex-row mt-4">
            <button
              type="submit"
              disabled={!canWrite}
              className="inline-flex w-fit items-center gap-3 bg-[#171006] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer hover:bg-[#2c2212] transition"
            >
              <Save size={18} />
              {editingMember ? "Atualizar Membro" : "Salvar Membro"}
            </button>
            {editingMember && (
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
            <h2 className="mt-2 font-serif text-3xl font-black">Listagem de Membros</h2>
          </div>

          <div className="relative mt-2">
            <input
              type="text"
              placeholder="Pesquisar por nome, cargo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-white/10 bg-white/[0.055] py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-[#f4cf6a]"
            />
            <Search size={16} className="absolute left-3.5 top-3.5 text-white/40" />
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {(["todos", "rascunho", "publicado"] as const).map((value) => (
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
                {value === "todos" ? "Todos" : statusLabels[value]}
              </button>
            ))}
          </div>

          <div className="mt-1">
            <label className="grid gap-1">
              <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#f4cf6a]">Filtrar por Grupo</span>
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="w-full border border-white/10 bg-[#120f0a] px-3 py-2 text-xs font-semibold text-white outline-none focus:border-[#f4cf6a]"
              >
                <option value="todos">Todos os Grupos</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-6 grid gap-4 max-h-[60vh] overflow-y-auto pr-1">
          {filteredMembers.map((member) => {
            const memberGroupName = groups.find((g) => g.id === member.grupo_id)?.nome || member.grupo || "Sem grupo";
            return (
              <article key={member.id} className="border border-white/10 bg-white/[0.055] p-4 flex gap-3 justify-between items-start">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] ${
                      member.status === "publicado" ? "bg-[#00b67a] text-white" : "bg-white/10 text-white/50"
                    }`}>
                      {statusLabels[member.status]}
                    </span>
                    {member.destaque && (
                      <span className="bg-[#f4cf6a] text-[#171006] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em]">
                        Destaque
                      </span>
                    )}
                    <span className="text-[10px] text-white/40">Ordem: {member.ordem}</span>
                  </div>
                  <h3 className="mt-2 font-serif text-xl font-black truncate">{member.nome}</h3>
                  <p className="text-xs font-semibold text-[#f4cf6a] mt-0.5 truncate">{member.cargo}</p>
                  <p className="text-[10px] text-white/54 mt-1.5 uppercase tracking-wider">{memberGroupName}</p>
                  {member.campo && <p className="text-[10px] text-white/40 mt-0.5">{member.campo}</p>}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {canUpdate && (
                    <button
                      type="button"
                      onClick={() => setEditingId(member.id)}
                      className="text-xs font-black uppercase tracking-[0.14em] text-[#f4cf6a] hover:underline"
                    >
                      Editar
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(member.id)}
                      className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.14em] text-white/50 hover:text-red-400 transition"
                    >
                      <Trash2 size={12} />
                      Excluir
                    </button>
                  )}
                </div>
              </article>
            );
          })}

          {filteredMembers.length === 0 && (
            <div className="border border-white/10 bg-white/[0.055] p-6 text-center text-white/54 text-sm">
              Nenhum membro encontrado.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
