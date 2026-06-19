import type { ReactNode } from "react";

export interface SectionGridProps {
  children: ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | "auto";
}

export function SectionGrid({
  children,
  className = "",
  cols = 3,
}: SectionGridProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    auto: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  };

  const selectedCols = typeof cols === "number" ? gridClasses[cols] : gridClasses.auto;

  return (
    <div className={`grid gap-6 ${selectedCols} ${className}`}>
      {children}
    </div>
  );
}
