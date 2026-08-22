"use client";

import { Bold, Eye, Heading2, ImageIcon, Italic, LinkIcon, List, PenLine, Quote } from "lucide-react";
import { useRef, useState } from "react";

type RichTextFieldProps = {
  name: string;
  label: string;
  defaultValue?: string | null;
  placeholder?: string;
  disabled?: boolean;
};

const toolbarActions = [
  { label: "Título", icon: Heading2, before: "\n## ", after: "" },
  { label: "Negrito", icon: Bold, before: "**", after: "**" },
  { label: "Itálico", icon: Italic, before: "*", after: "*" },
  { label: "Lista", icon: List, before: "\n- ", after: "" },
  { label: "Citação", icon: Quote, before: "\n> ", after: "" },
  { label: "Link", icon: LinkIcon, before: "[", after: "](https://)" },
  { label: "Imagem", icon: ImageIcon, before: "\n![Descrição da imagem](", after: ")\n" },
];

export function RichTextField({ name, label, defaultValue, placeholder, disabled }: RichTextFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(defaultValue ?? "");
  const [tab, setTab] = useState<"write" | "preview">("write");

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
            {/* hidden textarea to keep form name bound when in preview tab */}
            <textarea name={name} value={value} readOnly className="hidden" />
          </div>
        )}
      </div>
      <span className="text-xs leading-5 text-[#7a6543]">
        Use as marcações de títulos (##), negrito (**), citações (&gt;) e listas. A página pública renderiza automaticamente com a tipografia oficial.
      </span>
    </div>
  );
}
