"use client";

import {
  CheckCircle2,
  Edit3,
  ExternalLink,
  Plus,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CmsMesaDiretora, CmsMesaGrupo } from "@/lib/mesa-diretora";
import {
  FIXED_ROLES_SECTIONS,
  FixedRoleDefinition,
  findOccupantForRole,
} from "@/lib/mesa-diretora-roles";
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

export function MesaDiretoraManager({
  initialMembers,
  groups,
  mediaAssets,
  canCreate,
  canUpdate,
  canPublish,
  canDelete,
}: MesaDiretoraManagerProps) {
  const [members, setMembers] = useState<CmsMesaDiretora[]>(initialMembers);
  const [activeRole, setActiveRole] = useState<FixedRoleDefinition | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Mapeamento dos 27 cargos com seus respectivos ocupantes
  const roleSlots = useMemo(() => {
    return FIXED_ROLES_SECTIONS.map((section) => ({
      ...section,
      roles: section.roles.map((roleDef) => ({
        definition: roleDef,
        occupant: findOccupantForRole(roleDef, members, groups),
      })),
    }));
  }, [members, groups]);

  // Estatísticas de preenchimento
  const totalOccupied = useMemo(() => {
    let count = 0;
    roleSlots.forEach((section) => {
      section.roles.forEach((r) => {
        if (r.occupant) count++;
      });
    });
    return count;
  }, [roleSlots]);

  // Ocupante atualmente em edição (se houver)
  const activeOccupant = useMemo(() => {
    if (!activeRole) return null;
    return findOccupantForRole(activeRole, members, groups);
  }, [activeRole, members, groups]);

  const canSaveActive = activeOccupant ? canUpdate : canCreate;

  // Submissão do formulário simplificado
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeRole || !canSaveActive) return;

    setIsSubmitting(true);
    setFeedback(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const id = formData.get("id") as string;
    const isEditing = Boolean(id);

    // Resolver o grupo_id no banco para este cargo
    const targetGroup = groups.find((g) => g.slug === activeRole.groupSlug);
    const grupoId = targetGroup ? targetGroup.id : null;

    const payload: Record<string, string | number | boolean | null> = {
      nome: (formData.get("nome") as string)?.trim(),
      cargo: activeRole.cargo,
      grupo_id: grupoId,
      grupo: activeRole.groupSlug,
      subgrupo: activeRole.subgrupo ?? null,
      campo: ((formData.get("campo") as string) || "").trim() || null,
      foto_url: ((formData.get("foto_url") as string) || "").trim() || null,
      ordem: activeRole.ordem,
      status: canPublish ? "publicado" : "rascunho",
      destaque: Boolean(activeRole.defaultDestaque),
    };

    if (isEditing) {
      payload.id = id;
    }

    try {
      const response = await fetch("/api/admin/mesa-diretora", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(typeof data?.error === "string" ? data.error : "Falha ao salvar dirigente.");
      }

      const result = await response.json().catch(() => ({}));

      // Atualizar lista localmente para refletir na interface sem reload forçado
      setMembers((prev) => {
        if (isEditing) {
          return prev.map((m) =>
            m.id === id
              ? {
                  ...m,
                  nome: String(payload.nome),
                  campo: payload.campo ? String(payload.campo) : null,
                  foto_url: payload.foto_url ? String(payload.foto_url) : null,
                  status: (payload.status as "rascunho" | "publicado") || "publicado",
                }
              : m
          );
        } else {
          const newMember: CmsMesaDiretora = {
            id: result.id || `temp-${Date.now()}`,
            nome: String(payload.nome),
            cargo: activeRole.cargo,
            grupo_id: grupoId,
            grupo: activeRole.groupSlug,
            subgrupo: activeRole.subgrupo ?? null,
            campo: payload.campo ? String(payload.campo) : null,
            foto_url: payload.foto_url ? String(payload.foto_url) : null,
            bio: null,
            ordem: activeRole.ordem,
            status: "publicado",
            destaque: Boolean(activeRole.defaultDestaque),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: null,
          };
          return [...prev, newMember];
        }
      });

      setFeedback({
        type: "success",
        message: `Dirigente para o cargo de ${activeRole.cargo} salvo com sucesso!`,
      });
      setActiveRole(null);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Erro ao salvar dirigente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Limpar ocupante (excluir ocupante da posição)
  async function handleClearOccupant(occupant: CmsMesaDiretora, cargoNome: string) {
    if (!canDelete) return;

    const confirmed = window.confirm(
      `Remover ${occupant.nome} do cargo de ${cargoNome}?\nO cargo ficará vago e poderá ser preenchido novamente.`
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/mesa-diretora?id=${encodeURIComponent(occupant.id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(typeof data?.error === "string" ? data.error : "Falha ao desvincular ocupante.");
      }

      setMembers((prev) => prev.filter((m) => m.id !== occupant.id));
      if (activeRole && activeOccupant?.id === occupant.id) {
        setActiveRole(null);
      }

      setFeedback({
        type: "success",
        message: `Ocupante removido do cargo de ${cargoNome}. Posição agora está vaga.`,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Erro ao desvincular ocupante.",
      });
    }
  }

  return (
    <div className="space-y-8">
      {/* Barra de Status e Ações Rápidas */}
      <div className="flex flex-col gap-4 border border-[#d8c38b] bg-white/76 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 rounded-full bg-[#00b67a] animate-pulse" />
            <h2 className="font-serif text-2xl font-black text-[#171006]">
              Painel Oficial dos 27 Cargos
            </h2>
          </div>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#5a472c]">
            {totalOccupied} de 27 cargos preenchidos • Reflete automaticamente na página pública
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/mesa-diretora"
            target="_blank"
            className="inline-flex items-center gap-2 border border-[#d8c38b] bg-[#fffaf0] px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-[#171006] hover:bg-[#171006] hover:text-[#f4cf6a] transition"
          >
            <ExternalLink size={14} />
            Ver Página Pública
          </Link>
        </div>
      </div>

      {/* Banner de Feedback em Tempo Real */}
      {feedback && (
        <div
          className={`flex items-center justify-between border p-4 text-sm font-semibold transition ${
            feedback.type === "success"
              ? "border-[#00b67a]/40 bg-[#e8fff4] text-[#075f3f]"
              : "border-[#8b2f2b]/40 bg-[#fff1ed] text-[#8b2f2b]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-bold uppercase tracking-wider underline opacity-75 hover:opacity-100"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Seções dos 27 Cargos */}
      <div className="space-y-10">
        {roleSlots.map((section) => (
          <section
            key={section.id}
            className="border border-[#d8c38b]/60 bg-white p-6 shadow-sm sm:p-7"
          >
            {/* Cabeçalho da Seção */}
            <div className="mb-6 flex flex-col gap-1 border-b border-[#d8c38b]/30 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-serif text-xl font-black uppercase tracking-wider text-[#0F3B63]">
                  {section.title}
                </h3>
                <p className="text-xs font-semibold text-[#6B7280]">{section.subtitle}</p>
              </div>
              <span className="text-xs font-mono font-bold text-[#C9993B]">
                {section.roles.filter((r) => r.occupant).length} / {section.roles.length} definidos
              </span>
            </div>

            {/* Grid dos Cards de Posições */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {section.roles.map(({ definition: role, occupant }) => {
                const isSelectedForEdit = activeRole?.key === role.key;

                return (
                  <div
                    key={role.key}
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-sm border transition-all ${
                      isSelectedForEdit
                        ? "border-[#C9993B] ring-2 ring-[#C9993B]/40 shadow-md bg-[#FFFDF9]"
                        : occupant
                        ? "border-[#0F3B63]/20 bg-white hover:border-[#C9993B]/60 hover:shadow-md"
                        : "border-dashed border-gray-300 bg-gray-50/60 hover:border-[#0F3B63]/40"
                    }`}
                  >
                    {/* Topo do Card: Badge do Cargo */}
                    <div className="bg-[#0F3B63] px-3 py-2 text-center text-[10px] font-black uppercase tracking-[0.14em] text-[#F8D77B]">
                      {role.cargo}
                    </div>

                    {/* Centro: Foto ou Placeholder */}
                    <div className="p-4 flex flex-col items-center text-center">
                      <div className="relative mb-3 h-28 w-24 overflow-hidden rounded-sm border border-gray-200 bg-gray-100 shadow-inner">
                        {occupant?.foto_url ? (
                          <Image
                            src={occupant.foto_url}
                            alt={occupant.nome}
                            fill
                            className="object-cover object-top"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
                            <Users size={32} strokeWidth={1.2} />
                            <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                              Vago
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Informações do Ocupante */}
                      {occupant ? (
                        <>
                          <h4 className="font-serif text-sm font-black leading-snug text-[#0F3B63] line-clamp-2">
                            {occupant.nome}
                          </h4>
                          {occupant.campo ? (
                            <p className="mt-1 text-[11px] font-semibold text-gray-500 truncate w-full">
                              {occupant.campo}
                            </p>
                          ) : (
                            <p className="mt-1 text-[10px] italic text-gray-400">Campo não informado</p>
                          )}
                          <span className="mt-2 inline-flex items-center gap-1 rounded bg-[#00b67a]/10 px-2 py-0.5 text-[9px] font-bold text-[#00b67a] uppercase tracking-wider">
                            <UserCheck size={11} />
                            Publicado
                          </span>
                        </>
                      ) : (
                        <div className="py-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                            Cargo Disponível
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Clique abaixo para atribuir</p>
                        </div>
                      )}
                    </div>

                    {/* Ações no Rodapé do Card */}
                    <div className="border-t border-gray-100 bg-gray-50/70 p-2.5 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveRole(role)}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-black uppercase tracking-[0.12em] transition ${
                          occupant
                            ? "bg-[#171006] text-[#F8D77B] hover:bg-[#2c2212]"
                            : "bg-[#0F3B63] text-white hover:bg-[#1A5A96]"
                        }`}
                      >
                        {occupant ? <Edit3 size={12} /> : <UserPlus size={12} />}
                        {occupant ? "Alterar" : "Atribuir"}
                      </button>

                      {occupant && canDelete && (
                        <button
                          type="button"
                          onClick={() => handleClearOccupant(occupant, role.cargo)}
                          className="h-8 w-8 inline-grid place-items-center text-gray-400 hover:text-red-600 transition"
                          title="Desocupar posição"
                          aria-label="Desocupar posição"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Modal / Gaveta Lateral de Cadastro Simplificado */}
      {activeRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl border border-[#d8c38b] bg-white p-6 shadow-2xl sm:p-8 max-h-[92vh] overflow-y-auto">
            {/* Cabeçalho do Formulário */}
            <div className="flex items-start justify-between border-b border-[#d8c38b]/40 pb-4">
              <div>
                <span className="inline-block rounded bg-[#FDF6E3] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#C9993B] border border-[#C9993B]/30">
                  {activeRole.cargo}
                </span>
                <h3 className="mt-2 font-serif text-2xl font-black text-[#171006]">
                  {activeOccupant ? "Atualizar Ministro" : "Cadastrar Ministro"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Preencha o nome e selecione a fotografia oficial. Cargo e ordenação são fixos.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveRole(null)}
                className="grid h-8 w-8 place-items-center text-gray-400 hover:text-[#171006] transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulário Simplificado */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {activeOccupant && <input type="hidden" name="id" value={activeOccupant.id} />}

              {/* Nome do Ministro */}
              <label className="grid gap-2">
                <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">
                  Nome do Ministro *
                </span>
                <input
                  type="text"
                  name="nome"
                  required
                  defaultValue={activeOccupant?.nome ?? ""}
                  placeholder="Ex: Pr. Nome Completo"
                  className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 text-base font-semibold text-[#171006] outline-none focus:border-[#8b2f2b]"
                  autoFocus
                />
              </label>

              {/* Campo Eclesiástico / Cidade */}
              <label className="grid gap-2">
                <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">
                  Campo Eclesiástico / Cidade
                </span>
                <input
                  type="text"
                  name="campo"
                  defaultValue={activeOccupant?.campo ?? ""}
                  placeholder="Ex: Belém - PA"
                  className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 text-sm font-semibold text-[#171006] outline-none focus:border-[#8b2f2b]"
                />
              </label>

              {/* Fotografia Oficial com Biblioteca de Mídia */}
              <MediaUrlField
                name="foto_url"
                label="Fotografia Oficial"
                defaultValue={activeOccupant?.foto_url ?? ""}
                assets={mediaAssets}
                helper="Formato retrato (proporção 3:4 com fundo neutro). Selecione da Biblioteca de Mídia ou envie diretamente."
              />

              {/* Informações Técnicas Fixas (Somente leitura para transparência) */}
              <div className="rounded border border-gray-200 bg-gray-50 p-3.5 text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Seção Hierárquica:</span>
                  <span className="font-bold text-[#0F3B63]">{activeRole.groupSlug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Posição / Ordem:</span>
                  <span className="font-bold text-[#0F3B63]">{activeRole.ordem}º</span>
                </div>
                {activeRole.subgrupo && (
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">Subgrupo:</span>
                    <span className="font-bold uppercase text-[#C9993B]">{activeRole.subgrupo}</span>
                  </div>
                )}
              </div>

              {/* Ações do Modal */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveRole(null)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-gray-600 hover:text-black transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !canSaveActive}
                  className="inline-flex items-center gap-2 bg-[#171006] px-6 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#f4cf6a] hover:bg-[#2c2212] transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Gravando..." : activeOccupant ? "Atualizar Ministro" : "Salvar no Cargo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
