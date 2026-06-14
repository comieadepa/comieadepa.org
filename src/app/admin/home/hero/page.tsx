import { LayoutTemplate } from "lucide-react";
import { headers } from "next/headers";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import { CmsHomeSlide } from "@/lib/home-slides";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { MediaPickerAsset } from "../../media-url-field";
import { StatusMessage } from "../../status-message";
import { HomeSlidesManager } from "../home-slides-manager";

export default async function AdminHomeHeroPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const [slides, mediaAssets] = await Promise.all([
    selectSupabaseRows<CmsHomeSlide>(
      "cms_home_slides",
      "select=id,titulo,subtitulo,descricao,data_label,imagem_url,botao_texto,botao_url,ordem,status,abrir_nova_aba,created_at,updated_at,created_by&order=ordem.asc,updated_at.desc&limit=100",
    ),
    selectSupabaseRows<MediaPickerAsset>("cms_media_assets", "select=id,titulo,arquivo_url,tipo,pasta&order=created_at.desc&limit=40"),
  ]);
  const headerList = await headers();
  const role = normalizeAdminRole(headerList.get("x-admin-role"));
  const canUpdate = canPerformAdminAction(role, "home", "update");
  const canCreate = canPerformAdminAction(role, "home", "create");
  const canPublish = canPerformAdminAction(role, "home", "publish");
  const canArchive = canPerformAdminAction(role, "home", "archive");
  const canDelete = canPerformAdminAction(role, "home", "delete");

  return (
    <div className="mx-auto max-w-7xl">
      <StatusMessage success={params?.success} error={params?.message ?? params?.error} />

      <section className="mb-6 border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
        <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-center">
          <div className="grid h-14 w-14 place-items-center bg-[#171006] text-[#f4cf6a]">
            <LayoutTemplate size={27} />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Hero Principal</p>
            <h1 className="mt-2 font-serif text-4xl font-black leading-tight">Gestão exclusiva do slider da home.</h1>
            <p className="mt-3 max-w-4xl leading-7 text-[#5a472c]">
              Organize os slides principais da página inicial, definindo imagem de fundo, textos, links e ordem de exibição sem misturar essa rotina com as demais configurações da home.
            </p>
          </div>
        </div>
      </section>

      <HomeSlidesManager
        slides={slides}
        assets={mediaAssets}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canPublish={canPublish}
        canArchive={canArchive}
        canDelete={canDelete}
        basePath="/admin/home/hero"
      />
    </div>
  );
}
