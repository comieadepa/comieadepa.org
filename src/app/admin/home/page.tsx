import { Home } from "lucide-react";
import { headers } from "next/headers";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import { homeFallbackSettings, homeSettingKeys } from "@/lib/home-settings";
import { CmsHomeSlide } from "@/lib/home-slides";
import { selectSupabaseRows } from "@/lib/supabase-admin";
import { AdminPageHeader } from "../admin-ui";
import { MediaPickerAsset } from "../media-url-field";
import { StatusMessage } from "../status-message";
import { HomeSettingsForm } from "./home-settings-form";

type CmsSetting = {
  chave: string;
  valor: unknown;
};

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string; error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const [settings, mediaAssets, slides] = await Promise.all([
    selectSupabaseRows<CmsSetting>("cms_configuracoes", "select=chave,valor&grupo=eq.home&order=chave.asc"),
    selectSupabaseRows<MediaPickerAsset>("cms_media_assets", "select=id,titulo,arquivo_url,tipo,pasta&order=created_at.desc&limit=40"),
    selectSupabaseRows<CmsHomeSlide>(
      "cms_home_slides",
      "select=id,titulo,subtitulo,descricao,data_label,imagem_url,botao_texto,botao_url,ordem,status,abrir_nova_aba,created_at,updated_at,created_by&order=ordem.asc,updated_at.desc&limit=100",
    ),
  ]);
  const settingMap = new Map(settings.map((setting) => [setting.chave, stringifySettingValue(setting.valor)]));
  const values = Object.fromEntries(homeSettingKeys.map((key) => [key, settingMap.get(key) ?? homeFallbackSettings[key] ?? ""]));
  const headerList = await headers();
  const role = normalizeAdminRole(headerList.get("x-admin-role"));
  const canEdit = canPerformAdminAction(role, "home", "update");
  const canCreate = canPerformAdminAction(role, "home", "create");
  const canPublish = canPerformAdminAction(role, "home", "publish");
  const canArchive = canPerformAdminAction(role, "home", "archive");
  const canDelete = canPerformAdminAction(role, "home", "delete");

  return (
    <div className="mx-auto max-w-7xl">
      <StatusMessage success={params?.success} error={params?.message ?? params?.error} />

      <AdminPageHeader
        icon={Home}
        eyebrow="Configurações da Home"
        title="Ajustes Gerais da Página Inicial"
        description="Gerencie os blocos institucionais, chamadas editoriais e a composição visual do hero principal e slides do portal."
      />

      <HomeSettingsForm
        role={role}
        values={values}
        assets={mediaAssets}
        canEdit={canEdit}
        slides={slides}
        canCreateSlide={canCreate}
        canPublishSlide={canPublish}
        canArchiveSlide={canArchive}
        canDeleteSlide={canDelete}
      />
    </div>
  );
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
