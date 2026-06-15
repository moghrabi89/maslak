import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { lessons, skills, units, userProgress, users, challengeSessions, reviewQueue, conceptBank } from "@/db/schema";
import { Card, CardHeader, CardContent } from "@heroui/react";
import { eq, and, asc, desc, lte } from "drizzle-orm";
import Link from "next/link";
import { 
  Lock, 
  CheckCircle2, 
  PlayCircle, 
  Sparkles, 
  AlertCircle, 
  Trophy, 
  RotateCcw, 
  Compass, 
  ChevronLeft,
  GraduationCap
} from "lucide-react";

type LeaderboardUser = {
  id: string;
  name: string;
  xp: number;
  avatarUrl: string | null;
};

export default async function DashboardPage() {
  const user = await requireAuth();

  const bookId = "safina"; // MVP Book

  // Allow admins and reviewers to see drafts on the dashboard for testing
  const showDrafts = user.role === "admin" || user.role === "reviewer";

  // 1. Fetch all lessons of the book Safina
  const rawLessons = await db
    .select({
      id: lessons.id,
      title: lessons.title,
      order: lessons.order,
      status: lessons.status,
      skillTitle: skills.title,
      skillId: lessons.skillId
    })
    .from(lessons)
    .innerJoin(skills, eq(lessons.skillId, skills.id))
    .innerJoin(units, eq(skills.unitId, units.id))
    .where(eq(units.bookId, bookId))
    .orderBy(asc(lessons.order));

  // Filter lessons based on role and status
  const filteredLessons = rawLessons.filter(
    (l) => l.status === "published" || (showDrafts && l.status !== "archived")
  );

  // 2. Fetch user completed lessons
  const progressList = await db
    .select()
    .from(userProgress)
    .where(and(eq(userProgress.userId, user.id), eq(userProgress.completed, true)));

  const completedLessonIds = new Set(progressList.map((p) => p.lessonId));

  // 3. Fetch review queue to identify concepts that "Need Review"
  const queueItems = await db
    .select()
    .from(reviewQueue)
    .where(and(eq(reviewQueue.userId, user.id), lte(reviewQueue.nextReviewAt, new Date())));

  // Map concepts in queue to their corresponding lessons
  const conceptToLessonMap = new Map<string, string>();
  // Fetch concepts to link conceptId -> lessonId
  const dbConcepts = await db.select().from(conceptBank);
  dbConcepts.forEach(c => {
    conceptToLessonMap.set(c.id, c.lessonId);
  });

  const lessonsNeedingReview = new Set<string>();
  queueItems.forEach(item => {
    const lessonId = conceptToLessonMap.get(item.conceptId);
    if (lessonId) {
      lessonsNeedingReview.add(lessonId);
    }
  });

  // 4. Process lock and status states for Skill Tree
  const lessonsWithStates = filteredLessons.map((lesson, index) => {
    const isCompleted = completedLessonIds.has(lesson.id);
    const needsReview = lessonsNeedingReview.has(lesson.id);
    let isLocked = false;
    
    if (index > 0) {
      const prevLesson = filteredLessons[index - 1];
      const prevCompleted = completedLessonIds.has(prevLesson.id);
      isLocked = !prevCompleted;
    }

    return {
      ...lesson,
      isCompleted,
      isLocked,
      needsReview
    };
  });

  // 5. Fetch leaderboard users from DB
  const dbUsers = await db.select().from(users).orderBy(desc(users.xp)).limit(3);
  
  // Ensure we have at least 3 users on the leaderboard. If not, append legendary mock Shafi'i students
  const leaderboard: LeaderboardUser[] = dbUsers.map((dbUser) => ({
    id: dbUser.id,
    name: dbUser.name,
    xp: dbUser.xp,
    avatarUrl: dbUser.avatarUrl,
  }));
  const mockStudents: LeaderboardUser[] = [
    { id: "mock_1", name: "إمام الحرمين الجويني", xp: 1820, avatarUrl: null },
    { id: "mock_2", name: "أبو إسحاق الشيرازي", xp: 1450, avatarUrl: null },
    { id: "mock_3", name: "طالب الفقه المبتدئ", xp: 120, avatarUrl: null }
  ];
  
  while (leaderboard.length < 3) {
    const mock = mockStudents[leaderboard.length];
    leaderboard.push(mock);
  }

  // Sort again in case of mock overlaps
  leaderboard.sort((a, b) => b.xp - a.xp);

  // 6. Fetch last attempted session to resume lesson
  const [lastSession] = await db
    .select()
    .from(challengeSessions)
    .where(eq(challengeSessions.userId, user.id))
    .orderBy(desc(challengeSessions.startedAt))
    .limit(1);

  let resumeLessonId = filteredLessons[0]?.id || "";
  let resumeLessonTitle = filteredLessons[0]?.title || "علامات البلوغ";
  
  if (lastSession) {
    const attemptedLesson = filteredLessons.find(l => l.id === lastSession.lessonId);
    if (attemptedLesson) {
      resumeLessonId = attemptedLesson.id;
      resumeLessonTitle = attemptedLesson.title;
    }
  }

  // 7. Calculate book completion percentage
  const totalLessons = filteredLessons.length;
  const completedLessons = lessonsWithStates.filter(l => l.isCompleted).length;
  const completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // 8. Dynamic Wise Hoopoe messages based on performance
  let hoopoeGreeting = `مرحباً بك يا طالب العلم! العلم صيد، والكتابة قيده. ينصحك الهدهد الحكيم بدراسة درسك النشط اليوم وتجنب التعثر الفقهي.`;
  if (queueItems.length > 0) {
    hoopoeGreeting = `أهلاً بك يا ${user.name}! يرى الهدهد الحكيم أن لديك (${queueItems.length}) مفاهيم فقهية ضعيفة تحتاج لمراجعة فورية لتثبيت حفظك. ابدأ المراجعة الذكية الآن!`;
  } else if (completionPercentage === 100) {
    hoopoeGreeting = `ما شاء الله! لقد أتممت كامل باب الطهارة من سفينة النجاة بنجاح مبهر. يهنئك الهدهد الحكيم على إتقانك المتميز للمذهب الشافعي!`;
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-4 md:p-8">
      {/* Dynamic background gradients */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

      {/* Main Responsive Grid Layout (Multi-column Dashboard) */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* ==========================================
            LEFT COLUMN (Stats, Leaderboard, Mascot - Col Span 4)
           ========================================== */}
        <div className="lg:col-span-4 space-y-6 order-last lg:order-first">
          
          {/* Quick Actions & Stats Card */}
          <Card className="glass-panel border-slate-800 text-slate-100 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-brand-emerald-500/5 blur-xl pointer-events-none" />
            <CardHeader className="pb-2 flex justify-between items-center border-b border-slate-850">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-brand-emerald-500" /> لوحة الإنجاز الفقهي
              </span>
              <span className="px-2 py-0.5 rounded-full bg-brand-emerald-500/10 text-brand-emerald-400 text-[10px] font-bold">
                متن سفينة النجاة
              </span>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Profile details */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xl font-bold text-brand-emerald-400">
                  {user.name[0]}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-200">{user.name}</h4>
                  <p className="text-[10px] text-slate-400">
                    الرتبة: {user.role === "admin" ? "مدير النظام" : user.role === "reviewer" ? "مراجع شرعي" : "طالب علم"}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>نسبة إتمام باب الطهارة:</span>
                  <span className="text-brand-emerald-400">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-850">
                  <div 
                    className="bg-brand-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <p className="text-[9px] text-slate-500 text-left">
                  أتممت {completedLessons} من أصل {totalLessons} دروس فقهية
                </p>
              </div>

              {/* Fast links buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-850">
                <Link 
                  href={`/lesson/${resumeLessonId}`}
                  className="w-full bg-brand-emerald-500 hover:bg-brand-emerald-600 text-slate-950 font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>استئناف الدرس: {resumeLessonTitle}</span>
                </Link>

                <Link 
                  href="/review"
                  className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4 text-brand-gold-500" />
                  <span>المراجعة الذكية للأخطاء ({queueItems.length})</span>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Wise Hoopoe Mascot Widget */}
          <div className="bg-[#0b1429]/90 border border-brand-emerald-800/20 rounded-2xl p-5 flex items-start gap-4 shadow-lg shadow-emerald-950/10 relative overflow-hidden group hover:border-brand-emerald-700/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold-500/5 blur-xl pointer-events-none" />
            
            <div className="w-12 h-12 rounded-full bg-brand-gold-500/10 border border-brand-gold-500/30 flex items-center justify-center text-2xl shadow-inner shrink-0">
              🪶
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-black text-brand-gold-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> مرشد الهدهد الحكيم:
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {hoopoeGreeting}
              </p>
            </div>
          </div>

          {/* Minified Leaderboard Preview Card */}
          <Card className="glass-panel border-slate-800 text-slate-100 shadow-xl">
            <CardHeader className="pb-2 border-b border-slate-850">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-brand-gold-500 animate-bounce" /> لوحة الصدارة المصغرة
              </span>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2">
                {leaderboard.map((u, idx) => {
                  const isCurrentUser = u.id === user.id;
                  
                  return (
                    <div 
                      key={u.id}
                      className={`flex justify-between items-center p-2.5 rounded-xl border text-xs transition-all ${
                        isCurrentUser 
                          ? "bg-brand-emerald-950/20 border-brand-emerald-800/40 text-brand-emerald-200" 
                          : "bg-slate-900/30 border-slate-850/50 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          idx === 0 
                            ? "bg-brand-gold-500 text-slate-950 font-black" 
                            : idx === 1 
                            ? "bg-slate-400 text-slate-950 font-black" 
                            : "bg-amber-700 text-slate-100"
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="font-bold truncate max-w-[120px]">{u.name}</span>
                      </div>
                      <span className="font-extrabold text-[10px] text-slate-400">
                        {u.xp} XP
                      </span>
                    </div>
                  );
                })}
              </div>
              
              <Link 
                href="/leaderboard"
                className="w-full text-center text-slate-400 hover:text-slate-200 font-bold text-[10px] pt-1 block hover:underline"
              >
                تصفح لوحة الصدارة الكاملة
              </Link>
            </CardContent>
          </Card>

        </div>

        {/* ==========================================
            CENTER COLUMN (The Interactive Skill Tree - Col Span 8)
           ========================================== */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-brand-emerald-400" />
              <h2 className="text-xl font-extrabold text-slate-200">مسار التعلم التفاعلي (Safina Path) 🌳</h2>
            </div>
            <span className="text-[10px] text-slate-400">
              اضغط على الدرس النشط لبدء المذاكرة والتحدي المبرهن.
            </span>
          </div>

          {showDrafts && rawLessons.some(l => l.status !== "published") && (
            <div className="bg-brand-gold-500/5 border border-brand-gold-500/20 rounded-xl p-3 flex items-start gap-2 text-[11px] text-brand-gold-300">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                تنبيه: الدروس الموسومة بـ <b>&quot;مسودة مراجع&quot;</b> تظهر لك بصفتك الإشرافية لتسهيل تجربتها واعتمادها.
              </span>
            </div>
          )}

          {lessonsWithStates.length > 0 ? (
            <div className="relative border-r-2 border-slate-800/80 mr-6 md:mr-10 py-4 space-y-8">
              {lessonsWithStates.map((lesson, index) => {
                const isActive = !lesson.isLocked && !lesson.isCompleted;
                
                // Determine layout coloring of node
                let nodeBg = "bg-slate-900 border-slate-800 text-slate-500";
                let textStyle = "text-slate-400";
                let badge = null;

                if (lesson.isCompleted) {
                  if (lesson.needsReview) {
                    // Completed but has concepts in review queue -> Needs Review (Amber)
                    nodeBg = "bg-amber-500/10 border-amber-500 text-brand-gold-400 shadow-md shadow-amber-950/20 animate-pulse";
                    textStyle = "text-brand-gold-200 font-bold";
                    badge = (
                      <span className="text-[8px] px-2 py-0.5 rounded-full bg-amber-500/10 text-brand-gold-400 border border-amber-500/30 flex items-center gap-1 font-bold animate-pulse">
                        <AlertCircle className="w-2.5 h-2.5" /> يحتاج مراجعة
                      </span>
                    );
                  } else {
                    // Completed and clean -> Green
                    nodeBg = "bg-brand-emerald-500 border-brand-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10";
                    textStyle = "text-slate-300";
                    badge = (
                      <span className="text-[8px] px-2 py-0.5 rounded-full bg-brand-emerald-500/10 text-brand-emerald-400 border border-brand-emerald-500/30 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-2.5 h-2.5" /> مكتمل
                      </span>
                    );
                  }
                } else if (isActive) {
                  // Active/Unlocked node -> Pulsing gold
                  nodeBg = "bg-[#0b1329] border-brand-emerald-500 text-brand-emerald-400 animate-pulse shadow-md shadow-emerald-500/15";
                  textStyle = "text-slate-100 font-black";
                  badge = (
                    <span className="text-[8px] px-2 py-0.5 rounded-full bg-brand-gold-500/10 text-brand-gold-400 border border-brand-gold-500/30 flex items-center gap-1 font-bold animate-pulse">
                      <Sparkles className="w-2.5 h-2.5" /> نشط الآن
                    </span>
                  );
                }

                return (
                  <div key={lesson.id} className="relative flex items-start group">
                    
                    {/* Node Bullet Circle */}
                    <div className={`absolute -right-[15px] md:-right-[19px] w-7 h-7 md:w-9 md:h-9 rounded-full border flex items-center justify-center transition-all duration-300 z-10 ${nodeBg}`}>
                      {lesson.isCompleted && !lesson.needsReview ? (
                        <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-slate-950" />
                      ) : lesson.needsReview ? (
                        <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-brand-gold-500" />
                      ) : lesson.isLocked ? (
                        <Lock className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-600" />
                      ) : (
                        <PlayCircle className="w-4 h-4 md:w-5 md:h-5 text-brand-emerald-400" />
                      )}
                    </div>

                    {/* Lesson Box Card */}
                    <div className="mr-8 md:mr-12 flex-1 max-w-xl">
                      {lesson.isLocked ? (
                        // Locked card
                        <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-2xl opacity-50 flex justify-between items-center select-none">
                          <div>
                            <span className="text-[9px] font-bold text-slate-500 block">الدرس {index + 1} • {lesson.skillTitle}</span>
                            <h4 className="font-extrabold text-slate-400 text-sm mt-0.5">{lesson.title}</h4>
                          </div>
                          <span className="text-[10px] text-slate-600 font-bold flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5" /> مغلق
                          </span>
                        </div>
                      ) : (
                        // Clickable unlocked card
                        <Link 
                          href={`/lesson/${lesson.id}`} 
                          className={`block p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.01] ${
                            lesson.needsReview
                              ? "bg-amber-500/5 border-amber-500/30 hover:border-amber-500 shadow-md shadow-amber-950/5"
                              : lesson.isCompleted
                              ? "bg-slate-900/40 border-brand-emerald-900/15 hover:border-brand-emerald-500/30"
                              : "bg-[#080d1a] border-brand-emerald-500/30 hover:border-brand-emerald-500 shadow-lg shadow-emerald-950/5"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <span className={`text-[9px] font-bold block ${
                                lesson.needsReview 
                                  ? "text-brand-gold-500" 
                                  : lesson.isCompleted 
                                  ? "text-slate-400" 
                                  : "text-brand-emerald-400"
                              }`}>
                                الدرس {index + 1} • {lesson.skillTitle}
                              </span>
                              
                              <h4 className={`font-extrabold text-sm flex items-center gap-1.5 ${textStyle}`}>
                                {lesson.title}
                                {lesson.status !== "published" && (
                                  <span className="text-[8px] px-1.5 py-0.2 rounded bg-brand-gold-500/10 text-brand-gold-400 border border-brand-gold-500/20 font-bold">
                                    مسودة مراجع
                                  </span>
                                )}
                              </h4>
                            </div>

                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              {badge}
                              {!lesson.isCompleted && !lesson.needsReview && (
                                <span className="text-[9px] text-brand-emerald-400 font-bold flex items-center gap-0.5 hover:underline bg-brand-emerald-500/5 px-2 py-0.5 rounded border border-brand-emerald-500/15">
                                  ادرس الآن <ChevronLeft className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              لا توجد مهارات أو دروس معتمدة متوفرة حالياً في مسار التعلم.
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
