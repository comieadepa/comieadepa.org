import type { ReactNode } from "react";

export interface SectionContainerProps {
  children: ReactNode;
  className?: string;
  size?: "default" | "tight" | "wide";
}

export function SectionContainer({
  children,
  className = "",
  size = "default",
}: SectionContainerProps) {
  const sizeClasses = {
    tight: "max-w-4xl",
    default: "max-w-6xl",
    wide: "max-w-7xl",
  };

  return (
    <section className={`mx-auto w-full px-5 py-12 sm:px-8 ${sizeClasses[size]} ${className}`}>
      {children}
    </section>
  );
}
