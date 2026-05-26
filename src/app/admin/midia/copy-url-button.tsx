"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type CopyUrlButtonProps = {
  value: string;
};

export function CopyUrlButton({ value }: CopyUrlButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copyUrl}
      className="inline-flex items-center justify-center gap-2 bg-[#f4cf6a] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#171006] transition hover:bg-[#ffe28a]"
    >
      {copied ? <Check size={15} /> : <Copy size={15} />}
      {copied ? "Copiado" : "Copiar URL"}
    </button>
  );
}
