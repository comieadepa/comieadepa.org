import { Home } from "lucide-react";
import { headers } from "next/headers";
import { canPerformAdminAction, normalizeAdminRole } from "@/lib/admin-permissions";
import { homeFallbackSettings, homeSettingKeys } from "@/lib/home-settings";
import { selectSupabaseRows } from "@/lib/supabase-admin";
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
  const [settings, mediaAssets] = await Promise.all([
    selectSupabaseRows<CmsSetting>("cms_configuracoes", "select=chave,valor&grupo=eq.home&order=chave.asc"),
    selectSupabaseRows<MediaPickerAsset>("cms_media_assets", "select=id,titulo,arquivo_url,tipo,pasta&order=created_at.desc&limit=40"),
  ]);
  const settingMap = new Map(settings.map((setting) => [setting.chave, stringifySettingValue(setting.valor)]));
  const values = Object.fromEntries(homeSettingKeys.map((key) => [key, settingMap.get(key) ?? homeFallbackSettings[key] ?? ""]));
  const headerList = await headers();
  const role = normalizeAdminRole(headerList.get("x-admin-role"));
  const canEdit = canPerformAdminAction(role, "home", "update");

  return (
    <div className="mx-auto max-w-7xl">
      <StatusMessage success={params?.success} error={params?.message ?? params?.error} />

      <section className="mb-6 border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
        <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-center">
          <div className="grid h-14 w-14 place-items-center bg-[#171006] text-[#f4cf6a]">
            <Home size={27} />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Configurações da Home</p>
            <h1 className="mt-2 font-serif text-4xl font-black leading-tight">Ajustes gerais da página inicial.</h1>
            <p className="mt-3 max-w-4xl leading-7 text-[#5a472c]">
              Área pensada para a equipe de mídia ajustar os blocos institucionais e os textos gerais da home sem interferir na gestão do hero principal.
            </p>
          </div>
        </div>
      </section>

      <HomeSettingsForm values={values} assets={mediaAssets} canEdit={canEdit} />
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
