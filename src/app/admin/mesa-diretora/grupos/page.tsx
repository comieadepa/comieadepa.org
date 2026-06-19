import { ListChecks } from "lucide-react";
import { headers } from "next/headers";
import { StatusMessage } from "../../status-message";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import { listarGruposAdmin } from "@/lib/mesa-diretora";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { MediaPickerAsset } from "../../media-url-field";
import { MesaDiretoraGroupsManager } from "./grupos-manager";

export default async function AdminMesaDiretoraGroupsPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const headerList = await headers();
  const role = normalizeAdminRole(headerList.get("x-admin-role"));

  const canCreate = canPerformAdminAction(role, "mesa_diretora", "create");
  const canUpdate = canPerformAdminAction(role, "mesa_diretora", "update");
  const canDelete = canPerformAdminAction(role, "mesa_diretora", "delete");

  // Buscar todos os grupos no banco de dados
  const groups = await listarGruposAdmin();

  // Buscar imagens disponíveis na biblioteca de mídia para seleção
  const mediaAssets = await selectSupabaseRows<MediaPickerAsset>(
    "cms_media_assets",
    "select=id,titulo,arquivo_url,tipo&order=created_at.desc&limit=150"
  );

  return (
    <div className="mx-auto max-w-7xl">
      <StatusMessage success={params?.success} error={params?.message ?? params?.error} />

      <section className="mb-6 border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
        <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-center">
          <div className="grid h-14 w-14 place-items-center bg-[#171006] text-[#f4cf6a]">
            <ListChecks size={27} />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Mesa Diretora</p>
            <h1 className="mt-2 font-serif text-4xl font-black leading-tight">Grupos da Mesa Diretora</h1>
            <p className="mt-3 max-w-4xl leading-7 text-[#5a472c]">
              Gerencie e ordene as seções hierárquicas da Mesa Diretora (ex: Diretoria, Conselhos, Comissões). Configure cores de título, imagens de fundo e layouts em colunas.
            </p>
          </div>
        </div>
      </section>

      <MesaDiretoraGroupsManager
        initialGroups={groups}
        mediaAssets={mediaAssets}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />
    </div>
  );
}
