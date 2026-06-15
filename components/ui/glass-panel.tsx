"use client";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassPanel({ children, className = "" }: GlassPanelProps) {
  return (
    <div
      className={`bg-[#0b1429]/90 border border-brand-emerald-800/20 rounded-2xl p-5 shadow-lg shadow-emerald-950/10 relative overflow-hidden hover:border-brand-emerald-700/30 transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}
