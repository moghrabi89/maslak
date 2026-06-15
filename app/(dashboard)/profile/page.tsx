import { Avatar, AvatarFallback, AvatarImage, Card, CardContent, CardHeader } from "@heroui/react";
import { Award, BookOpen, Mail, Shield, Sparkles, User } from "lucide-react";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { badges, userBadges, userProgress } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { BADGE_CATALOG, checkAndAwardBadges } from "@/lib/gamification";

export default async function ProfilePage() {
  const user = await requireAuth();
  await checkAndAwardBadges(user.id);

  const [completedRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(userProgress)
    .where(and(eq(userProgress.userId, user.id), eq(userProgress.completed, true)));

  const earnedBadges = await db
    .select({
      id: badges.id,
      name: badges.name,
      description: badges.description,
      iconUrl: badges.iconUrl,
      unlockedAt: userBadges.unlockedAt,
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, user.id));

  const earnedIds = new Set(earnedBadges.map((badge) => badge.id));
  const lockedBadges = BADGE_CATALOG.filter((badge) => !earnedIds.has(badge.id));

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-brand-emerald-400 flex items-center gap-2">
          <User className="w-8 h-8" /> ملف طالب العلم
        </h1>
        <p className="text-slate-400 text-sm">إحصاءاتك وشاراتك العلمية المكتسبة من تقدم حقيقي.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-lg bg-slate-900/50 p-3">
                <p className="text-slate-500">XP</p>
                <p className="text-lg font-black text-brand-gold-400">{user.xp}</p>
              </div>
              <div className="rounded-lg bg-slate-900/50 p-3">
                <p className="text-slate-500">الجواهر</p>
                <p className="text-lg font-black text-brand-emerald-400">{user.gems}</p>
              </div>
            </div>
            <div className="rounded-lg bg-slate-900/50 p-3 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> دروس مكتملة
              </span>
              <b className="text-slate-200">{completedRow?.count ?? 0}</b>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-brand-emerald-800/10 text-slate-100 md:col-span-2">
          <CardHeader className="pb-2 border-b border-slate-800/40">
            <h3 className="font-bold text-slate-300 flex items-center gap-1.5 text-sm">
              <Award className="w-4.5 h-4.5 text-brand-gold-500" /> الشارات والألقاب العلمية
            </h3>
          </CardHeader>
          <CardContent className="py-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="p-4 bg-brand-emerald-500/5 border border-brand-emerald-500/20 rounded-xl flex flex-col items-center justify-center text-center"
                >
                  <Sparkles className="w-7 h-7 mb-2 text-brand-gold-400" />
                  <h4 className="font-extrabold text-xs text-slate-100">{badge.name}</h4>
                  <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">{badge.description}</p>
                </div>
              ))}
              {lockedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl flex flex-col items-center justify-center text-center opacity-45"
                >
                  <Award className="w-7 h-7 mb-2 text-slate-500" />
                  <h4 className="font-extrabold text-xs text-slate-300">{badge.name}</h4>
                  <p className="text-[9px] text-slate-500 mt-1 leading-relaxed">{badge.description}</p>
                </div>
              ))}
            </div>

            {earnedBadges.length === 0 && (
              <p className="text-xs text-slate-500 text-center">
                لم تحصل على شارات بعد. أكمل الدروس وراجع أخطاءك لتظهر إنجازاتك هنا.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
