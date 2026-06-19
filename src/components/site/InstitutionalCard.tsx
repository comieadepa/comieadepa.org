import type { ComponentType } from "react";

interface InstitutionalCardProps {
  badge?: string;
  title: string;
  description: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  className?: string;
}

export function InstitutionalCard({ badge, title, description, icon: Icon, className = "" }: InstitutionalCardProps) {
  return (
    <article className={`group flex flex-col justify-between border border-[#0F3B63]/10 bg-white p-6 shadow-[0_4px_20px_rgba(15,59,99,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(15,59,99,0.08)] ${className}`}>
      <div>
        {Icon && (
          <span className="mb-4 inline-grid h-10 w-10 place-items-center bg-[#F4F6F8] text-[#B8872D] transition-colors duration-300 group-hover:bg-[#0F3B63]/5">
            <Icon size={20} />
          </span>
        )}
        {badge && (
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B8872D]">
            {badge}
          </p>
        )}
        <h3 className="mt-2 font-serif text-xl font-bold leading-tight text-[#0F3B63]">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">
          {description}
        </p>
      </div>
    </article>
  );
}
