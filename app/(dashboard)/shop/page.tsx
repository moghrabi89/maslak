import { Button, Card, CardContent, CardHeader } from "@heroui/react";
import { Award, Flame, Gem, ShieldAlert, Sparkles } from "lucide-react";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { badges, userBadges } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { BADGE_CATALOG, checkAndAwardBadges } from "@/lib/gamification";

export default async function ShopPage() {
  const user = await requireAuth();
  await checkAndAwardBadges(user.id);

  const earnedBadges = await db
    .select({ badgeId: userBadges.badgeId })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(and(eq(userBadges.userId, user.id)));

  const earnedIds = new Set(earnedBadges.map((badge) => badge.badgeId));

  const shopItems = [
    {
      title: "تجميد الحماس",
      description: "ميزة مخطط لها لحماية سلسلة النشاط عند الغياب يوما واحدا.",
      cost: 50,
      icon: Flame,
      iconColor: "text-orange-500",
      available: false,
    },
    {
      title: "درع إعادة المحاولة",
      description: "ميزة مستقبلية لإعادة محاولة تحدي متعثر دون فقدان الإيقاع التعليمي.",
      cost: 80,
      icon: ShieldAlert,
      iconColor: "text-brand-emerald-400",
      available: false,
    },
  ];

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div className="space-y-2 flex flex-col gap-3 md:flex-row md:justify-between md:items-start">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-gold-500 flex items-center gap-2">
            <Gem className="w-8 h-8" /> متجر الفوائد العلمية
          </h1>
          <p className="text-slate-400 text-sm">
            الجواهر مكافأة مساندة، والشارات العلمية تمنح تلقائيا عند تحقق شروطها.
          </p>
        </div>
        <div className="rounded-xl border border-brand-gold-500/20 bg-brand-gold-500/10 px-4 py-3 text-brand-gold-200 text-sm font-black">
          رصيدك: {user.gems} جوهرة
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-panel border-brand-emerald-800/10 text-slate-100 lg:col-span-2">
          <CardHeader className="pb-2 border-b border-slate-800/40">
            <h3 className="font-bold text-slate-300 flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-gold-500" /> الشارات العلمية
            </h3>
          </CardHeader>
          <CardContent className="py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BADGE_CATALOG.map((badge) => {
              const earned = earnedIds.has(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`rounded-xl border p-4 ${
                    earned
                      ? "border-brand-emerald-500/25 bg-brand-emerald-500/10"
                      : "border-slate-800 bg-slate-900/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className={`w-5 h-5 mt-0.5 ${earned ? "text-brand-gold-400" : "text-slate-500"}`} />
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-200">{badge.name}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">{badge.description}</p>
                      <span
                        className={`inline-flex mt-3 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                          earned
                            ? "border-brand-emerald-500/30 text-brand-emerald-300"
                            : "border-slate-700 text-slate-500"
                        }`}
                      >
                        {earned ? "مكتسبة" : "تُمنح تلقائيا"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="glass-panel border-brand-gold-800/10 text-slate-100">
          <CardHeader className="pb-2 border-b border-slate-800/40">
            <h3 className="font-bold text-slate-300">مزايا مستقبلية</h3>
          </CardHeader>
          <CardContent className="py-5 space-y-4">
            {shopItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-slate-950/60 ${item.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-200">{item.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{item.cost} جوهرة</span>
                    <Button
                      isDisabled={!item.available}
                      className="rounded-lg bg-slate-800 text-slate-500 text-xs font-bold cursor-not-allowed"
                    >
                      قريبا
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
