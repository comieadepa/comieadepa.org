"use client";

import { ExternalLink, Save } from "lucide-react";
import { useMemo, useState } from "react";

type SettingField = {
  name: string;
  label: string;
  placeholder: string;
};

type SettingGroup = {
  group: string;
  description: string;
  fields: SettingField[];
};

type SettingsFormProps = {
  groups: SettingGroup[];
  values: Record<string, string>;
  canEdit?: boolean;
};

export function SettingsForm({ groups, values, canEdit = true }: SettingsFormProps) {
  const [activeGroup, setActiveGroup] = useState(groups[0]?.group ?? "");
  const currentGroup = useMemo(() => groups.find((group) => group.group === activeGroup) ?? groups[0], [activeGroup, groups]);

  if (!currentGroup) {
    return null;
  }

  return (
    <form action="/api/admin/configuracoes" method="post" className="grid gap-5">
      <div className="flex gap-2 overflow-x-auto border border-[#ead9a6] bg-[#f7efd6] p-2">
        {groups.map((group) => (
          <button
            key={group.group}
            type="button"
            onClick={() => setActiveGroup(group.group)}
            className={`shrink-0 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] transition ${
              activeGroup === group.group ? "bg-[#171006] text-[#f4cf6a]" : "text-[#8b2f2b] hover:bg-white/70"
            }`}
          >
            {group.group}
          </button>
        ))}
      </div>

      {groups.map((group) => (
        <div key={group.group} className={group.group === currentGroup.group ? "block" : "hidden"}>
          <fieldset className="border border-[#ead9a6] bg-[#f7efd6] p-5">
            <legend className="px-2 text-xs font-black uppercase tracking-[0.18em] text-[#8b2f2b]">{group.group}</legend>
            <p className="mb-4 mt-1 text-sm leading-6 text-[#5a472c]">{group.description}</p>
            <div className="grid gap-4">
              {group.fields.map((field) => (
                <label key={field.name} className="grid gap-2">
                  <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">{field.label}</span>
                  <input
                    name={field.name}
                    defaultValue={values[field.name] ?? ""}
                    className="border border-[#d8c38b] bg-[#fffaf0] px-4 py-3 outline-none focus:border-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder={field.placeholder}
                    disabled={!canEdit}
                  />
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      ))}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={!canEdit}
          className="inline-flex items-center justify-center gap-3 bg-[#171006] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={18} />
          Salvar configurações
        </button>
        <a href="/" target="_blank" className="inline-flex items-center justify-center gap-3 border border-[#8b2f2b]/30 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#8b2f2b]">
          Ver portal
          <ExternalLink size={17} />
        </a>
      </div>
    </form>
  );
}
