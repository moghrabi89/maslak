import { requireReviewerOrAdmin } from "@/lib/auth";
import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce role authorization (reviewer or admin only)
  const user = await requireReviewerOrAdmin();

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col">
      {/* Admin header */}
      <header className="border-b border-slate-800/80 bg-[#070d1e]/50 backdrop-blur px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 bg-slate-900/60 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all">
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-gold-500" />
            <span className="font-extrabold text-base text-brand-gold-500">لوحة التحكم والتحكيم الشرعي</span>
          </div>
        </div>
        <div className="text-xs text-slate-400">
          المشرف: <b className="text-slate-200">{user.name}</b> ({user.role === "admin" ? "مدير" : "مراجع"})
        </div>
      </header>

      {/* Main admin workspace */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
