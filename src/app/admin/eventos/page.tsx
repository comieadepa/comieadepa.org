import { ExternalLink, Save, Ticket, XCircle } from "lucide-react";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { MediaPickerAsset, MediaUrlField } from "../media-url-field";
import { StatusMessage } from "../status-message";

const departmentOptions = ["AGO", "COADESPA", "UMADESPA", "SEIADEPA", "AVULSO"] as const;
const statusOptions = ["programado", "realizado", "encerrado", "cancelado"] as const;

type CmsSetting = {
  chave: string;
  valor: unknown;
};

type EventRow = {
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

type EventTypeRow = {
  id: string;
  evento_id: string;
  nome: string;
  valor: number;
  ativo: boolean;
  ordem: number;
  limite_vagas: number | null;
};

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; message?: string; edit?: string; status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params?.status ?? "todos";
  const statusQuery = statusFilter !== "todos" ? `&status=eq.${encodeURIComponent(statusFilter)}` : "";
  const [events, mediaAssets, settings, types] = await Promise.all([
    selectSupabaseRows<EventRow>(
      "eventos",
      `select=id,nome,slug,descricao,departamento,data_inicio,data_fim,local,cidade,banner_url,valor_inscricao,inscricoes_abertas,publico_alvo,status,usar_tipos_inscricao,created_at${statusQuery}&order=data_inicio.desc&limit=20`,
    ),
    selectSupabaseRows<MediaPickerAsset>("cms_media_assets", "select=id,titulo,arquivo_url,tipo,pasta&order=created_at.desc&limit=30"),
    selectSupabaseRows<CmsSetting>("cms_configuracoes", "select=chave,valor&chave=eq.url_eventos&limit=1"),
    params?.edit
      ? selectSupabaseRows<EventTypeRow>(
          "evento_tipos_inscricao",
          `select=id,evento_id,nome,valor,ativo,ordem,limite_vagas&evento_id=eq.${encodeURIComponent(params.edit)}&order=ordem.asc,nome.asc`,
        )
      : Promise.resolve([]),
  ]);
  const editingEvent = events.find((event) => event.id === params?.edit);
  const eventsPortalUrl = stringifySettingValue(settings[0]?.valor) || "https://eventos.siscomieadepa.org/eventos-publicos";

  return (
    <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1fr_360px]">
      <section className="border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
        <StatusMessage success={params?.success} error={params?.message ?? params?.error} />
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Eventos</p>
        <h2 className="mt-3 font-serif text-4xl font-black">{editingEvent ? "Editar evento" : "Novo evento"}</h2>
        <p className="mt-3 max-w-3xl leading-7 text-[#5a472c]">Gerencie os eventos exibidos no portal e na Home. Os dados saem direto do sistema oficial de eventos.</p>

        {editingEvent ? (
          <div className="mt-5 flex flex-wrap items-center gap-3 border border-[#d8c38b] bg-[#f7efd6] p-4 text-sm font-semibold text-[#5a472c]">
            Editando: <span className="font-black text-[#171006]">{editingEvent.nome}</span>
            <a href="/admin/eventos" className="ml-auto text-[#8b2f2b] underline underline-offset-4">
              Cancelar edição
            </a>
          </div>
        ) : null}

        <form action="/api/admin/eventos" method="post" className="mt-8 grid gap-5">
          <input type="hidden" name="id" value={editingEvent?.id ?? ""} />
          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Nome</span>
            <input name="nome" required defaultValue={editingEvent?.nome} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="Ex.: Congresso UMADESPA 2026" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Slug</span>
            <input name="slug" defaultValue={editingEvent?.slug} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="gerado pelo nome se ficar vazio" />
          </label>
          <div className="grid gap-5 md:grid-cols-3">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Departamento</span>
              <select name="departamento" defaultValue={editingEvent?.departamento ?? ""} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]">
                {departmentOptions.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Status</span>
              <select name="status" defaultValue={editingEvent?.status ?? "programado"} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]">
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {formatStatusLabel(status)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Valor base</span>
              <input name="valor_inscricao" type="number" step="0.01" defaultValue={editingEvent?.valor_inscricao ?? ""} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="0,00" />
            </label>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Data início</span>
              <input name="data_inicio" type="date" required defaultValue={formatDateInput(editingEvent?.data_inicio)} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Data fim</span>
              <input name="data_fim" type="date" required defaultValue={formatDateInput(editingEvent?.data_fim)} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" />
            </label>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Local</span>
              <input name="local" defaultValue={editingEvent?.local ?? ""} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="Ex.: Templo Sede" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Cidade</span>
              <input name="cidade" defaultValue={editingEvent?.cidade ?? ""} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="Ex.: Belém" />
            </label>
          </div>
          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Descrição</span>
            <textarea name="descricao" defaultValue={editingEvent?.descricao ?? ""} className="min-h-28 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="Resumo do evento para o portal." />
          </label>
          <MediaUrlField name="banner_url" label="Banner" defaultValue={editingEvent?.banner_url ?? ""} assets={mediaAssets} helper="Imagem de destaque para o card e topo do portal." />
          <label className="grid gap-2">
            <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">Público-alvo</span>
            <input name="publico_alvo" defaultValue={editingEvent?.publico_alvo ?? ""} className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b]" placeholder="Ex.: Pastores e líderes" />
          </label>

          <label className="flex items-center gap-3 border border-[#d8c38b] bg-[#f7efd6] p-4 font-semibold text-[#342411]">
            <input name="inscricoes_abertas" type="checkbox" defaultChecked={Boolean(editingEvent?.inscricoes_abertas)} className="h-5 w-5 accent-[#8b2f2b]" />
            Inscrições abertas
          </label>
          <label className="flex items-center gap-3 border border-[#d8c38b] bg-[#f7efd6] p-4 font-semibold text-[#342411]">
            <input name="usar_tipos_inscricao" type="checkbox" defaultChecked={editingEvent?.usar_tipos_inscricao} className="h-5 w-5 accent-[#8b2f2b]" />
            Usar tipos de inscrição
          </label>

          <button type="submit" className="inline-flex w-fit items-center gap-3 bg-[#171006] px-6 py-3 text-sm font-black uppercase tracking-[0.14em] text-white">
            <Save size={18} />
            {editingEvent ? "Atualizar evento" : "Salvar evento"}
          </button>
        </form>

        {editingEvent ? (
          <section className="mt-10 border-t border-[#ead9a6] pt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Tipos de inscrição</p>
                <p className="mt-2 text-sm text-[#5a472c]">Configuração detalhada por lote, valor ou faixa.</p>
              </div>
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[#8b2f2b]/70">Evento ID: {editingEvent.id}</span>
            </div>

            <form action="/api/admin/eventos/tipos" method="post" className="mt-6 grid gap-4 rounded border border-[#ead9a6] bg-[#f7efd6] p-4 sm:grid-cols-[1.2fr_0.6fr_0.6fr_auto]">
              <input type="hidden" name="evento_id" value={editingEvent.id} />
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Nome</span>
                <input name="nome" required className="border border-[#d8c38b] bg-white px-3 py-2 outline-none focus:border-[#8b2f2b]" placeholder="Ex.: Inscrição normal" />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Valor</span>
                <input name="valor" type="number" step="0.01" required className="border border-[#d8c38b] bg-white px-3 py-2 outline-none focus:border-[#8b2f2b]" placeholder="0,00" />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Quantidade</span>
                <input name="limite_vagas" type="number" className="border border-[#d8c38b] bg-white px-3 py-2 outline-none focus:border-[#8b2f2b]" placeholder="Opcional" />
              </label>
              <button type="submit" className="mt-6 inline-flex items-center justify-center gap-2 bg-[#171006] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">
                <Ticket size={16} />
                Adicionar
              </button>
            </form>

            <div className="mt-5 grid gap-3">
              {types.map((type) => (
                <form key={type.id} action="/api/admin/eventos/tipos" method="post" className="grid gap-3 border border-[#ead9a6] bg-white p-4 sm:grid-cols-[1.3fr_0.5fr_0.5fr_auto_auto]">
                  <input type="hidden" name="id" value={type.id} />
                  <input type="hidden" name="evento_id" value={editingEvent.id} />
                  <label className="grid gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Nome</span>
                    <input name="nome" defaultValue={type.nome} className="border border-[#d8c38b] bg-white px-3 py-2 outline-none focus:border-[#8b2f2b]" />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Valor</span>
                    <input name="valor" type="number" step="0.01" defaultValue={type.valor} className="border border-[#d8c38b] bg-white px-3 py-2 outline-none focus:border-[#8b2f2b]" />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">Quantidade</span>
                    <input name="limite_vagas" type="number" defaultValue={type.limite_vagas ?? ""} className="border border-[#d8c38b] bg-white px-3 py-2 outline-none focus:border-[#8b2f2b]" />
                  </label>
                  <label className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#5a472c]">
                    <input name="ativo" type="checkbox" defaultChecked={type.ativo} className="h-4 w-4 accent-[#8b2f2b]" />
                    Ativo
                  </label>
                  <div className="mt-5 flex flex-col gap-2">
                    <button type="submit" className="inline-flex items-center justify-center gap-2 border border-[#8b2f2b]/30 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#8b2f2b]">
                      Salvar
                    </button>
                    <button name="action" value="delete" type="submit" className="inline-flex items-center justify-center gap-2 border border-[#d8c38b] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#8b2f2b]/70">
                      <XCircle size={14} />
                      Remover
                    </button>
                  </div>
                </form>
              ))}
            </div>
          </section>
        ) : null}
      </section>

      <aside className="border border-[#d8c38b] bg-[#171006] p-6 text-white shadow-[0_18px_50px_rgba(23,16,6,.14)]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Agenda</p>
            <h2 className="mt-2 font-serif text-4xl font-black">Eventos cadastrados</h2>
          </div>
          <span className="text-sm text-white/52">{events.length} evento(s)</span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {["todos", ...statusOptions].map((status) => (
            <a
              key={status}
              href={status === "todos" ? "/admin/eventos" : `/admin/eventos?status=${status}`}
              className={`px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] transition ${
                statusFilter === status ? "bg-[#f4cf6a] text-[#171006]" : "border border-white/10 text-white/54 hover:border-[#f4cf6a] hover:text-[#f4cf6a]"
              }`}
            >
              {formatStatusLabel(status)}
            </a>
          ))}
        </div>

        <div className="mt-6 grid gap-4">
          {events.map((event) => (
            <article key={event.id} className="border border-white/10 bg-white/[0.055] p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f4cf6a]">{event.departamento}</p>
              <h3 className="mt-2 font-serif text-2xl font-black">{event.nome}</h3>
              <div className="mt-3 grid gap-1 text-xs text-white/60">
                <span>
                  {formatDate(event.data_inicio)} → {formatDate(event.data_fim)}
                </span>
                <span>Status: {formatStatusLabel(event.status ?? "programado")}</span>
                <span>Inscrições: {event.inscricoes_abertas ? "Abertas" : "Fechadas"}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href={`/admin/eventos?edit=${event.id}`} className="inline-flex text-xs font-black uppercase tracking-[0.14em] text-[#f4cf6a]">
                  Editar
                </a>
                <a href={eventsPortalUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/70">
                  <ExternalLink size={14} />
                  Ver no portal
                </a>
                <form action="/api/admin/eventos" method="post">
                  <input type="hidden" name="id" value={event.id} />
                  <input type="hidden" name="action" value={event.status === "cancelado" || event.status === "encerrado" ? "reopen" : "close"} />
                  <button type="submit" className="text-xs font-black uppercase tracking-[0.14em] text-white/60 transition hover:text-[#f4cf6a]">
                    {event.status === "cancelado" || event.status === "encerrado" ? "Reabrir" : "Encerrar"}
                  </button>
                </form>
                {event.status !== "cancelado" ? (
                  <form action="/api/admin/eventos" method="post">
                    <input type="hidden" name="id" value={event.id} />
                    <input type="hidden" name="action" value="cancel" />
                    <button type="submit" className="text-xs font-black uppercase tracking-[0.14em] text-white/40 transition hover:text-[#f4cf6a]">
                      Cancelar
                    </button>
                  </form>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(value));
}

function formatDateInput(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}

function formatStatusLabel(status: string) {
  const labels: Record<string, string> = {
    todos: "Todos",
    programado: "Programado",
    realizado: "Realizado",
    encerrado: "Encerrado",
    cancelado: "Cancelado",
  };

  return labels[status] ?? status;
}

function stringifySettingValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}
