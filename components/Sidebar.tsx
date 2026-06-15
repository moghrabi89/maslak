"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Compass, 
  BookOpen, 
  Trophy, 
  Gem, 
  RefreshCw, 
  User, 
  ShieldCheck,
  BarChart3,
  LogOut 
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";

interface SidebarProps {
  userRole: "admin" | "reviewer" | "student";
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "شجرة التقدم",
      href: "/dashboard",
      icon: Compass,
    },
    {
      name: "خزانة المتون",
      href: "/books",
      icon: BookOpen,
    },
    {
      name: "لوحة الصدارة",
      href: "/leaderboard",
      icon: Trophy,
    },
    {
      name: "متجر الفقه",
      href: "/shop",
      icon: Gem,
    },
    {
      name: "المراجعة الذكية",
      href: "/review",
      icon: RefreshCw,
    },
    {
      name: "الملف الشخصي",
      href: "/profile",
      icon: User,
    },
  ];

  // Admin and Reviewer routes
  const adminItems = [];
  if (userRole === "admin" || userRole === "reviewer") {
    adminItems.push({
      name: "إدارة المحتوى",
      href: "/admin/content",
      icon: ShieldCheck,
    });
    adminItems.push({
      name: "مراجعة واعتماد",
      href: "/admin/review",
      icon: ShieldCheck,
    });
    adminItems.push({
      name: "تحليلات تعليمية",
      href: "/admin/analytics",
      icon: BarChart3,
    });
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 border-l border-slate-800/80 bg-[#070d1e]/85 backdrop-blur-md flex flex-col h-screen sticky top-0 font-sans">
      {/* Platform Branding */}
      <div className="p-6 border-b border-slate-800/60">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="text-3xl">🧭</span>
          <div className="flex flex-col">
            <span className="font-black text-xl text-brand-emerald-500 tracking-wide">مَسْلَك</span>
            <span className="text-xs text-slate-400">دَرْبُ الشَّافِعِيِّ</span>
          </div>
        </Link>
      </div>

      {/* Main Menu Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">القائمة الرئيسية</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative ${
                active 
                  ? "bg-brand-emerald-500/10 text-brand-emerald-400 border border-brand-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border border-transparent"
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${active ? "text-brand-emerald-400" : "text-slate-400 group-hover:text-slate-300"}`} />
              <span>{item.name}</span>
              {active && (
                <div className="absolute right-0 top-1/4 w-1 h-1/2 bg-brand-emerald-500 rounded-l-full" />
              )}
            </Link>
          );
        })}

        {/* Admin Section */}
        {adminItems.length > 0 && (
          <div className="pt-6 mt-6 border-t border-slate-800/50">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">لوحة التحكم الفقهي</p>
            {adminItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative ${
                    active 
                      ? "bg-brand-gold-500/10 text-brand-gold-400 border border-brand-gold-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border border-transparent"
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${active ? "text-brand-gold-400" : "text-slate-400 group-hover:text-slate-300"}`} />
                  <span>{item.name}</span>
                  {active && (
                    <div className="absolute right-0 top-1/4 w-1 h-1/2 bg-brand-gold-500 rounded-l-full" />
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* User Footer / Log Out */}
      <div className="p-4 border-t border-slate-800/60 bg-[#050916]/40">
        <SignOutButton>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 border border-transparent transition-all cursor-pointer group">
            <LogOut className="w-5 h-5 text-rose-400 transition-transform group-hover:translate-x-1" />
            <span>تسجيل الخروج</span>
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}
