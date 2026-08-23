"use client";

import {
  Calendar,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MapPin,
  Plus,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Ticket,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { AdminEmptyState, AdminFilterPills, AdminStatusBadge } from "../admin-ui";
import { MediaPickerAsset, MediaUrlField } from "../media-url-field";

export type EventRow = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  departamento: string;
  data_inicio: string;
  data_fim: string;
  local: string | null;
  cidade: string | null;
  banner_url: string | null;
  valor_inscricao: number | null;
  inscricoes_abertas: boolean | null;
  publico_alvo: string | null;
  status: string | null;
  usar_tipos_inscricao: boolean;
  created_at: string | null;
};

export type EventTypeRow = {
  id: string;
  evento_id: string;
  nome: string;
  valor: number;
  ativo: boolean;
  ordem: number;
  limite_vagas: number | null;
};

type EventsManagerProps = {
  initialEvents: EventRow[];
  initialTypesMap: Record<string, EventTypeRow[]>;
  mediaAssets: MediaPickerAsset[];
  eventsPortalUrl: string;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

const DEPARTMENT_OPTIONS = ["AGO", "COADESPA", "UMADESPA", "SEIADEPA", "AVULSO"] as const;
const STATUS_OPTIONS = ["programado", "realizado", "encerrado", "cancelado"] as const;

function generateSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatDateInput(value: string | null | undefined): string {
  if (!value) return "";
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export function EventsManager({
  initialEvents,
  initialTypesMap,
  mediaAssets,
  eventsPortalUrl,
  canCreate,
  canUpdate,
  canDelete,
}: EventsManagerProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [events, setEvents] = useState<EventRow[]>(initialEvents);
  const [typesMap, setTypesMap] = useState<Record<string, EventTypeRow[]>>(initialTypesMap);
  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [departmentFilter, setDepartmentFilter] = useState("todos");

  // Main Event Form States
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [descricao, setDescricao] = useState("");
  const [departamento, setDepartamento] = useState<string>("AGO");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [local, setLocal] = useState("");
  const [cidade, setCidade] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [valorInscricao, setValorInscricao] = useState<string>("");
  const [inscricoesAbertas, setInscricoesAbertas] = useState(true);
  const [publicoAlvo, setPublicoAlvo] = useState("");
  const [status, setStatus] = useState<string>("programado");
  const [usarTiposInscricao, setUsarTiposInscricao] = useState(false);

  // New Type Form States
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeValor, setNewTypeValor] = useState("");
  const [newTypeVagas, setNewTypeVagas] = useState("");
  const [isAddingType, setIsAddingType] = useState(false);

  // Async States
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const editingEvent = events.find((e) => e.id === editingId);
  const canWrite = editingEvent ? canUpdate : canCreate;
  const currentEventTypes = editingId ? typesMap[editingId] || [] : [];

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return events.filter((event) => {
      if (statusFilter !== "todos" && (event.status || "programado") !== statusFilter) {
        return false;
      }
      if (departmentFilter !== "todos" && event.departamento !== departmentFilter) {
        return false;
      }
      if (!term) return true;
      return (
        event.nome.toLowerCase().includes(term) ||
        (event.local || "").toLowerCase().includes(term) ||
        (event.cidade || "").toLowerCase().includes(term) ||
        event.departamento.toLowerCase().includes(term) ||
        event.slug.toLowerCase().includes(term)
      );
    });
  }, [departmentFilter, events, search, statusFilter]);

  function handleStartEdit(event: EventRow) {
    setEditingId(event.id);
    setNome(event.nome);
    setSlug(event.slug || generateSlug(event.nome));
    setDescricao(event.descricao || "");
    setDepartamento(event.departamento || "AGO");
    setDataInicio(formatDateInput(event.data_inicio));
    setDataFim(formatDateInput(event.data_fim));
    setLocal(event.local || "");
    setCidade(event.cidade || "");
    setBannerUrl(event.banner_url || "");
    setValorInscricao(event.valor_inscricao != null ? String(event.valor_inscricao) : "");
    setInscricoesAbertas(Boolean(event.inscricoes_abertas));
    setPublicoAlvo(event.publico_alvo || "");
    setStatus(event.status || "programado");
    setUsarTiposInscricao(Boolean(event.usar_tipos_inscricao));
    setFeedback(null);
  }

  function handleNewEvent() {
    setEditingId("");
    setNome("");
    setSlug("");
    setDescricao("");
    setDepartamento("AGO");
    setDataInicio("");
    setDataFim("");
    setLocal("");
    setCidade("");
    setBannerUrl("");
    setValorInscricao("");
    setInscricoesAbertas(true);
    setPublicoAlvo("");
    setStatus("programado");
    setUsarTiposInscricao(false);
    setFeedback(null);
  }

  function handleGenerateSlug() {
    if (!nome.trim()) {
      setFeedback({ type: "error", message: "Informe o nome do evento antes de gerar o slug." });
      return;
    }
    setSlug(generateSlug(nome));
  }

  async function handleSaveEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!canWrite || isSaving) return;

    if (!nome.trim() || !departamento || !dataInicio) {
      setFeedback({ type: "error", message: "Preencha o nome, departamento e data de início do evento." });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    const generatedFinalSlug = slug.trim() || generateSlug(nome);

    const formData = new FormData();
    formData.set("id", editingId);
    formData.set("nome", nome);
    formData.set("slug", generatedFinalSlug);
    formData.set("descricao", descricao);
    formData.set("departamento", departamento);
    formData.set("data_inicio", dataInicio);
    formData.set("data_fim", dataFim || dataInicio);
    formData.set("local", local);
    formData.set("cidade", cidade);
    formData.set("banner_url", bannerUrl);
    formData.set("valor_inscricao", valorInscricao);
    if (inscricoesAbertas) formData.set("inscricoes_abertas", "on");
    formData.set("publico_alvo", publicoAlvo);
    formData.set("status", status);
    if (usarTiposInscricao) formData.set("usar_tipos_inscricao", "on");

    const isEditing = Boolean(editingId);

    try {
      const response = await fetch("/api/admin/eventos", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "x-requested-with": "fetch",
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.error) {
        throw new Error(data.error || "Erro ao salvar evento.");
      }

      const savedId = editingId || data.id;

      const updatedEvent: EventRow = {
        id: savedId,
        nome,
        slug: generatedFinalSlug,
        descricao: descricao || null,
        departamento,
        data_inicio: dataInicio,
        data_fim: dataFim || dataInicio,
        local: local || null,
        cidade: cidade || null,
        banner_url: bannerUrl || null,
        valor_inscricao: valorInscricao ? Number(valorInscricao) : null,
        inscricoes_abertas: inscricoesAbertas,
        publico_alvo: publicoAlvo || null,
        status,
        usar_tipos_inscricao: usarTiposInscricao,
        created_at: editingEvent?.created_at || new Date().toISOString(),
      };

      if (isEditing) {
        setEvents((prev) => prev.map((item) => (item.id === savedId ? updatedEvent : item)));
      } else {
        setEvents((prev) => [updatedEvent, ...prev]);
        setEditingId(savedId);
      }

      setFeedback({
        type: "success",
        message: isEditing ? "Evento atualizado com sucesso!" : "Evento cadastrado com sucesso!",
      });

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao salvar evento.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleQuickStatus(event: EventRow, action: "reopen" | "close" | "cancel") {
    if (!canUpdate) return;

    const formData = new FormData();
    formData.set("id", event.id);
    formData.set("action", action);

    try {
      const response = await fetch("/api/admin/eventos", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "x-requested-with": "fetch",
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.error) {
        throw new Error(data.error || "Erro ao alterar status do evento.");
      }

      const nextStatus = data.status || (action === "reopen" ? "programado" : action === "close" ? "encerrado" : "cancelado");

      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, status: nextStatus, inscricoes_abertas: action === "reopen" ? e.inscricoes_abertas : false } : e)),
      );

      setFeedback({
        type: "success",
        message: `Status do evento "${event.nome}" alterado para ${nextStatus}.`,
      });

      startTransition(() => router.refresh());
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao atualizar status do evento.",
      });
    }
  }

  async function handleDeleteEvent(id: string) {
    if (!canDelete) return;

    const confirmed = window.confirm("Excluir definitivamente este evento e todos os seus lotes de inscrição?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/eventos?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Erro ao excluir evento.");
      }

      setEvents((prev) => prev.filter((e) => e.id !== id));
      if (editingId === id) {
        handleNewEvent();
      }
      setFeedback({ type: "success", message: "Evento excluído com sucesso." });
      startTransition(() => router.refresh());
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao excluir evento.",
      });
    }
  }

  // Registration Type actions
  async function handleAddType(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !canUpdate || isAddingType) return;

    if (!newTypeName.trim()) {
      setFeedback({ type: "error", message: "Informe o nome do lote/tipo de inscrição." });
      return;
    }

    setIsAddingType(true);
    const formData = new FormData();
    formData.set("evento_id", editingId);
    formData.set("nome", newTypeName);
    formData.set("valor", newTypeValor || "0");
    if (newTypeVagas) formData.set("limite_vagas", newTypeVagas);
    formData.set("ativo", "on");
    formData.set("ordem", String(currentEventTypes.length + 1));

    try {
      const response = await fetch("/api/admin/eventos/tipos", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "x-requested-with": "fetch",
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.error) {
        throw new Error(data.error || "Erro ao adicionar tipo de inscrição.");
      }

      const createdType: EventTypeRow = data.tipo || {
        id: data.id || crypto.randomUUID(),
        evento_id: editingId,
        nome: newTypeName,
        valor: Number(newTypeValor) || 0,
        limite_vagas: newTypeVagas ? Number(newTypeVagas) : null,
        ativo: true,
        ordem: currentEventTypes.length + 1,
      };

      setTypesMap((prev) => ({
        ...prev,
        [editingId]: [...(prev[editingId] || []), createdType],
      }));

      setNewTypeName("");
      setNewTypeValor("");
      setNewTypeVagas("");
      setFeedback({ type: "success", message: "Tipo de inscrição adicionado com sucesso!" });
      startTransition(() => router.refresh());
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao adicionar tipo de inscrição.",
      });
    } finally {
      setIsAddingType(false);
    }
  }

  async function handleUpdateType(typeItem: EventTypeRow, formElement: HTMLFormElement) {
    if (!editingId || !canUpdate) return;

    const formData = new FormData(formElement);
    formData.set("id", typeItem.id);
    formData.set("evento_id", editingId);

    try {
      const response = await fetch("/api/admin/eventos/tipos", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "x-requested-with": "fetch",
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.error) {
        throw new Error(data.error || "Erro ao atualizar tipo de inscrição.");
      }

      const updatedName = String(formData.get("nome"));
      const updatedValor = Number(formData.get("valor")) || 0;
      const updatedVagas = formData.get("limite_vagas") ? Number(formData.get("limite_vagas")) : null;
      const updatedAtivo = formData.get("ativo") === "on";

      setTypesMap((prev) => ({
        ...prev,
        [editingId]: (prev[editingId] || []).map((t) =>
          t.id === typeItem.id
            ? { ...t, nome: updatedName, valor: updatedValor, limite_vagas: updatedVagas, ativo: updatedAtivo }
            : t,
        ),
      }));

      setFeedback({ type: "success", message: `Tipo "${updatedName}" atualizado com sucesso!` });
      startTransition(() => router.refresh());
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao atualizar tipo de inscrição.",
      });
    }
  }

  async function handleDeleteType(typeId: string) {
    if (!editingId || !canDelete) return;

    const confirmed = window.confirm("Excluir este tipo de inscrição?");
    if (!confirmed) return;

    const formData = new FormData();
    formData.set("id", typeId);
    formData.set("evento_id", editingId);
    formData.set("action", "delete");

    try {
      const response = await fetch("/api/admin/eventos/tipos", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "x-requested-with": "fetch",
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.error) {
        throw new Error(data.error || "Erro ao remover tipo de inscrição.");
      }

      setTypesMap((prev) => ({
        ...prev,
        [editingId]: (prev[editingId] || []).filter((t) => t.id !== typeId),
      }));

      setFeedback({ type: "success", message: "Tipo de inscrição removido." });
      startTransition(() => router.refresh());
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao remover tipo de inscrição.",
      });
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      {/* Form Section */}
      <section className="h-fit border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
        <div className="flex flex-col gap-3 border-b border-[#d8c38b]/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">
                {editingEvent ? "Edição de Evento" : "Novo Evento"}
              </p>
              {editingEvent ? <AdminStatusBadge status={editingEvent.status || "programado"} /> : null}
            </div>
            <h2 className="mt-1 font-serif text-2xl font-black text-[#171006]">
              {editingEvent ? `Editar: ${editingEvent.nome}` : "Cadastrar Novo Evento"}
            </h2>
          </div>

          {editingEvent ? (
            <button
              type="button"
              onClick={handleNewEvent}
              className="inline-flex items-center gap-1 bg-[#171006] px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#f4cf6a] transition hover:bg-[#2c2212]"
            >
              <Plus size={13} />
              Novo
            </button>
          ) : null}
        </div>

        {/* Feedback Banner */}
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

        {/* Main Event Form */}
        <form onSubmit={handleSaveEvent} className="mt-5 grid gap-4">
          <input type="hidden" name="id" value={editingId} />

          {/* Nome */}
          <label className="grid gap-1.5">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Nome do Evento</span>
            <input
              name="nome"
              required
              disabled={!canWrite}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Ex.: 125ª Assembleia Geral Ordinária (AGO 2026)"
            />
          </label>

          {/* Slug */}
          <label className="grid gap-1.5">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Slug (URL Amigável)</span>
            <div className="flex gap-2">
              <input
                name="slug"
                disabled={!canWrite}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 border border-[#d8c38b] bg-[#fffaf0] px-3 py-2 font-mono text-xs outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="ago-2026-comieadepa"
              />
              <button
                type="button"
                onClick={handleGenerateSlug}
                disabled={!canWrite}
                className="inline-flex items-center gap-1 border border-[#8b2f2b]/40 bg-[#f7efd6] px-3 py-2 text-xs font-bold text-[#8b2f2b] transition hover:bg-[#8b2f2b] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles size={13} />
                Gerar do título
              </button>
            </div>
          </label>

          {/* Departamento, Status, Valor Base */}
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Departamento</span>
              <select
                name="departamento"
                disabled={!canWrite}
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                className="border border-[#d8c38b] bg-[#fffaf0] px-3 py-2 text-xs font-semibold outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {DEPARTMENT_OPTIONS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Status</span>
              <select
                name="status"
                disabled={!canWrite}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-[#d8c38b] bg-[#fffaf0] px-3 py-2 text-xs font-semibold outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Valor Base (R$)</span>
              <input
                name="valor_inscricao"
                type="number"
                step="0.01"
                disabled={!canWrite}
                value={valorInscricao}
                onChange={(e) => setValorInscricao(e.target.value)}
                className="border border-[#d8c38b] bg-[#fffaf0] px-3 py-2 text-xs outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="0.00"
              />
            </label>
          </div>

          {/* Datas Início e Fim */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Data de Início</span>
              <input
                name="data_inicio"
                type="date"
                required
                disabled={!canWrite}
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="border border-[#d8c38b] bg-[#fffaf0] px-3 py-2 text-xs outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Data de Término</span>
              <input
                name="data_fim"
                type="date"
                disabled={!canWrite}
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="border border-[#d8c38b] bg-[#fffaf0] px-3 py-2 text-xs outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>
          </div>

          {/* Local e Cidade */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Local</span>
              <input
                name="local"
                disabled={!canWrite}
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                className="border border-[#d8c38b] bg-[#fffaf0] px-3 py-2 text-xs outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Ex.: Centro de Convenções Centenário"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Cidade</span>
              <input
                name="cidade"
                disabled={!canWrite}
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="border border-[#d8c38b] bg-[#fffaf0] px-3 py-2 text-xs outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Ex.: Belém / PA"
              />
            </label>
          </div>

          {/* Descrição */}
          <label className="grid gap-1.5">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Descrição / Resumo</span>
            <textarea
              name="descricao"
              disabled={!canWrite}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="min-h-20 border border-[#d8c38b] bg-[#fffaf0] px-3 py-2 text-xs leading-relaxed outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Resumo oficial do evento para o portal da COMIEADEPA."
            />
          </label>

          {/* Banner MediaUrlField */}
          <MediaUrlField
            name="banner_url"
            label="Banner / Imagem de Destaque"
            defaultValue={bannerUrl}
            assets={mediaAssets}
            helper="Imagem de destaque utilizada no card da Home e no topo da página de eventos."
            disabled={!canWrite}
          />

          {/* Público-alvo */}
          <label className="grid gap-1.5">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Público-alvo</span>
            <input
              name="publico_alvo"
              disabled={!canWrite}
              value={publicoAlvo}
              onChange={(e) => setPublicoAlvo(e.target.value)}
              className="border border-[#d8c38b] bg-[#fffaf0] px-3 py-2 text-xs outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Ex.: Pastores, Evangelistas, Líderes e Membros"
            />
          </label>

          {/* Checkboxes */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 border border-[#d8c38b] bg-[#f7efd6] p-3 text-xs font-semibold text-[#342411]">
              <input
                name="inscricoes_abertas"
                type="checkbox"
                checked={inscricoesAbertas}
                onChange={(e) => setInscricoesAbertas(e.target.checked)}
                disabled={!canWrite}
                className="h-4 w-4 accent-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              />
              Inscrições abertas no portal
            </label>

            <label className="flex items-center gap-3 border border-[#d8c38b] bg-[#f7efd6] p-3 text-xs font-semibold text-[#342411]">
              <input
                name="usar_tipos_inscricao"
                type="checkbox"
                checked={usarTiposInscricao}
                onChange={(e) => setUsarTiposInscricao(e.target.checked)}
                disabled={!canWrite}
                className="h-4 w-4 accent-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
              />
              Habilitar múltiplos lotes/tipos
            </label>
          </div>

          {/* Submit Action */}
          <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-[#d8c38b]/30 pt-4">
            <button
              type="submit"
              disabled={!canWrite || isSaving}
              className="inline-flex items-center gap-2 bg-[#171006] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#2c2212] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? <Loader2 size={15} className="animate-spin text-[#f4cf6a]" /> : <Save size={15} />}
              {editingEvent ? "Atualizar Evento" : "Salvar Evento"}
            </button>

            {editingEvent ? (
              <button
                type="button"
                onClick={handleNewEvent}
                className="text-xs font-bold text-[#8b2f2b] underline underline-offset-4 hover:opacity-80"
              >
                Cancelar edição
              </button>
            ) : null}
          </div>
        </form>

        {/* Sub-resource: Registration Types Section */}
        {editingId ? (
          <section className="mt-8 border-t border-[#ead9a6] pt-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Ticket size={18} className="text-[#8b2f2b]" />
                  <h3 className="font-serif text-lg font-bold text-[#171006]">Lotes e Tipos de Inscrição</h3>
                </div>
                <p className="text-xs text-[#5a472c]">
                  Cadastre opções de inscrição (ex.: Geral, Casal, Crianças) com valores diferenciados.
                </p>
              </div>
              <span className="font-mono text-[10px] text-[#8b2f2b]/70">Evento: {editingId.slice(0, 8)}...</span>
            </div>

            {/* Add Type Form */}
            {canUpdate ? (
              <form
                onSubmit={handleAddType}
                className="mt-4 grid gap-3 rounded border border-[#ead9a6] bg-[#f7efd6] p-3 sm:grid-cols-[1.2fr_0.6fr_0.6fr_auto]"
              >
                <label className="grid gap-1">
                  <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#5a472c]">Nome da Categoria</span>
                  <input
                    required
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    className="border border-[#d8c38b] bg-white px-3 py-1.5 text-xs outline-none focus:border-[#8b2f2b]"
                    placeholder="Ex.: Inscrição Normal"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#5a472c]">Valor (R$)</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newTypeValor}
                    onChange={(e) => setNewTypeValor(e.target.value)}
                    className="border border-[#d8c38b] bg-white px-3 py-1.5 text-xs outline-none focus:border-[#8b2f2b]"
                    placeholder="0.00"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#5a472c]">Vagas</span>
                  <input
                    type="number"
                    value={newTypeVagas}
                    onChange={(e) => setNewTypeVagas(e.target.value)}
                    className="border border-[#d8c38b] bg-white px-3 py-1.5 text-xs outline-none focus:border-[#8b2f2b]"
                    placeholder="Ilimitado"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isAddingType}
                  className="mt-auto inline-flex items-center justify-center gap-1.5 bg-[#171006] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#2c2212] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isAddingType ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  Adicionar
                </button>
              </form>
            ) : null}

            {/* List of existing types */}
            <div className="mt-4 grid gap-2.5">
              {currentEventTypes.map((typeItem) => (
                <form
                  key={typeItem.id}
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateType(typeItem, e.currentTarget);
                  }}
                  className="grid gap-2.5 border border-[#ead9a6] bg-white p-3 sm:grid-cols-[1.2fr_0.5fr_0.5fr_auto_auto]"
                >
                  <label className="grid gap-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#5a472c]">Nome</span>
                    <input
                      name="nome"
                      defaultValue={typeItem.nome}
                      disabled={!canUpdate}
                      className="border border-[#d8c38b] bg-white px-2.5 py-1 text-xs outline-none focus:border-[#8b2f2b]"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#5a472c]">Valor (R$)</span>
                    <input
                      name="valor"
                      type="number"
                      step="0.01"
                      defaultValue={typeItem.valor}
                      disabled={!canUpdate}
                      className="border border-[#d8c38b] bg-white px-2.5 py-1 text-xs outline-none focus:border-[#8b2f2b]"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#5a472c]">Vagas</span>
                    <input
                      name="limite_vagas"
                      type="number"
                      defaultValue={typeItem.limite_vagas ?? ""}
                      disabled={!canUpdate}
                      className="border border-[#d8c38b] bg-white px-2.5 py-1 text-xs outline-none focus:border-[#8b2f2b]"
                      placeholder="Ilimitado"
                    />
                  </label>

                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#5a472c] sm:self-end sm:pb-2">
                    <input
                      name="ativo"
                      type="checkbox"
                      defaultChecked={typeItem.ativo}
                      disabled={!canUpdate}
                      className="h-3.5 w-3.5 accent-[#8b2f2b]"
                    />
                    Ativo
                  </label>

                  <div className="flex items-center gap-2 sm:self-end">
                    {canUpdate ? (
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 border border-[#8b2f2b]/40 bg-[#f7efd6] px-2.5 py-1.5 text-xs font-bold text-[#8b2f2b] transition hover:bg-[#8b2f2b] hover:text-white"
                      >
                        <Save size={12} />
                        Salvar
                      </button>
                    ) : null}

                    {canDelete ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteType(typeItem.id)}
                        className="inline-flex items-center gap-1 border border-red-200 px-2 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                        title="Excluir tipo de inscrição"
                      >
                        <Trash2 size={12} />
                      </button>
                    ) : null}
                  </div>
                </form>
              ))}

              {currentEventTypes.length === 0 ? (
                <p className="border border-dashed border-[#d8c38b] bg-[#fffaf0] p-3 text-center text-xs text-[#5a472c]">
                  Nenhum tipo de inscrição cadastrado para este evento.
                </p>
              ) : null}
            </div>
          </section>
        ) : null}
      </section>

      {/* Events List Section */}
      <section className="h-fit border border-[#d8c38b] bg-[#171006] p-6 text-white shadow-[0_18px_50px_rgba(23,16,6,.14)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-[#f4cf6a]" />
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Agenda do Portal</p>
            </div>
            <p className="mt-1 text-xs text-white/50">{filteredEvents.length} evento(s) encontrado(s)</p>
          </div>

          {/* Filter Pills */}
          <AdminFilterPills
            current={statusFilter}
            onSelect={(val) => setStatusFilter(val)}
            options={[
              { value: "todos", label: "Todos" },
              { value: "programado", label: "Programados" },
              { value: "realizado", label: "Realizados" },
              { value: "encerrado", label: "Encerrados" },
              { value: "cancelado", label: "Cancelados" },
            ]}
          />
        </div>

        {/* Search and Department Filter Bar */}
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px]">
          <div className="flex items-center gap-2 border border-white/15 bg-white/10 px-3 py-2 text-xs">
            <Search size={15} className="text-[#f4cf6a]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-white placeholder:text-white/40 outline-none"
              placeholder="Buscar por nome, cidade ou local..."
            />
            {search ? (
              <button type="button" onClick={() => setSearch("")} className="text-white/50 hover:text-white">
                <X size={13} />
              </button>
            ) : null}
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="border border-white/15 bg-white/10 px-3 py-2 text-xs text-white outline-none"
          >
            <option value="todos" className="bg-[#171006] text-white">
              Todos os departamentos
            </option>
            {DEPARTMENT_OPTIONS.map((dept) => (
              <option key={dept} value={dept} className="bg-[#171006] text-white">
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Events Cards */}
        <div className="mt-6 grid gap-4">
          {filteredEvents.map((event) => {
            const isCurrent = editingId === event.id;

            return (
              <article
                key={event.id}
                className={`flex flex-col gap-3.5 border p-4 transition ${
                  isCurrent
                    ? "border-[#f4cf6a] bg-white/15 shadow-md"
                    : "border-white/10 bg-white/[0.055] hover:border-white/25"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#f4cf6a] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-[#171006]">
                      {event.departamento}
                    </span>
                    <AdminStatusBadge status={event.status || "programado"} />
                  </div>

                  <span className="text-[11px] font-semibold text-[#f4cf6a]">
                    {formatDate(event.data_inicio)} {event.data_fim && event.data_fim !== event.data_inicio ? `→ ${formatDate(event.data_fim)}` : ""}
                  </span>
                </div>

                <div className="flex gap-3">
                  {event.banner_url ? (
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden border border-white/10 bg-black">
                      <Image src={event.banner_url} alt={event.nome} fill className="object-cover" unoptimized />
                    </div>
                  ) : null}

                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-base font-bold text-white line-clamp-1">{event.nome}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/60">
                      {event.cidade || event.local ? (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-[#f4cf6a]" />
                          {[event.local, event.cidade].filter(Boolean).join(", ")}
                        </span>
                      ) : null}
                      <span>
                        Inscrições:{" "}
                        <strong className={event.inscricoes_abertas ? "text-emerald-400" : "text-amber-300"}>
                          {event.inscricoes_abertas ? "Abertas" : "Fechadas"}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-3">
                  {canUpdate ? (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(event)}
                      className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-[#f4cf6a] hover:underline"
                    >
                      Editar
                    </button>
                  ) : null}

                  <a
                    href={eventsPortalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.14em] text-white/70 transition hover:text-white"
                  >
                    <ExternalLink size={12} />
                    Ver no Portal
                  </a>

                  {canUpdate && (event.status === "cancelado" || event.status === "encerrado") ? (
                    <button
                      type="button"
                      onClick={() => handleQuickStatus(event, "reopen")}
                      className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.14em] text-white/60 hover:text-[#f4cf6a]"
                    >
                      <RotateCcw size={12} />
                      Reabrir
                    </button>
                  ) : null}

                  {canUpdate && event.status === "programado" ? (
                    <button
                      type="button"
                      onClick={() => handleQuickStatus(event, "close")}
                      className="text-xs font-black uppercase tracking-[0.14em] text-white/60 hover:text-[#f4cf6a]"
                    >
                      Encerrar
                    </button>
                  ) : null}

                  {canUpdate && event.status !== "cancelado" ? (
                    <button
                      type="button"
                      onClick={() => handleQuickStatus(event, "cancel")}
                      className="text-xs font-black uppercase tracking-[0.14em] text-white/40 hover:text-red-400"
                    >
                      Cancelar
                    </button>
                  ) : null}

                  {canDelete ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="ml-auto inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.14em] text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={12} />
                      Excluir
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}

          {filteredEvents.length === 0 ? (
            <AdminEmptyState
              title="Nenhum evento encontrado"
              description="Ajuste os filtros de status ou o termo de busca para localizar outros eventos."
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
