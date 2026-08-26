"use client";

import { AlertTriangle, Lock, Trash2, X, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import type { AdminNavGroup, AdminNavItem } from "@/lib/cms";

const unlockedRoutes = new Set([
  "/admin",
  "/admin/home",
  "/admin/noticias",
  "/admin/usuarios",
]);

function isRouteActive(item: AdminNavItem, currentPath: string): boolean {
  if (item.href === "/admin") {
    return currentPath === "/admin" || currentPath === "/admin/";
  }

  if (currentPath === item.href || currentPath.startsWith(`${item.href}/`)) {
    return true;
  }

  if (item.subItems && item.subItems.some((sub) => currentPath === sub.href || currentPath.startsWith(`${sub.href}/`))) {
    return true;
  }

  if (item.href === "/admin/noticias" && (currentPath.startsWith("/admin/categorias") || currentPath.startsWith("/admin/preview/noticias"))) {
    return true;
  }

  return false;
}

export function AdminSidebarNav({ groups }: { groups: AdminNavGroup[] }) {
  const pathname = usePathname() || "";

  return (
    <nav className="mt-6 flex-1 space-y-6 overflow-y-auto">
      {groups.map((group) => (
        <div key={group.id} className="space-y-1.5">
          {group.title ? (
            <p className="px-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#f4cf6a]/70">
              {group.title}
            </p>
          ) : null}

          <div className="grid gap-1">
            {group.items.map((item) => {
              const isUnlocked = unlockedRoutes.has(item.href);
              const isItemActive = isRouteActive(item, pathname);

              if (!isUnlocked) {
                return (
                  <div
                    key={item.href}
                    title="Módulo em fase de homologação"
                    className="flex items-center justify-between rounded-sm px-3.5 py-2.5 text-sm font-semibold text-white/28 cursor-not-allowed select-none transition hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className="text-white/20" />
                      <span>{item.label}</span>
                    </div>
                    <Lock size={12} className="text-white/20" />
                  </div>
                );
              }

              return (
                <div key={item.href} className="space-y-1">
                  <Link
                    href={item.href}
                    className={`group flex items-center justify-between rounded-sm border px-3.5 py-2.5 text-sm font-bold transition ${
                      isItemActive
                        ? "border-[#f4cf6a]/60 bg-[#f4cf6a]/15 text-white shadow-sm"
                        : "border-transparent text-white/80 hover:border-white/10 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        size={18}
                        className={isItemActive ? "text-[#f4cf6a]" : "text-white/60 group-hover:text-[#f4cf6a]"}
                      />
                      <span className="flex-1">{item.label}</span>
                    </div>
                    {isItemActive && (
                      <span className="rounded bg-[#f4cf6a] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#171006]">
                        Ativo
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

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
    inativo: { label: "Inativo", className: "bg-stone-200 text-stone-700 border border-stone-300" },
  };

  const current = map[status] ?? { label: status, className: "bg-stone-200 text-stone-700 border border-stone-300" };

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

        const pillClass = `inline-flex items-center px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.12em] transition border ${
          isActive
            ? "bg-[#171006] text-[#F8D77B] !text-[#F8D77B] border-[#171006] shadow-sm"
            : "border-[#d8c38b] bg-[#fffaf0] text-[#5a472c] !text-[#5a472c] hover:bg-[#f7efd6]"
        }`;

        if (onSelect || !href) {
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect?.(option.value)}
              className={pillClass}
            >
              <span>{option.label}</span>
              {typeof option.count === "number" ? <span className="ml-1.5 opacity-80">({option.count})</span> : null}
            </button>
          );
        }

        return (
          <Link
            key={option.value}
            href={href}
            className={pillClass}
          >
            <span>{option.label}</span>
            {typeof option.count === "number" ? <span className="ml-1.5 opacity-80">({option.count})</span> : null}
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

export function AdminConfirmModal({
  isOpen,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md border border-[#d8c38b] bg-[#fffaf0] p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 p-1 text-[#5a472c]/70 hover:text-[#8b2f2b] transition"
          title="Fechar"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`grid h-12 w-12 shrink-0 place-items-center ${
              variant === "danger"
                ? "bg-[#8b2f2b]/10 text-[#8b2f2b] border border-[#8b2f2b]/30"
                : variant === "warning"
                ? "bg-amber-500/10 text-amber-700 border border-amber-500/30"
                : "bg-[#0F3B63]/10 text-[#0F3B63] border border-[#0F3B63]/30"
            }`}
          >
            {variant === "danger" ? (
              <Trash2 size={22} />
            ) : (
              <AlertTriangle size={22} />
            )}
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="font-serif text-lg font-bold text-[#171006]">
              {title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#5a472c]">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#d8c38b]/60 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="border border-[#d8c38b] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#5a472c] transition hover:bg-[#f7efd6] disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 text-xs font-black uppercase tracking-[0.14em] text-white shadow-sm transition disabled:opacity-50 ${
              variant === "danger"
                ? "bg-[#8b2f2b] hover:bg-[#6e2421]"
                : variant === "warning"
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-[#0F3B63] hover:bg-[#1D5A8C]"
            }`}
          >
            {isLoading ? "Processando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
