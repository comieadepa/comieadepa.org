"use client";

import { Bold, Heading2, ImageIcon, Italic, LinkIcon, List, Quote } from "lucide-react";
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
    <label className="grid gap-2">
      <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5a472c]">{label}</span>
      <div className="overflow-hidden border border-[#d8c38b] bg-[#fffaf0]">
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
      </div>
      <span className="text-xs leading-5 text-[#7a6543]">
        Use os botões para inserir marcações simples. A página pública renderiza títulos, listas, citações, links e imagens.
      </span>
    </label>
  );
}
