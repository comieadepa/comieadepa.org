import { Calendar } from "lucide-react";
import { headers } from "next/headers";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { AdminPageHeader } from "../admin-ui";
import { MediaPickerAsset } from "../media-url-field";
import { StatusMessage } from "../status-message";
import { EventRow, EventsManager, EventTypeRow } from "./events-manager";

type CmsSetting = {
  chave: string;
  valor: unknown;
};

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const headerList = await headers();
  const role = normalizeAdminRole(headerList.get("x-admin-role"));

  const canCreate = canPerformAdminAction(role, "eventos", "create");
  const canUpdate = canPerformAdminAction(role, "eventos", "update");
  const canDelete = canPerformAdminAction(role, "eventos", "delete");

  const [events, mediaAssets, settings, allTypes] = await Promise.all([
    selectSupabaseRows<EventRow>(
      "eventos",
      "select=id,nome,slug,descricao,departamento,data_inicio,data_fim,local,cidade,banner_url,valor_inscricao,inscricoes_abertas,publico_alvo,status,usar_tipos_inscricao,created_at&order=data_inicio.desc&limit=200",
    ),
    selectSupabaseRows<MediaPickerAsset>(
      "cms_media_assets",
      "select=id,titulo,arquivo_url,tipo,pasta&order=created_at.desc&limit=50",
    ),
    selectSupabaseRows<CmsSetting>(
      "cms_configuracoes",
      "select=chave,valor&chave=eq.url_eventos&limit=1",
    ),
    selectSupabaseRows<EventTypeRow>(
      "evento_tipos_inscricao",
      "select=id,evento_id,nome,valor,ativo,ordem,limite_vagas&order=ordem.asc,nome.asc",
    ),
  ]);

  const initialTypesMap: Record<string, EventTypeRow[]> = {};
  for (const typeItem of allTypes) {
    if (!initialTypesMap[typeItem.evento_id]) {
      initialTypesMap[typeItem.evento_id] = [];
    }
    initialTypesMap[typeItem.evento_id].push(typeItem);
  }

  const eventsPortalUrl =
    typeof settings[0]?.valor === "string"
      ? settings[0].valor
      : "https://eventos.siscomieadepa.org/eventos-publicos";

  return (
    <div className="mx-auto max-w-7xl">
      <StatusMessage success={params?.success} error={params?.message ?? params?.error} />

      <AdminPageHeader
        icon={Calendar}
        eyebrow="Agenda Oficial & Assembleias"
        title="Gestão de Eventos e Inscrições"
        description="Cadastre assembleias gerais, congressos convencionais, encontros de departamentos e configure lotes de inscrição com sincronização direta ao portal."
      />

      <EventsManager
        initialEvents={events}
        initialTypesMap={initialTypesMap}
        mediaAssets={mediaAssets}
        eventsPortalUrl={eventsPortalUrl}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />
    </div>
  );
}

