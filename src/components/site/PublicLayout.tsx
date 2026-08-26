"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";

const supabaseUrl = "https://wtifljxpoinpbzyugrfc.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseSiteSchema = process.env.NEXT_PUBLIC_SUPABASE_SITE_SCHEMA ?? "site";

export type PublicSiteConfig = {
  ministerPortalUrl: string;
  eventsPortalUrl: string;
  youtubeChannelUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  contactHours: string;
};

type CmsSetting = {
  chave: string;
  valor: unknown;
};

export const defaultPublicSiteConfig: PublicSiteConfig = {
  ministerPortalUrl: "https://www.siscomieadepa.org/portal-ministro/login",
  eventsPortalUrl: "https://eventos.siscomieadepa.org/eventos-publicos",
  youtubeChannelUrl: "https://www.youtube.com/@comieadepa",
  facebookUrl: "",
  instagramUrl: "",
  contactAddress: "Rodovia Mário Covas, 2500",
  contactPhone: "55 (91) 0000-0000",
  contactEmail: "secretaria@comieadepa.com.br",
  contactHours: "9h às 17h - Segunda a Sexta",
};

export function PublicLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [config, setConfig] = useState<PublicSiteConfig>(defaultPublicSiteConfig);

  useEffect(() => {
    let active = true;

    async function loadConfig() {
      if (!supabaseAnonKey) {
        return;
      }

      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/cms_configuracoes?select=chave,valor&publico=eq.true`, {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
            "Accept-Profile": supabaseSiteSchema,
          },
        });

        if (!response.ok) {
          return;
        }

        const settings = (await response.json()) as CmsSetting[];
        if (active) {
          setConfig(mapPublicSiteSettings(settings));
        }
      } catch {
        // Mantém os valores institucionais padrão quando a configuração não está disponível.
      }
    }

    loadConfig();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#1F2937]">
      <Header ministerPortalUrl={config.ministerPortalUrl} eventsPortalUrl={config.eventsPortalUrl} />
      <div className={pathname === "/" ? undefined : "pt-20"}>{children}</div>
      <Footer config={config} />
    </div>
  );
}

function normalizeMinisterPortalUrl(url?: string): string {
  const trimmed = url?.trim();
  if (!trimmed || trimmed === "https://www.siscomieadepa.org/login" || trimmed === "https://www.siscomieadepa.org" || trimmed === "https://siscomieadepa.org/login") {
    return "https://www.siscomieadepa.org/portal-ministro/login";
  }
  return trimmed;
}

export function mapPublicSiteSettings(settings: CmsSetting[]): PublicSiteConfig {
  const values = new Map(settings.map((setting) => [setting.chave, stringifySettingValue(setting.valor)]));

  return {
    ministerPortalUrl: normalizeMinisterPortalUrl(values.get("url_area_ministro")),
    eventsPortalUrl: values.get("url_eventos") || defaultPublicSiteConfig.eventsPortalUrl,
    youtubeChannelUrl: values.get("youtube_channel_url") || defaultPublicSiteConfig.youtubeChannelUrl,
    facebookUrl: values.get("facebook_url") || defaultPublicSiteConfig.facebookUrl,
    instagramUrl: values.get("instagram_url") || defaultPublicSiteConfig.instagramUrl,
    contactAddress: values.get("contato_endereco") || defaultPublicSiteConfig.contactAddress,
    contactPhone: values.get("contato_telefone") || defaultPublicSiteConfig.contactPhone,
    contactEmail: values.get("contato_email") || defaultPublicSiteConfig.contactEmail,
    contactHours: values.get("contato_horario") || defaultPublicSiteConfig.contactHours,
  };
}

function stringifySettingValue(value: unknown) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}
