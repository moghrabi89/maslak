"use client";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

const variantStyles = {
  default: "bg-slate-800 text-slate-300 border-slate-700",
  success: "bg-brand-emerald-500/10 text-brand-emerald-400 border-brand-emerald-500/30",
  warning: "bg-brand-gold-500/10 text-brand-gold-400 border-brand-gold-500/30",
  danger: "bg-red-500/10 text-red-400 border-red-500/30",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-bold ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
