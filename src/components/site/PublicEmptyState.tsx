/**
 * PublicEmptyState — consistent empty state for public module pages.
 * Renders a centred card with an icon, title and optional description.
 */
import type { ReactNode } from "react";
import { FileSearch } from "lucide-react";

export interface PublicEmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
}

export function PublicEmptyState({
  title = "Nenhum resultado encontrado",
  description = "Assim que novos registros forem publicados pelo painel, esta página será atualizada automaticamente.",
  icon,
}: PublicEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-[#0F3B63]/8 bg-[#F8FAFC] px-8 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0F3B63]/6 text-[#0F3B63]/40">
        {icon ?? <FileSearch size={28} />}
      </div>
      <div className="max-w-sm space-y-2">
        <p className="font-serif text-lg font-bold text-[#0F3B63]">{title}</p>
        <p className="text-sm leading-6 text-[#6B7280]">{description}</p>
      </div>
    </div>
  );
}
