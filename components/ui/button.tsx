"use client";

import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
  onPress?: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
}

const variantMap = {
  primary: "bg-brand-emerald-500 hover:bg-brand-emerald-600 text-slate-950 font-black",
  secondary: "bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200",
  ghost: "bg-transparent hover:bg-slate-800/50 text-slate-300",
};

const sizeMap = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-3 text-xs",
  lg: "px-6 py-4 text-sm",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  href,
  onPress,
  isDisabled,
  isLoading,
}: ButtonProps) {
  const baseClass = `inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all hover:scale-[1.01] ${variantMap[variant]} ${sizeMap[size]} ${className} ${
    isDisabled ? "opacity-50 pointer-events-none" : ""
  }`;

  if (href) {
    return (
      <Link href={href} className={baseClass}>
        {isLoading ? "جاري التحميل..." : children}
      </Link>
    );
  }

  return (
    <button onClick={onPress} disabled={isDisabled || isLoading} className={baseClass}>
      {isLoading ? "جاري التحميل..." : children}
    </button>
  );
}
