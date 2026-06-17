"use client";

import { ExternalLink, Save, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { homeSettingSections } from "@/lib/home-settings";
import { CmsHomeSlide } from "@/lib/home-slides";
import { MediaPickerAsset, MediaUrlField } from "../media-url-field";
import { HomeSlidesManager } from "./home-slides-manager";

type HomeSettingsFormProps = {
  values: Record<string, string>;
  assets: MediaPickerAsset[];
  canEdit?: boolean;
  slides: CmsHomeSlide[];
  canCreateSlide: boolean;
  canPublishSlide: boolean;
  canArchiveSlide: boolean;
  canDeleteSlide: boolean;
};

export function HomeSettingsForm({
  values,
  assets,
  canEdit = true,
  slides,
  canCreateSlide,
  canPublishSlide,
  canArchiveSlide,
  canDeleteSlide,
}: HomeSettingsFormProps) {
  const [activeSectionId, setActiveSectionId] = useState<string>(homeSettingSections[0]?.id ?? "");
  const activeSection = useMemo(
    () => homeSettingSections.find((section) => section.id === activeSectionId) ?? homeSettingSections[0],
    [activeSectionId],
  );

  if (!activeSection) {
    return null;
  }

  const isHeroSection = activeSection.id === "hero";

  return (
    <div className="grid gap-6 xl:grid-cols-[260px_1fr_300px]">
      <nav className="h-fit border border-[#d8c38b] bg-white/76 p-3">
        <p className="px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#8b2f2b]">SeÃ§Ãµes da home</p>
        <div className="mt-2 grid gap-2">
          {homeSettingSections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSectionId(section.id)}
              className={`px-4 py-3 text-left transition ${
                activeSection.id === section.id ? "bg-[#171006] text-white" : "border border-[#ead9a6] bg-[#f7efd6] text-[#5a472c] hover:bg-white"
              }`}
            >
              <span className={`block text-[10px] font-black uppercase tracking-[0.16em] ${activeSection.id === section.id ? "text-[#f4cf6a]" : "text-[#8b2f2b]"}`}>
                {section.eyebrow}
              </span>
              <span className="mt-1 block font-serif text-2xl font-black leading-tight">{section.title}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="grid gap-6">
        <form action="/api/admin/home" method="post" className="min-w-0 border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
          <SectionHeader activeSection={activeSection} />

          <div className="mt-6 grid gap-5">
            {activeSection.fields.map((field) => (
              <FieldRenderer key={field.name} field={field} values={values} assets={assets} canEdit={canEdit} />
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-3 border-t border-[#ead9a6] pt-6 sm:flex-row">
            <button
              type="submit"
              disabled={!canEdit}
              className="inline-flex items-center justify-center gap-3 bg-[#171006] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {isHeroSection ? "Salvar ajustes da abertura" : "Salvar home"}
            </button>
            <a href="/admin/midia" className="inline-flex items-center justify-center gap-3 border border-[#8b2f2b]/30 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#8b2f2b]">
              Biblioteca de mÃ­dia
            </a>
          </div>
        </form>

        {isHeroSection ? (
          <HomeSlidesManager
            slides={slides}
            assets={assets}
            canCreate={canCreateSlide}
            canUpdate={canEdit}
            canPublish={canPublishSlide}
            canArchive={canArchiveSlide}
            canDelete={canDeleteSlide}
            basePath="/admin/home"
            embedded
          />
        ) : null}
      </div>

      <aside className="h-fit border border-[#d8c38b] bg-[#171006] p-6 text-white">
        <div className="grid h-12 w-12 place-items-center bg-[#f4cf6a] text-[#171006]">
          <Sparkles size={23} />
        </div>
        <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-[#f4cf6a]">Controle editorial</p>
        <h3 className="mt-2 font-serif text-3xl font-black leading-tight">MudanÃ§as publicam direto na home.</h3>
        <p className="mt-4 leading-7 text-white/62">
          Esta tela edita chamadas, textos e imagens da pÃ¡gina inicial. NotÃ­cias, vÃ­deos e departamentos destacados continuam sendo escolhidos nos mÃ³dulos prÃ³prios.
        </p>
        <div className="mt-6 grid gap-3 text-sm text-white/70">
          <span className="border border-white/10 bg-white/[0.055] p-3">Use textos curtos nos tÃ­tulos.</span>
          <span className="border border-white/10 bg-white/[0.055] p-3">Prefira imagens horizontais nos banners.</span>
          <span className="border border-white/10 bg-white/[0.055] p-3">Revise a home em uma nova aba depois de salvar.</span>
        </div>
      </aside>
    </div>
  );
}

function SectionHeader({ activeSection }: { activeSection: (typeof homeSettingSections)[number] }) {
  return (
    <div className="flex flex-col gap-5 border-b border-[#ead9a6] pb-6 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">{activeSection.eyebrow}</p>
        <h2 className="mt-2 font-serif text-4xl font-black leading-tight">{activeSection.title}</h2>
        <p className="mt-3 max-w-2xl leading-7 text-[#5a472c]">{activeSection.description}</p>
      </div>
      <a
        href="/"
        target="_blank"
        className="inline-flex w-fit items-center justify-center gap-3 border border-[#8b2f2b]/30 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#8b2f2b]"
      >
        Ver portal
        <ExternalLink size={17} />
      </a>
    </div>
  );
}

function FieldRenderer({
  field,
  values,
  assets,
  canEdit,
}: {
  field: (typeof homeSettingSections)[number]["fields"][number];
  values: Record<string, string>;
  assets: MediaPickerAsset[];
  canEdit: boolean;
}) {
  if (field.type === "textarea") {
    return (
      <label className="grid gap-2">
        <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">{field.label}</span>
        <textarea
          name={field.name}
          defaultValue={values[field.name] ?? ""}
          className="min-h-32 border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 leading-7 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
          placeholder={field.placeholder}
          disabled={!canEdit}
        />
      </label>
    );
  }

  if (field.type === "image") {
    return (
      <MediaUrlField
        name={field.name}
        label={field.label}
        defaultValue={values[field.name] ?? ""}
        placeholder={field.placeholder}
        helper={field.helper}
        assets={assets}
        disabled={!canEdit}
      />
    );
  }

  return (
    <label className="grid gap-2">
      <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">{field.label}</span>
      <input
        name={field.name}
        defaultValue={values[field.name] ?? ""}
        className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
        placeholder={field.placeholder}
        disabled={!canEdit}
      />
    </label>
  );
}
