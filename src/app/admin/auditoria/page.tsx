import { Activity, Clock3, Database, ListChecks, UserRound } from "lucide-react";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { AdminPageHeader } from "../admin-ui";

type AuditLog = {
  id: string;
  actor: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  entity_title: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export default async function AdminAuditPage() {
  const logs = await selectSupabaseRows<AuditLog>(
    "cms_audit_logs",
    "select=id,actor,action,entity,entity_id,entity_title,metadata,created_at&order=created_at.desc&limit=80",
  );

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        icon={ListChecks}
        eyebrow="Trilha de Auditoria"
        title="Histórico Operacional do Painel"
        description="Acompanhe todas as ações realizadas pelos operadores: criação, edição, publicação, ativação, arquivamento e uploads de mídia."
      />

      <section className="grid gap-6 lg:grid-cols-[0.78fr_1fr]">
        <div className="border border-[#d8c38b] bg-[#171006] p-6 text-white shadow-[0_18px_50px_rgba(23,16,6,.14)]">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Critérios de Registro</p>
          <h2 className="mt-2 font-serif text-3xl font-black leading-tight">Segurança e Rastreabilidade</h2>
          <p className="mt-4 leading-7 text-white/64">
            Cada operação relevante é auditada com o identificador do operador, data/hora e metadados da modificação.
          </p>
          <div className="mt-8 grid gap-3">
            {[
              ["Ações", "create, update, publish, archive, activate, upload"],
              ["Origem", "Notícias, vídeos, departamentos, categorias e mídia"],
              ["Usuário", "Identificado pelo login administrativo atual"],
            ].map(([label, value]) => (
              <div key={label} className="border border-white/10 bg-white/[0.055] p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f4cf6a]">{label}</p>
                <p className="mt-2 text-sm text-white/66">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Últimas ações</p>
              <h3 className="mt-2 font-serif text-3xl font-black">Registro operacional</h3>
            </div>
            <div className="grid h-12 w-12 place-items-center bg-[#171006] text-[#f4cf6a]">
              <Activity size={23} />
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {logs.map((log) => (
              <article key={log.id} className="border border-[#ead9a6] bg-[#fffaf0] p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex bg-[#f4cf6a] px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#171006]">
                      {formatAction(log.action)}
                    </span>
                    <h4 className="mt-3 font-serif text-2xl font-black leading-tight">{log.entity_title || log.entity_id || "Registro sem título"}</h4>
                    <p className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-[#8b2f2b]">{formatEntity(log.entity)}</p>
                  </div>
                  <p className="flex items-center gap-2 text-xs font-bold text-[#5a472c]">
                    <Clock3 size={14} />
                    {formatDate(log.created_at)}
                  </p>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-[#5a472c] sm:grid-cols-2">
                  <p className="flex items-center gap-2">
                    <UserRound size={15} className="text-[#8b2f2b]" />
                    {log.actor || "admin"}
                  </p>
                  <p className="flex items-center gap-2">
                    <Database size={15} className="text-[#8b2f2b]" />
                    {log.entity_id || "novo registro"}
                  </p>
                </div>
                {log.metadata ? <pre className="mt-4 overflow-auto bg-[#171006] p-3 text-xs leading-5 text-[#f4cf6a]">{JSON.stringify(log.metadata, null, 2)}</pre> : null}
              </article>
            ))}
          </div>

          {logs.length === 0 ? (
            <div className="mt-6 border border-[#ead9a6] bg-[#fffaf0] p-6 text-[#5a472c]">
              Nenhum registro encontrado. As próximas ações administrativas aparecerão aqui automaticamente.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function formatAction(action: string) {
  const labels: Record<string, string> = {
    create: "Criado",
    update: "Atualizado",
    publish: "Publicado",
    archive: "Arquivado",
    activate: "Ativado",
    deactivate: "Desativado",
    upload: "Upload",
    delete: "Removido",
  };

  return labels[action] ?? action;
}

function formatEntity(entity: string) {
  const labels: Record<string, string> = {
    noticia: "Notícia",
    video: "Vídeo",
    departamento: "Departamento",
    categoria: "Categoria",
    midia: "Mídia",
    usuario: "Usuário",
  };

  return labels[entity] ?? entity;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
