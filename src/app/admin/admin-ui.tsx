import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

export function AdminPageHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="mb-6 border border-[#d8c38b] bg-white/76 p-6 shadow-[0_18px_50px_rgba(23,16,6,.08)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="grid h-14 w-14 shrink-0 place-items-center bg-[#171006] text-[#f4cf6a]">
            <Icon size={27} />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8b2f2b]">{eyebrow}</p>
            <h1 className="mt-2 font-serif text-3xl font-black leading-tight sm:text-4xl">{title}</h1>
            <p className="mt-3 max-w-4xl leading-7 text-[#5a472c]">{description}</p>
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </section>
  );
}

export function AdminSubNavTabs({
  tabs,
}: {
  tabs: Array<{ href: string; label: string; active: boolean }>;
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-2 border-b border-[#d8c38b] pb-3">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`px-3.5 pb-2 text-xs uppercase tracking-[0.16em] transition ${
            tab.active
              ? "border-b-2 border-[#8b2f2b] font-black text-[#8b2f2b]"
              : "font-bold text-[#5a472c]/70 hover:text-[#8b2f2b]"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

export function AdminStatusBadge({
  status,
}: {
  status: "publicado" | "rascunho" | "revisao" | "agendado" | "arquivado" | "ativo" | "inativo" | string;
}) {
  const map: Record<string, { label: string; className: string }> = {
    publicado: { label: "Publicado", className: "bg-[#00b67a] text-white" },
    ativo: { label: "Ativo", className: "bg-[#00b67a] text-white" },
    rascunho: { label: "Rascunho", className: "bg-amber-600/90 text-white" },
    revisao: { label: "Em revisão", className: "bg-blue-600/90 text-white" },
    agendado: { label: "Agendado", className: "bg-purple-600/90 text-white" },
    arquivado: { label: "Arquivado", className: "bg-slate-500 text-white" },
    inativo: { label: "Inativo", className: "bg-white/10 text-white/50 border border-white/10" },
  };

  const current = map[status] ?? { label: status, className: "bg-white/10 text-white/70" };

  return (
    <span className={`inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${current.className}`}>
      {current.label}
    </span>
  );
}

export function AdminFilterPills({
  current,
  options,
  baseUrl,
  paramName = "status",
  onSelect,
}: {
  current: string;
  options: Array<{ value: string; label: string; count?: number }>;
  baseUrl?: string;
  paramName?: string;
  onSelect?: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = current === option.value;
        const href = baseUrl ? (option.value === "todos" ? baseUrl : `${baseUrl}?${paramName}=${option.value}`) : undefined;

        if (onSelect || !href) {
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect?.(option.value)}
              className={`px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] transition ${
                isActive
                  ? "bg-[#f4cf6a] text-[#171006]"
                  : "border border-white/10 text-white/54 hover:border-[#f4cf6a] hover:text-[#f4cf6a]"
              }`}
            >
              {option.label}
              {typeof option.count === "number" ? <span className="ml-1.5 opacity-60">({option.count})</span> : null}
            </button>
          );
        }

        return (
          <Link
            key={option.value}
            href={href}
            className={`px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] transition ${
              isActive
                ? "bg-[#f4cf6a] text-[#171006]"
                : "border border-white/10 text-white/54 hover:border-[#f4cf6a] hover:text-[#f4cf6a]"
            }`}
          >
            {option.label}
            {typeof option.count === "number" ? <span className="ml-1.5 opacity-60">({option.count})</span> : null}
          </Link>
        );
      })}
    </div>
  );
}

export function AdminEmptyState({
  message,
  title,
  description,
}: {
  message?: string;
  title?: string;
  description?: string;
}) {
  const displayTitle = title || message || "Nenhum registro encontrado";
  return (
    <div className="mt-8 border border-white/10 bg-white/[0.055] p-8 text-center text-white/62">
      <p className="font-serif text-lg font-bold text-white/80">{displayTitle}</p>
      {description ? <p className="mt-2 text-sm text-white/50">{description}</p> : null}
    </div>
  );
}
