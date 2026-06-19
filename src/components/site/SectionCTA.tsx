import type { ReactNode } from "react";
import Link from "next/link";

export interface SectionCTAProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "text";
  size?: "sm" | "md" | "lg";
  className?: string;
  target?: string;
  rel?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function SectionCTA({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  target,
  rel,
  icon,
  iconPosition = "right",
  type = "button",
  disabled = false,
}: SectionCTAProps) {
  // Define button colors and styling based on design token centralisation request
  const baseStyles = "inline-flex items-center justify-center font-black uppercase tracking-[0.14em] transition-all duration-200 rounded-lg select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeStyles = {
    sm: "px-4 py-2 text-xs gap-2",
    md: "px-6 py-3 text-sm gap-2.5",
    lg: "px-8 py-4 text-base gap-3",
  };

  const variantStyles = {
    primary: "bg-[#0F3B63] text-white hover:bg-[#1D5A8C] shadow-sm hover:shadow-md active:translate-y-[1px]",
    secondary: "bg-[#D4A24C] text-white hover:bg-[#B8872D] shadow-sm hover:shadow-md active:translate-y-[1px]",
    outline: "border-2 border-[#0F3B63] text-[#0F3B63] hover:bg-[#0F3B63] hover:text-white bg-transparent",
    text: "text-[#0F3B63] hover:text-[#1D5A8C] p-0 font-bold normal-case tracking-normal hover:translate-x-0.5 transition-transform duration-200",
  };

  const content = (
    <>
      {icon && iconPosition === "left" && <span className="flex items-center shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === "right" && <span className="flex items-center shrink-0 transition-transform group-hover:translate-x-0.5">{icon}</span>}
    </>
  );

  const combinedClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`.trim();

  if (href) {
    if (href.startsWith("http") || target === "_blank") {
      return (
        <a
          href={href}
          className={combinedClasses}
          target={target}
          rel={rel ?? (target === "_blank" ? "noreferrer" : undefined)}
          onClick={onClick}
        >
          {content}
        </a>
      );
    }

    return (
      <Link href={href} className={combinedClasses} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={combinedClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </button>
  );
}
