import { AlertTriangle, BarChart3, BookOpen, Brain, RefreshCw, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@heroui/react";
import { getAnalyticsSnapshot } from "@/actions/analytics";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <Card className="glass-panel border-slate-800/80 text-slate-100">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 font-semibold mb-1">{label}</p>
          <p className="text-2xl font-black text-slate-100">{value}</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/70 text-brand-emerald-400">
          <Icon className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AdminAnalyticsPage() {
  const analytics = await getAnalyticsSnapshot();

  return (
    <div className="p-8 space-y-8 max-w-6xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-200 flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-brand-emerald-400" /> التحليلات التعليمية
        </h1>
        <p className="text-sm text-slate-400">
          مؤشرات مبنية على الإجابات والجلسات وطابور المراجعة، هدفها تحسين المحتوى لا كشف بيانات الطلاب.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard label="الطلاب" value={analytics.totals.students} icon={Users} />
        <StatCard label="الدروس المنشورة" value={analytics.totals.publishedLessons} icon={BookOpen} />
        <StatCard label="جلسات التحدي" value={analytics.totals.challengeSessions} icon={RefreshCw} />
        <StatCard label="إكمال الدروس" value={analytics.totals.completedLessons} icon={Brain} />
        <StatCard label="معدل الإكمال" value={`${analytics.totals.completionRate}%`} icon={BarChart3} />
        <StatCard label="معدل الرسوب" value={`${analytics.totals.failureRate}%`} icon={AlertTriangle} />
      </div>

      {analytics.improvementAlerts.length > 0 && (
        <Card className="glass-panel border-rose-500/20 text-slate-100">
          <CardHeader className="pb-2 border-b border-rose-500/10">
            <h2 className="font-extrabold text-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> تنبيهات تحتاج مراجعة علمية
            </h2>
          </CardHeader>
          <CardContent className="py-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {analytics.improvementAlerts.map((alert) => (
              <div key={alert.conceptId} className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-4">
                <h3 className="text-sm font-bold text-slate-100">{alert.conceptName}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  طلاب في الطابور: {alert.queuedStudents}، إشارات خطأ: {alert.totalMistakes}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-panel border-slate-800/80 text-slate-100">
          <CardHeader className="pb-2 border-b border-slate-800/50">
            <h2 className="font-extrabold text-slate-200">أكثر المفاهيم خطأ</h2>
          </CardHeader>
          <CardContent className="py-4 space-y-3">
            {analytics.topWrongConcepts.length > 0 ? (
              analytics.topWrongConcepts.map((item) => (
                <div key={item.conceptId ?? item.conceptName ?? item.wrongCount} className="flex justify-between rounded-lg bg-slate-900/40 p-3 text-sm">
                  <span className="text-slate-300">{item.conceptName ?? "مفهوم غير مرتبط"}</span>
                  <b className="text-brand-gold-400">{item.wrongCount}</b>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">لا توجد أخطاء مسجلة بعد.</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-slate-800/80 text-slate-100">
          <CardHeader className="pb-2 border-b border-slate-800/50">
            <h2 className="font-extrabold text-slate-200">أكثر الأسئلة التباسا</h2>
          </CardHeader>
          <CardContent className="py-4 space-y-3">
            {analytics.confusingQuestions.length > 0 ? (
              analytics.confusingQuestions.map((item) => (
                <div key={item.questionPrompt} className="rounded-lg bg-slate-900/40 p-3">
                  <p className="text-sm text-slate-300 leading-relaxed">{item.questionPrompt}</p>
                  <p className="text-xs text-brand-gold-400 mt-2">أخطاء: {item.wrongCount}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">لا توجد أسئلة ملتبسة بعد.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-panel border-slate-800/80 text-slate-100">
          <CardHeader className="pb-2 border-b border-slate-800/50">
            <h2 className="font-extrabold text-slate-200">متوسط المحاولات لكل درس</h2>
          </CardHeader>
          <CardContent className="py-4 space-y-3">
            {analytics.lessonAttempts.length > 0 ? (
              analytics.lessonAttempts.map((lesson) => (
                <div key={lesson.lessonId} className="rounded-lg bg-slate-900/40 p-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-300">{lesson.lessonTitle}</span>
                    <b className="text-brand-emerald-400">{lesson.attempts}</b>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    نجاح: {lesson.completed}، رسوب: {lesson.failed}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">لا توجد محاولات مسجلة بعد.</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-slate-800/80 text-slate-100">
          <CardHeader className="pb-2 border-b border-slate-800/50">
            <h2 className="font-extrabold text-slate-200">طلاب نشطون دون بيانات حساسة</h2>
          </CardHeader>
          <CardContent className="py-4 space-y-3">
            {analytics.activeStudents.length > 0 ? (
              analytics.activeStudents.map((student) => (
                <div key={student.label} className="flex justify-between rounded-lg bg-slate-900/40 p-3 text-sm">
                  <span className="text-slate-300">{student.label}</span>
                  <span className="text-slate-500">
                    {student.sessions} جلسات، {student.xp} XP
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">لا يوجد نشاط طلابي مسجل بعد.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
