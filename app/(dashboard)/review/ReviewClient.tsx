"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader } from "@heroui/react";
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  CalendarClock,
  CheckCircle,
  Gem,
  Loader2,
  RefreshCw,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  getReviewCenterData,
  startReviewQuestion,
  submitReviewAnswer,
} from "@/actions/spaced-review";
import type {
  ActiveReviewQuestion,
  ReviewAnswerResult,
  ReviewCenterData,
  ReviewQueueItem,
} from "@/types/spaced-review";

interface ReviewClientProps {
  initialData: ReviewCenterData;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function strengthLabel(strength: number) {
  if (strength >= 5) return "راسخ";
  if (strength >= 4) return "قوي";
  if (strength >= 3) return "متوسط";
  if (strength >= 2) return "قابل للتحسن";
  return "ضعيف";
}

function strengthClass(strength: number) {
  if (strength >= 4) return "bg-brand-emerald-500/10 text-brand-emerald-300 border-brand-emerald-500/25";
  if (strength >= 3) return "bg-brand-gold-500/10 text-brand-gold-300 border-brand-gold-500/25";
  return "bg-rose-500/10 text-rose-300 border-rose-500/25";
}

function QueueItemCard({
  item,
  busy,
  onStart,
}: {
  item: ReviewQueueItem;
  busy: boolean;
  onStart: (conceptId: string) => void;
}) {
  return (
    <div className="p-4 bg-slate-900/40 border border-slate-800/60 rounded-xl flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-brand-emerald-950/40 rounded-lg text-brand-emerald-400">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-extrabold text-slate-200 text-sm">{item.conceptName}</h4>
          <p className="text-[11px] text-slate-500">{item.lessonTitle}</p>
          <p className="text-[10px] text-slate-500">
            {item.isDue ? "مستحق الآن" : `الموعد القادم: ${formatDateTime(item.nextReviewAt)}`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${strengthClass(item.strength)}`}>
          التمكن: {strengthLabel(item.strength)} ({item.strength}/5)
        </span>
        {item.mistakeCount > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-slate-800/70 text-slate-300 border-slate-700">
            أخطاء: {item.mistakeCount}
          </span>
        )}
        {item.isDue && (
          <Button
            isDisabled={busy}
            onPress={() => onStart(item.conceptId)}
            className="bg-brand-emerald-500 hover:bg-brand-emerald-600 text-slate-950 font-bold text-xs py-1.5 px-3 rounded-lg cursor-pointer"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "ابدأ المراجعة"}
          </Button>
        )}
      </div>
    </div>
  );
}

export function ReviewClient({ initialData }: ReviewClientProps) {
  const [data, setData] = useState<ReviewCenterData>(initialData);
  const [activeQuestion, setActiveQuestion] = useState<ActiveReviewQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [result, setResult] = useState<ReviewAnswerResult | null>(null);
  const [busyConceptId, setBusyConceptId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    const freshData = await getReviewCenterData();
    setData(freshData);
  };

  const handleStart = async (conceptId: string) => {
    try {
      setError(null);
      setResult(null);
      setSelectedAnswer("");
      setBusyConceptId(conceptId);
      const question = await startReviewQuestion({ conceptId });
      setActiveQuestion(question);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر بدء المراجعة");
    } finally {
      setBusyConceptId(null);
    }
  };

  const handleSubmit = async () => {
    if (!activeQuestion || !selectedAnswer) return;

    try {
      setError(null);
      setSubmitting(true);
      const answerResult = await submitReviewAnswer({
        token: activeQuestion.token,
        selectedAnswer,
      });
      setResult(answerResult);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تسجيل الإجابة");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setActiveQuestion(null);
    setSelectedAnswer("");
    setResult(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-brand-emerald-400 flex items-center gap-2">
          <RefreshCw className="w-7 h-7 md:w-8 md:h-8" /> مركز المراجعة المتباعدة
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
          راجع المفاهيم التي ضعفت في التحديات السابقة. كل محاولة حقيقية تحدث درجة التمكن وموعد المراجعة القادم.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="glass-panel border-brand-emerald-800/10 text-slate-100 md:col-span-2">
          <CardHeader className="pb-2">
            <h3 className="font-bold text-slate-300 flex items-center gap-1.5 text-sm">
              <BarChart3 className="w-4.5 h-4.5 text-brand-emerald-400" /> ملخص المراجعة
            </h3>
          </CardHeader>
          <CardContent className="py-4 space-y-3 text-xs">
            <div className="bg-slate-900/50 p-3 rounded-lg flex justify-between items-center">
              <span className="text-slate-400">إجمالي مفاهيم الطابور</span>
              <span className="font-bold text-slate-200">{data.stats.total}</span>
            </div>
            <div className="bg-slate-900/50 p-3 rounded-lg flex justify-between items-center">
              <span className="text-slate-400">مستحقة اليوم</span>
              <span className="font-bold text-brand-gold-400">{data.stats.dueCount}</span>
            </div>
            <div className="bg-slate-900/50 p-3 rounded-lg flex justify-between items-center">
              <span className="text-slate-400">تمت مراجعتها اليوم</span>
              <span className="font-bold text-brand-emerald-400">{data.stats.reviewedToday}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/50 p-3 rounded-lg">
                <p className="text-slate-500">تحسنت/قوية</p>
                <p className="text-lg font-black text-brand-emerald-300">{data.stats.strongCount}</p>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-lg">
                <p className="text-slate-500">تحتاج عناية</p>
                <p className="text-lg font-black text-rose-300">{data.stats.attentionCount}</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 p-3">
              <span className="flex items-center gap-2 text-slate-400">
                <Sparkles className="w-4 h-4 text-brand-gold-400" /> XP: {data.stats.xp}
              </span>
              <span className="flex items-center gap-2 text-slate-400">
                <Gem className="w-4 h-4 text-brand-emerald-400" /> {data.stats.gems}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-brand-emerald-800/10 text-slate-100 md:col-span-3">
          <CardHeader className="pb-2 border-b border-slate-800/40 flex justify-between items-center">
            <h3 className="font-bold text-slate-300">الجلسة الحالية</h3>
            {activeQuestion && (
              <span className="text-[10px] text-slate-500 font-medium">
                {activeQuestion.category} - {activeQuestion.difficulty}
              </span>
            )}
          </CardHeader>
          <CardContent className="py-4">
            {!activeQuestion ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3 text-center">
                <RotateCcw className="w-12 h-12 text-brand-emerald-500" />
                <p className="font-bold text-slate-300">اختر مفهوما مستحقا من الطابور لبدء مراجعة مضبوطة.</p>
                <p className="text-xs text-slate-500 max-w-md">
                  السؤال يصدر من القوالب المنشورة وبنك المفاهيم فقط، ثم يسجل السيرفر النتيجة ويعيد جدولة الموعد.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-[11px] text-brand-emerald-300 font-bold">{activeQuestion.conceptName}</p>
                  <h2 className="text-lg font-extrabold text-slate-100 leading-relaxed">
                    {activeQuestion.questionPrompt}
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {activeQuestion.options.map((option) => {
                    const selected = selectedAnswer === option;
                    const correct = result?.correctAnswer === option;
                    const wrongSelected = result && selected && !result.isCorrect;
                    return (
                      <button
                        key={option}
                        disabled={Boolean(result) || submitting}
                        onClick={() => setSelectedAnswer(option)}
                        className={`text-right rounded-xl border px-4 py-3 text-sm leading-relaxed transition-all ${
                          correct
                            ? "border-brand-emerald-500/50 bg-brand-emerald-500/10 text-brand-emerald-100"
                            : wrongSelected
                              ? "border-rose-500/50 bg-rose-500/10 text-rose-100"
                              : selected
                                ? "border-brand-gold-500/50 bg-brand-gold-500/10 text-brand-gold-100"
                                : "border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {result && (
                  <div
                    className={`rounded-xl border p-4 space-y-2 ${
                      result.isCorrect
                        ? "border-brand-emerald-500/25 bg-brand-emerald-500/10"
                        : "border-rose-500/25 bg-rose-500/10"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold">
                      {result.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-brand-emerald-300" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-300" />
                      )}
                      <span>{result.isCorrect ? "إجابة صحيحة" : "إجابة تحتاج مراجعة"}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{result.explanation}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-400">
                      <span>التمكن الجديد: {result.nextStrength}/5</span>
                      <span>الموعد القادم: {formatDateTime(result.nextReviewAt)}</span>
                      <span>
                        المكافأة: +{result.xpGained} XP
                        {result.gemsGained > 0 ? ` و +${result.gemsGained} جوهرة` : ""}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap justify-end gap-3">
                  {!result ? (
                    <Button
                      isDisabled={!selectedAnswer || submitting}
                      onPress={handleSubmit}
                      className="bg-brand-emerald-500 hover:bg-brand-emerald-600 text-slate-950 font-bold rounded-lg"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "تثبيت الإجابة"}
                    </Button>
                  ) : (
                    <Button
                      onPress={handleNext}
                      className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold rounded-lg"
                    >
                      العودة للطابور
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-brand-emerald-800/10 text-slate-100">
        <CardHeader className="pb-2 border-b border-slate-800/40 flex justify-between items-center">
          <h3 className="font-bold text-slate-300">المفاهيم المستحقة الآن</h3>
          <span className="text-xs text-slate-500 font-medium">لا يتكرر المفهوم لنفس الطالب بفضل القيد الفريد</span>
        </CardHeader>
        <CardContent className="py-4">
          {data.dueItems.length > 0 ? (
            <div className="space-y-4">
              {data.dueItems.map((item) => (
                <QueueItemCard
                  key={item.conceptId}
                  item={item}
                  busy={busyConceptId === item.conceptId}
                  onStart={handleStart}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <CheckCircle className="w-12 h-12 text-brand-emerald-500" />
              <p className="font-bold text-slate-300">لا توجد مفاهيم مستحقة للمراجعة الآن.</p>
              <p className="text-xs text-slate-500">ستظهر المفاهيم هنا عندما يحين موعد `nextReviewAt` التالي.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {data.upcomingItems.length > 0 && (
        <Card className="glass-panel border-slate-800/80 text-slate-100">
          <CardHeader className="pb-2 border-b border-slate-800/40">
            <h3 className="font-bold text-slate-300 flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-brand-gold-400" /> المراجعات القادمة
            </h3>
          </CardHeader>
          <CardContent className="py-4">
            <div className="space-y-3">
              {data.upcomingItems.map((item) => (
                <QueueItemCard key={item.conceptId} item={item} busy={false} onStart={handleStart} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
