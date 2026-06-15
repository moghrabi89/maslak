import { requireAuth } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce auth check and obtain the user profile
  const user = await requireAuth();

  return (
    <div className="flex min-h-screen bg-[#030712] text-slate-100 overflow-hidden">
      {/* Sidebar Navigation - Right side in RTL */}
      <Sidebar userRole={user.role} />

      {/* Main Content Area - Left side */}
      <main className="flex-1 overflow-y-auto h-screen relative bg-[#030712]">
        {/* Subtle decorative glow circles */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 min-h-full flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}

