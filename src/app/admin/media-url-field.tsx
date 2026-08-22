"use client";

import { Check, ImagePlus, Loader2, Search, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";

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
  disabled?: boolean;
};

export function MediaUrlField({
  name,
  label,
  defaultValue,
  placeholder = "https://...",
  helper,
  assets: initialAssets,
  disabled,
}: MediaUrlFieldProps) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [assets, setAssets] = useState<MediaPickerAsset[]>(initialAssets);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageAssets = useMemo(
    () =>
      assets
        .filter((asset) => asset.tipo?.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg)$/i.test(asset.arquivo_url))
        .filter((asset) => {
          const term = query.trim().toLowerCase();
          if (!term) return true;
          return `${asset.titulo ?? ""} ${asset.pasta ?? ""}`.toLowerCase().includes(term);
        }),
    [assets, query],
  );

  async function handleFileUpload(file: File) {
    if (disabled || isUploading) return;
    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("arquivo", file);
    formData.append("pasta", "noticias");
    formData.append("titulo", file.name.replace(/\.[^/.]+$/, ""));

    try {
      const response = await fetch("/api/admin/media", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "x-requested-with": "fetch",
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Erro ao realizar upload da imagem.");
      }

      const newAsset: MediaPickerAsset = {
        id: data.id || crypto.randomUUID(),
        titulo: data.titulo || file.name,
        arquivo_url: data.url,
        tipo: file.type,
        pasta: "noticias",
      };

      setAssets((prev) => [newAsset, ...prev]);
      setValue(data.url);
      setOpen(false);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Falha no upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  const isImageValue = Boolean(
    value &&
      (value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("/") ||
        /\.(png|jpe?g|webp|gif|svg)/i.test(value)),
  );

  return (
    <div className="grid min-w-0 gap-2">
      <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">{label}</span>
      <div className="grid gap-3 border border-dashed border-[#b98e3b] bg-[#f7efd6] p-4 text-sm font-semibold text-[#8b2f2b]">
        <div className="flex w-full min-w-0 items-center gap-3">
          <ImagePlus size={20} className="shrink-0" />
          <input
            name={name}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#8b2f2b]/52 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder={placeholder}
            disabled={disabled}
          />
          {value ? (
            <button
              type="button"
              onClick={() => setValue("")}
              className="text-xs text-[#8b2f2b]/70 transition hover:text-[#8b2f2b]"
              title="Limpar imagem"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>

        {/* Thumbnail preview */}
        {isImageValue ? (
          <div className="relative mt-1 flex items-center gap-3 rounded border border-[#d8c38b] bg-white/80 p-2">
            <div className="relative h-14 w-20 shrink-0 overflow-hidden bg-[#171006]/10">
              <Image src={value} alt="Preview da capa" fill className="object-cover" unoptimized />
            </div>
            <div className="min-w-0 flex-1 text-xs">
              <span className="font-bold text-[#171006]">Imagem selecionada</span>
              <p className="truncate text-white/50 text-[#5a472c]">{value}</p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => (!disabled ? setOpen(true) : undefined)}
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#8b2f2b] underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
          >
            Selecionar da biblioteca
          </button>
          <span className="text-xs text-[#5a472c]/40">•</span>
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#8b2f2b] underline underline-offset-4">
            {isUploading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <UploadCloud size={13} />
                Enviar imagem do computador
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={disabled || isUploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
          </label>
        </div>

        {uploadError ? <p className="text-xs font-bold text-red-700">{uploadError}</p> : null}
        {helper ? <p className="text-xs leading-5 text-[#5a472c]">{helper}</p> : null}
      </div>

      {open ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/62 p-4 backdrop-blur-sm">
          <div className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden border border-[#d8c38b] bg-[#f7efd6] text-[#171006] shadow-[0_28px_80px_rgba(0,0,0,.35)]">
            <div className="flex flex-col gap-4 border-b border-[#d8c38b] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Biblioteca de mídia</p>
                <h3 className="mt-1 font-serif text-3xl font-black">Escolha uma imagem</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-11 w-11 place-items-center border border-[#d8c38b] bg-white/70 transition hover:bg-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-3 border-b border-[#d8c38b] p-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex flex-1 items-center gap-3 border border-[#d8c38b] bg-white/72 px-4 py-2.5 text-sm text-[#5a472c]">
                <Search size={17} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="w-full bg-transparent outline-none"
                  placeholder="Buscar por título ou pasta..."
                />
              </label>

              <label className="inline-flex cursor-pointer items-center justify-center gap-2 bg-[#171006] px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-[#f4cf6a] transition hover:bg-[#2c2212]">
                {isUploading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <UploadCloud size={15} />
                )}
                Upload novo arquivo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
              </label>
            </div>

            {uploadError ? (
              <div className="bg-red-100 p-3 text-xs font-bold text-red-700">{uploadError}</div>
            ) : null}

            <div className="grid gap-4 overflow-y-auto p-5 sm:grid-cols-2 lg:grid-cols-3">
              {imageAssets.map((asset) => {
                const isSelected = value === asset.arquivo_url;
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => {
                      setValue(asset.arquivo_url);
                      setOpen(false);
                    }}
                    className={`group relative overflow-hidden border text-left transition hover:-translate-y-1 ${
                      isSelected
                        ? "border-[#8b2f2b] bg-white ring-2 ring-[#8b2f2b]"
                        : "border-[#d8c38b] bg-white/76 hover:bg-white"
                    }`}
                  >
                    <span className="relative block aspect-video bg-[#171006]/10">
                      <Image
                        src={asset.arquivo_url}
                        alt={asset.titulo ?? "Imagem da biblioteca"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      {isSelected ? (
                        <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-[#8b2f2b] text-white">
                          <Check size={14} />
                        </span>
                      ) : null}
                    </span>
                    <span className="block p-4">
                      <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8b2f2b]">
                        {asset.pasta ?? "geral"}
                      </span>
                      <span className="mt-1 block font-serif text-xl font-black leading-tight">
                        {asset.titulo ?? "Imagem sem título"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {imageAssets.length === 0 ? (
              <div className="p-10 text-center text-[#5a472c]">
                Nenhuma imagem encontrada. Utilize o botão acima para fazer o upload.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
