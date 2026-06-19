import type { ReactNode } from "react";

export interface SectionTitleProps {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}

export function SectionTitle({
  children,
  className = "",
  as = "h2",
}: SectionTitleProps) {
  const Tag = as;
  
  const sizeClasses = {
    h1: "text-4xl sm:text-6xl font-black",
    h2: "text-3xl sm:text-4xl font-bold",
    h3: "text-2xl sm:text-3xl font-bold",
  };

  return (
    <Tag
      className={`font-serif text-[#0F3B63] tracking-tight leading-tight ${sizeClasses[as]} ${className}`}
    >
      {children}
    </Tag>
  );
}
