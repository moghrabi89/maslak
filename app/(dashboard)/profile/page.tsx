import { requireAuth } from "@/lib/auth";
import { Card, CardHeader, CardContent, Avatar, AvatarImage, AvatarFallback } from "@heroui/react";
import { User, Award, Shield, Mail } from "lucide-react";

export default async function ProfilePage() {
  const user = await requireAuth();

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-brand-emerald-400 flex items-center gap-2">
          <User className="w-8 h-8" /> ملف طالب العلم 👤
        </h1>
        <p className="text-slate-400 text-sm">استعرض إحصائياتك ومستواك العلمي والشارات العلمية التي حصلت عليها.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User profile card */}
        <Card className="glass-panel border-brand-emerald-800/10 text-slate-100 md:col-span-1">
          <CardHeader className="flex flex-col items-center pt-8 pb-4 border-b border-slate-800/40">
            <Avatar className="w-24 h-24 rounded-full border-2 border-brand-emerald-500 shadow-lg shadow-emerald-500/20 bg-slate-800 text-slate-200 text-3xl mb-4 flex items-center justify-center">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
              <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <h2 className="font-extrabold text-lg text-slate-200">{user.name}</h2>
            <span className="px-2.5 py-0.5 mt-2 rounded-full text-[10px] font-bold bg-brand-emerald-500/10 text-brand-emerald-400 border border-brand-emerald-500/25">
              {user.role === "admin" ? "مدير النظام" : user.role === "reviewer" ? "مراجع فقهي" : "طالب علم"}
            </span>
          </CardHeader>
          <CardContent className="py-4 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Mail className="w-4 h-4 text-slate-500" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Shield className="w-4 h-4 text-slate-500" />
              <span>المعرف: {user.id.slice(0, 15)}...</span>
            </div>
          </CardContent>
        </Card>

        {/* Badges and records */}
        <Card className="glass-panel border-brand-emerald-800/10 text-slate-100 md:col-span-2">
          <CardHeader className="pb-2 border-b border-slate-800/40">
            <h3 className="font-bold text-slate-300 flex items-center gap-1.5 text-sm">
              <Award className="w-4.5 h-4.5 text-brand-gold-500" /> الشارات والألقاب العلمية
            </h3>
          </CardHeader>
          <CardContent className="py-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Unlocked badges placeholder */}
              <div className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl flex flex-col items-center justify-center text-center opacity-40">
                <span className="text-3xl mb-2">💧</span>
                <h4 className="font-extrabold text-xs text-slate-300">فقيه الوضوء</h4>
                <p className="text-[9px] text-slate-500 mt-1">أكمل تحدي الطهارة بنسبة 100%</p>
              </div>

              <div className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl flex flex-col items-center justify-center text-center opacity-40">
                <span className="text-3xl mb-2">🔥</span>
                <h4 className="font-extrabold text-xs text-slate-300">المثابر اليومي</h4>
                <p className="text-[9px] text-slate-500 mt-1">حافظ على Streak لمدة 7 أيام</p>
              </div>

              <div className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl flex flex-col items-center justify-center text-center opacity-40">
                <span className="text-3xl mb-2">📚</span>
                <h4 className="font-extrabold text-xs text-slate-300">أول خطوة</h4>
                <p className="text-[9px] text-slate-500 mt-1">أكمل أول درس في سفينة النجاة</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 text-center mt-6">
              لم تحصل على أي شارات علمية بعد. ابدأ دراسة الدروس وحل التحديات لتحصيل الألقاب.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
