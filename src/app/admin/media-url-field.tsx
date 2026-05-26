"use client";

import { ImagePlus, Search, X } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

export type MediaPickerAsset = {
  id: string;
  titulo: string | null;
  arquivo_url: string;
  tipo: string | null;
  pasta: string | null;
};

type MediaUrlFieldProps = {
  name: string;
  label: string;
  defaultValue?: string | null;
  placeholder?: string;
  helper?: string;
  assets: MediaPickerAsset[];
};

export function MediaUrlField({ name, label, defaultValue, placeholder = "https://...", helper, assets }: MediaUrlFieldProps) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const imageAssets = useMemo(
    () =>
      assets
        .filter((asset) => asset.tipo?.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(asset.arquivo_url))
        .filter((asset) => {
          const term = query.trim().toLowerCase();

          if (!term) {
            return true;
          }

          return `${asset.titulo ?? ""} ${asset.pasta ?? ""}`.toLowerCase().includes(term);
        }),
    [assets, query],
  );

  return (
    <div className="grid gap-2">
      <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">{label}</span>
      <div className="grid gap-3 border border-dashed border-[#b98e3b] bg-[#f7efd6] p-4 text-sm font-semibold text-[#8b2f2b]">
        <span className="flex w-full items-center gap-3">
          <ImagePlus size={20} className="shrink-0" />
          <input
            name={name}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="w-full bg-transparent outline-none placeholder:text-[#8b2f2b]/52"
            placeholder={placeholder}
          />
        </span>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => setOpen(true)} className="text-xs font-black uppercase tracking-[0.12em] underline underline-offset-4">
            Selecionar da biblioteca
          </button>
          <a href="/admin/midia" className="text-xs font-black uppercase tracking-[0.12em] underline underline-offset-4">
            Enviar novo arquivo
          </a>
        </div>
        {helper ? <p className="text-xs leading-5 text-[#5a472c]">{helper}</p> : null}
      </div>

      {open ? (
        <div className="fixed inset-0 z-[120] bg-black/62 p-4 backdrop-blur-sm">
          <div className="mx-auto flex max-h-[88vh] max-w-5xl flex-col overflow-hidden border border-[#d8c38b] bg-[#f7efd6] text-[#171006] shadow-[0_28px_80px_rgba(0,0,0,.35)]">
            <div className="flex flex-col gap-4 border-b border-[#d8c38b] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Biblioteca de mídia</p>
                <h3 className="mt-1 font-serif text-3xl font-black">Escolha uma imagem</h3>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center border border-[#d8c38b] bg-white/70">
                <X size={20} />
              </button>
            </div>

            <div className="border-b border-[#d8c38b] p-5">
              <label className="flex items-center gap-3 border border-[#d8c38b] bg-white/72 px-4 py-3 text-sm text-[#5a472c]">
                <Search size={17} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent outline-none" placeholder="Buscar por título ou pasta" />
              </label>
            </div>

            <div className="grid gap-4 overflow-y-auto p-5 sm:grid-cols-2 lg:grid-cols-3">
              {imageAssets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => {
                    setValue(asset.arquivo_url);
                    setOpen(false);
                  }}
                  className="group overflow-hidden border border-[#d8c38b] bg-white/76 text-left transition hover:-translate-y-1 hover:bg-white"
                >
                  <span className="relative block aspect-video bg-[#171006]/10">
                    <Image src={asset.arquivo_url} alt={asset.titulo ?? "Imagem da biblioteca"} fill className="object-cover" />
                  </span>
                  <span className="block p-4">
                    <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8b2f2b]">{asset.pasta ?? "geral"}</span>
                    <span className="mt-1 block font-serif text-xl font-black leading-tight">{asset.titulo ?? "Imagem sem título"}</span>
                  </span>
                </button>
              ))}
            </div>

            {imageAssets.length === 0 ? <div className="p-6 text-center text-[#5a472c]">Nenhuma imagem encontrada na biblioteca.</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
