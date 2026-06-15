"use client";

interface ProgressBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({ value, className = "", showLabel, label }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={`space-y-1 ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-[10px] font-bold text-slate-400">
          <span>{label || "التقدم:"}</span>
          <span className="text-brand-emerald-400">{clamped}%</span>
        </div>
      )}
      <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-850">
        <div
          className="bg-brand-emerald-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
