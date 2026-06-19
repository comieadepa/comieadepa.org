import { Users } from "lucide-react";
import { headers } from "next/headers";
import { StatusMessage } from "../status-message";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import { listarTodosNoAdmin, listarGruposAdmin } from "@/lib/mesa-diretora";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { MediaPickerAsset } from "../media-url-field";
import { MesaDiretoraManager } from "./mesa-diretora-manager";

export default async function AdminMesaDiretoraPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const headerList = await headers();
  const role = normalizeAdminRole(headerList.get("x-admin-role"));

  const canCreate = canPerformAdminAction(role, "mesa_diretora", "create");
  const canUpdate = canPerformAdminAction(role, "mesa_diretora", "update");
  const canPublish = canPerformAdminAction(role, "mesa_diretora", "publish");
  const canDelete = canPerformAdminAction(role, "mesa_diretora", "delete");

  // Buscar todos os membros no banco de dados
  const members = await listarTodosNoAdmin();

  // Buscar todos os grupos cadastrados
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
            <Users size={27} />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Mesa Diretora</p>
            <h1 className="mt-2 font-serif text-4xl font-black leading-tight">Membros da Mesa Diretora</h1>
            <p className="mt-3 max-w-4xl leading-7 text-[#5a472c]">
              Gerencie os pastores que compõem a liderança da convenção, ordenando por grupos hierárquicos e exibindo-os de forma dinâmica no portal público.
            </p>
          </div>
        </div>
      </section>

      <MesaDiretoraManager
        initialMembers={members}
        groups={groups}
        mediaAssets={mediaAssets}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canPublish={canPublish}
        canDelete={canDelete}
      />
    </div>
  );
}
