import { Avatar, AvatarFallback, AvatarImage, Card, CardContent, CardHeader } from "@heroui/react";
import { Medal, Star, Trophy, Calendar, Filter } from "lucide-react";
import { desc, eq, sql, gte } from "drizzle-orm";
import { db } from "@/db";
import { userProgress, users } from "@/db/schema";
import { requireAuth } from "@/lib/auth";

function weekAgo(): Date {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string | string[]; period?: string | string[] }>;
}) {
  const currentUser = await requireAuth();
  const query = await searchParams;
  const levelFilter = Array.isArray(query.level) ? query.level[0] : query.level;
  const periodFilter = Array.isArray(query.period) ? query.period[0] : query.period;
  const safeLevel = levelFilter === "mvp" || levelFilter === "level0" || levelFilter === "level1" ? levelFilter : "all";
  const safePeriod = periodFilter === "weekly" ? "weekly" : "all";

  // Build the query
  const conditions = [];
  if (safePeriod === "weekly") {
    conditions.push(gte(userProgress.completedAt, weekAgo()));
  }

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      avatarUrl: users.avatarUrl,
      xp: users.xp,
      completedLessons: sql<number>`count(*) filter (where ${userProgress.completed} = true)::int`,
    })
    .from(users)
    .leftJoin(userProgress, eq(users.id, userProgress.userId))
    .groupBy(users.id, users.name, users.avatarUrl, users.xp)
    .orderBy(desc(users.xp))
    .limit(20);

  let leaders = rows;
  if (safeLevel === "mvp") {
    leaders = rows.filter((row) => row.completedLessons <= 6);
  } else if (safeLevel === "level0") {
    leaders = rows.filter((row) => row.completedLessons > 6 && row.completedLessons <= 12);
  } else if (safeLevel === "level1") {
    leaders = rows.filter((row) => row.completedLessons > 12);
  }

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-brand-gold-500 flex items-center gap-2">
          <Trophy className="w-8 h-8" /> لوحة التنافس العلمي
        </h1>
        <p className="text-slate-400 text-sm">
          ترتيب مبني على XP الحقيقي من الدروس والتحديات والمراجعات، مع فلترة تمنع خلط المبتدئ بالمتقدم.
        </p>
      </div>

      {/* Filters row: Level filter + Period filter */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Level filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-slate-500" />
          <a
            href="/leaderboard?level=all"
            className={`rounded-lg border px-3 py-2 text-xs font-bold ${
              safeLevel === "all"
                ? "border-brand-gold-500/30 bg-brand-gold-500/10 text-brand-gold-300"
                : "border-slate-800 bg-slate-950/50 text-slate-400"
            }`}
          >
            كل المستويات
          </a>
          <a
            href="/leaderboard?level=mvp"
            className={`rounded-lg border px-3 py-2 text-xs font-bold ${
              safeLevel === "mvp"
                ? "border-brand-emerald-500/30 bg-brand-emerald-500/10 text-brand-emerald-300"
                : "border-slate-800 bg-slate-950/50 text-slate-400"
            }`}
          >
            تمهيدي (0-6)
          </a>
          <a
            href="/leaderboard?level=level0"
            className={`rounded-lg border px-3 py-2 text-xs font-bold ${
              safeLevel === "level0"
                ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
                : "border-slate-800 bg-slate-950/50 text-slate-400"
            }`}
          >
            المستوى 0 (7-12)
          </a>
          <a
            href="/leaderboard?level=level1"
            className={`rounded-lg border px-3 py-2 text-xs font-bold ${
              safeLevel === "level1"
                ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
                : "border-slate-800 bg-slate-950/50 text-slate-400"
            }`}
          >
            المستوى 1 (13+)
          </a>
        </div>

        {/* Period filter */}
        <div className="flex items-center gap-1.5 mr-auto">
          <Calendar className="w-4 h-4 text-slate-500" />
          <a
            href={`/leaderboard?level=${safeLevel}&period=all`}
            className={`rounded-lg border px-3 py-2 text-xs font-bold ${
              safePeriod === "all"
                ? "border-brand-gold-500/30 bg-brand-gold-500/10 text-brand-gold-300"
                : "border-slate-800 bg-slate-950/50 text-slate-400"
            }`}
          >
            كل الأوقات
          </a>
          <a
            href={`/leaderboard?level=${safeLevel}&period=weekly`}
            className={`rounded-lg border px-3 py-2 text-xs font-bold ${
              safePeriod === "weekly"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-slate-800 bg-slate-950/50 text-slate-400"
            }`}
          >
            هذا الأسبوع
          </a>
        </div>
      </div>

      <Card className="glass-panel border-brand-gold-800/10 text-slate-100">
        <CardHeader className="border-b border-brand-gold-900/10 pb-4 flex justify-between items-center">
          <span className="font-bold text-slate-300">الترتيب الحالي</span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-brand-gold-500/10 text-brand-gold-400 border border-brand-gold-500/20 font-semibold">
            {safeLevel === "mvp" ? "تمهيدي" : safeLevel === "level0" ? "المستوى 0" : safeLevel === "level1" ? "المستوى 1" : "عام"}
            {safePeriod === "weekly" ? " - أسبوعي" : ""}
          </span>
        </CardHeader>
        <CardContent className="py-4 divide-y divide-slate-800/50">
          {leaders.length > 0 ? (
            leaders.map((student, index) => {
              const rank = index + 1;
              const isMe = student.id === currentUser.id;
              return (
                <div
                  key={student.id}
                  className={`flex items-center justify-between py-4 ${
                    isMe ? "bg-brand-emerald-500/5 px-3 rounded-xl border border-brand-emerald-500/10 my-1" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 flex justify-center items-center">
                      {rank === 1 ? (
                        <Trophy className="w-6 h-6 text-brand-gold-500" />
                      ) : rank <= 3 ? (
                        <Medal className="w-6 h-6 text-slate-300" />
                      ) : (
                        <span className="text-slate-500 font-bold text-sm">#{rank}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 text-slate-200 flex items-center justify-center">
                        {student.avatarUrl && <AvatarImage src={student.avatarUrl} />}
                        <AvatarFallback>{student.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className={`font-bold text-sm ${isMe ? "text-brand-emerald-400" : "text-slate-200"}`}>
                          {student.name}
                        </h3>
                        <p className="text-[10px] text-slate-500">دروس مكتملة: {student.completedLessons}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-brand-gold-400">{student.xp}</span>
                    <span className="text-xs text-slate-500 font-medium">XP</span>
                    <Star className="w-3.5 h-3.5 text-brand-gold-500 fill-brand-gold-500/30" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-10 text-center text-sm text-slate-500">لا توجد بيانات صدارة لهذا المرشح بعد.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
