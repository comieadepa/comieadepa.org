"use client";

import { Bold, Check, Eye, Heading2, ImageIcon, Italic, LinkIcon, List, Loader2, PenLine, Quote, Search, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { MediaPickerAsset } from "./media-url-field";

type RichTextFieldProps = {
  name: string;
  label: string;
  defaultValue?: string | null;
  placeholder?: string;
  disabled?: boolean;
  mediaAssets?: MediaPickerAsset[];
};

const toolbarActions = [
  { label: "Título", icon: Heading2, before: "\n## ", after: "" },
  { label: "Negrito", icon: Bold, before: "**", after: "**" },
  { label: "Itálico", icon: Italic, before: "*", after: "*" },
  { label: "Lista", icon: List, before: "\n- ", after: "" },
  { label: "Citação", icon: Quote, before: "\n> ", after: "" },
  { label: "Link", icon: LinkIcon, before: "[", after: "](https://)" },
];

export function RichTextField({ name, label, defaultValue, placeholder, disabled, mediaAssets: initialAssets = [] }: RichTextFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue ?? "");
  const [tab, setTab] = useState<"write" | "preview">("write");

  // State for image picker modal
  const [assets, setAssets] = useState<MediaPickerAsset[]>(initialAssets);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function insertMarkup(before: string, after: string) {
    if (disabled) {
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const selectedText = value.slice(selectionStart, selectionEnd);
    const nextValue = `${value.slice(0, selectionStart)}${before}${selectedText}${after}${value.slice(selectionEnd)}`;
    const nextCursor = selectionStart + before.length + selectedText.length;

    setValue(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function insertImageMarkup(url: string, altText?: string) {
    const description = altText?.trim() || "Imagem da notícia";
    insertMarkup(`\n![${description}](`, `${url})\n`);
    setIsModalOpen(false);
  }

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
    setUploadError(null);

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError("A imagem excede o limite de 5 MB. Reduza o tamanho do arquivo.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);

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
      insertImageMarkup(data.url, file.name.replace(/\.[^/.]+$/, ""));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Falha no upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">{label}</span>
        <div className="flex items-center gap-1 border border-[#d8c38b] bg-[#f7efd6] p-0.5 text-xs font-black uppercase tracking-[0.12em]">
          <button
            type="button"
            onClick={() => setTab("write")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 transition ${
              tab === "write" ? "bg-[#171006] text-[#f4cf6a]" : "text-[#5a472c] hover:text-[#8b2f2b]"
            }`}
          >
            <PenLine size={13} />
            Escrever
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 transition ${
              tab === "preview" ? "bg-[#171006] text-[#f4cf6a]" : "text-[#5a472c] hover:text-[#8b2f2b]"
            }`}
          >
            <Eye size={13} />
            Prévia
          </button>
        </div>
      </div>

      <div className="overflow-hidden border border-[#d8c38b] bg-[#fffaf0]">
        {tab === "write" ? (
          <>
            <div className="flex flex-wrap gap-2 border-b border-[#ead9a6] bg-[#f7efd6] p-2">
              {toolbarActions.map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => insertMarkup(action.before, action.after)}
                    title={action.label}
                    disabled={disabled}
                    className="grid h-9 w-9 place-items-center border border-[#d8c38b] bg-white/70 text-[#5a472c] transition hover:border-[#8b2f2b] hover:text-[#8b2f2b] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Icon size={17} />
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => (!disabled ? setIsModalOpen(true) : undefined)}
                title="Inserir Imagem no Conteúdo"
                disabled={disabled}
                className="inline-flex h-9 items-center gap-1.5 border border-[#8b2f2b]/40 bg-[#8b2f2b]/10 px-2.5 text-xs font-black uppercase tracking-wider text-[#8b2f2b] transition hover:bg-[#8b2f2b] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ImageIcon size={17} />
                Inserir Imagem
              </button>
            </div>
            <textarea
              ref={textareaRef}
              name={name}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="min-h-72 w-full bg-transparent px-4 py-3 leading-7 outline-none focus:bg-white/45 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder={placeholder}
              disabled={disabled}
            />
          </>
        ) : (
          <div className="min-h-72 bg-white/60 p-6">
            {value.trim() ? (
              <div className="prose max-w-none space-y-4 text-[#2b1f14]">
                {value.split("\n\n").map((block, idx) => {
                  const trimmed = block.trim();
                  if (trimmed.startsWith("## ")) {
                    return (
                      <h2 key={idx} className="font-serif text-2xl font-black text-[#171006]">
                        {trimmed.replace(/^##\s+/, "")}
                      </h2>
                    );
                  }
                  if (trimmed.startsWith("> ")) {
                    return (
                      <blockquote
                        key={idx}
                        className="border-l-4 border-[#8b2f2b] bg-[#f7efd6]/50 p-4 font-serif italic text-[#4a3a2a]"
                      >
                        {trimmed.replace(/^>\s+/, "")}
                      </blockquote>
                    );
                  }
                  if (trimmed.startsWith("- ")) {
                    return (
                      <ul key={idx} className="list-disc pl-5 space-y-1">
                        {trimmed.split("\n").map((line, lIdx) => (
                          <li key={lIdx}>{line.replace(/^-\s+/, "")}</li>
                        ))}
                      </ul>
                    );
                  }
                  const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
                  if (imageMatch) {
                    const altText = imageMatch[1] || "Imagem da notícia";
                    const imageUrl = imageMatch[2];
                    return (
                      <figure key={idx} className="my-6 space-y-2 text-center">
                        <div className="relative mx-auto max-h-[500px] w-full overflow-hidden rounded border border-[#d8c38b] bg-[#171006]">
                          <img src={imageUrl} alt={altText} className="mx-auto max-h-[500px] w-auto object-contain" />
                        </div>
                        {altText && altText !== "Imagem da notícia" && (
                          <figcaption className="text-xs font-semibold italic text-[#5a472c]/80">{altText}</figcaption>
                        )}
                      </figure>
                    );
                  }
                  return (
                    <p key={idx} className="leading-relaxed">
                      {trimmed}
                    </p>
                  );
                })}
              </div>
            ) : (
              <p className="italic text-[#5a472c]/60">Nenhum conteúdo escrito ainda para visualizar.</p>
            )}
            <textarea name={name} value={value} readOnly className="hidden" />
          </div>
        )}
      </div>
      <span className="text-xs leading-5 text-[#7a6543]">
        Use as marcações de títulos (##), negrito (**), citações (&gt;), imagens e listas. A página pública renderiza automaticamente com a tipografia oficial.
      </span>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/62 p-4 backdrop-blur-sm">
          <div className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden border border-[#d8c38b] bg-[#f7efd6] text-[#171006] shadow-[0_28px_80px_rgba(0,0,0,.35)]">
            <div className="flex flex-col gap-4 border-b border-[#d8c38b] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8b2f2b]">Biblioteca de Mídia</p>
                <h3 className="mt-1 font-serif text-3xl font-black">Inserir Imagem no Texto</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
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
                  placeholder="Buscar imagem..."
                />
              </label>

              <label className="inline-flex cursor-pointer items-center justify-center gap-2 bg-[#171006] px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-[#f4cf6a] transition hover:bg-[#2c2212]">
                {isUploading ? <Loader2 size={15} className="animate-spin" /> : <UploadCloud size={15} />}
                Enviar Imagem do Computador
                <input
                  ref={fileInputRef}
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

            {uploadError ? <div className="bg-red-100 p-3 text-xs font-bold text-red-700">{uploadError}</div> : null}

            <div className="grid gap-4 overflow-y-auto p-5 sm:grid-cols-2 lg:grid-cols-3">
              {imageAssets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => insertImageMarkup(asset.arquivo_url, asset.titulo ?? undefined)}
                  className="group relative overflow-hidden border border-[#d8c38b] bg-white/76 text-left transition hover:-translate-y-1 hover:border-[#8b2f2b] hover:bg-white hover:shadow-md"
                >
                  <span className="relative block aspect-video bg-[#171006]/10">
                    <Image
                      src={asset.arquivo_url}
                      alt={asset.titulo ?? "Imagem da biblioteca"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </span>
                  <span className="block p-4">
                    <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8b2f2b]">
                      {asset.pasta ?? "noticias"}
                    </span>
                    <span className="mt-1 block font-serif text-xl font-black leading-tight text-[#171006]">
                      {asset.titulo ?? "Imagem sem título"}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            {imageAssets.length === 0 ? (
              <div className="p-10 text-center text-[#5a472c]">
                Nenhuma imagem encontrada. Utilize o botão acima para enviar uma imagem.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
