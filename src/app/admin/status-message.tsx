"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";

export function StatusMessage({
  success,
  error,
  successMessage,
  autoDismissMs = 4500,
}: {
  success?: string;
  error?: string;
  successMessage?: string;
  autoDismissMs?: number;
}) {
  const [isVisible, setIsVisible] = useState(Boolean(success || error));

  useEffect(() => {
    if (!success && !error) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);

    // 1. Limpa os parâmetros de feedback da URL sem recarregar a página
    try {
      const url = new URL(window.location.href);
      let changed = false;
      if (url.searchParams.has("success")) {
        url.searchParams.delete("success");
        changed = true;
      }
      if (url.searchParams.has("error")) {
        url.searchParams.delete("error");
        changed = true;
      }
      if (url.searchParams.has("message")) {
        url.searchParams.delete("message");
        changed = true;
      }
      if (changed) {
        window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
      }
    } catch {
      // no-op em ambientes sem window
    }

    // 2. Temporizador para fechar a mensagem suavemente
    if (autoDismissMs > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, autoDismissMs);

      return () => clearTimeout(timer);
    }
  }, [success, error, successMessage, autoDismissMs]);

  if (!isVisible || (!success && !error)) {
    return null;
  }

  const isSuccess = Boolean(success);
  const text = isSuccess ? successMessage ?? "Registro salvo com sucesso." : error;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`mb-6 flex items-center justify-between gap-3 border px-4 py-3 text-sm font-semibold shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
        isSuccess
          ? "border-[#00a86b]/40 bg-[#e8fff4] text-[#075f3f]"
          : "border-[#8b2f2b]/40 bg-[#fff1ed] text-[#8b2f2b]"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {isSuccess ? (
          <CheckCircle2 size={18} className="shrink-0 text-[#00a86b]" />
        ) : (
          <AlertCircle size={18} className="shrink-0 text-[#8b2f2b]" />
        )}
        <span className="truncate">{text}</span>
      </div>

      <button
        type="button"
        onClick={() => setIsVisible(false)}
        className="ml-2 shrink-0 p-1 opacity-70 hover:opacity-100 transition rounded hover:bg-black/5"
        title="Fechar mensagem"
        aria-label="Fechar mensagem"
      >
        <X size={16} />
      </button>
    </div>
  );
}
