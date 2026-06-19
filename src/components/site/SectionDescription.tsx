import type { ReactNode } from "react";

export interface SectionDescriptionProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "base" | "lg";
}

export function SectionDescription({
  children,
  className = "",
  size = "base",
}: SectionDescriptionProps) {
  const sizeClasses = {
    sm: "text-sm leading-6 text-[#6B7280]",
    base: "text-base leading-7 text-[#4B5563]",
    lg: "text-lg leading-8 text-[#4B5563]",
  };

  return (
    <p className={`${sizeClasses[size]} ${className}`}>
      {children}
    </p>
  );
}
