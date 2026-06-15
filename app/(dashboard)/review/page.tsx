import { Card, CardHeader, CardContent, Button } from "@heroui/react";
import { RefreshCw, BookOpen, CheckCircle, BarChart } from "lucide-react";

export default function ReviewPage() {
  const reviewsQueue = [
    { concept: "علامات البلوغ", book: "سفينة النجاة", strength: "ضعيف", status: "يستحق المراجعة اليوم" },
    { concept: "فروض الوضوء", book: "سفينة النجاة", strength: "متوسط", status: "مجدول غداً" },
  ];

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-brand-emerald-400 flex items-center gap-2">
          <RefreshCw className="w-8 h-8" /> مركز المراجعة الذكية المتباعدة 🔄
        </h1>
        <p className="text-slate-400 text-sm">
          تتبع الأخطاء السابقة وتكرار المفاهيم الفقهية الضعيفة لتثبيتها في الذاكرة طويلة المدى.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progress stats */}
        <Card className="glass-panel border-brand-emerald-800/10 text-slate-100 md:col-span-1">
          <CardHeader className="pb-2">
            <h3 className="font-bold text-slate-300 flex items-center gap-1.5 text-sm">
              <BarChart className="w-4.5 h-4.5 text-brand-emerald-400" /> إحصائيات الحفظ
            </h3>
          </CardHeader>
          <CardContent className="py-4 space-y-4 text-xs">
            <div className="bg-slate-900/50 p-3 rounded-lg flex justify-between items-center">
              <span className="text-slate-400">إجمالي المفاهيم المذاكرة:</span>
              <span className="font-bold text-slate-200">0</span>
            </div>
            <div className="bg-slate-900/50 p-3 rounded-lg flex justify-between items-center">
              <span className="text-slate-400">تحتاج مراجعة اليوم:</span>
              <span className="font-bold text-brand-gold-400">0</span>
            </div>
            <div className="bg-slate-900/50 p-3 rounded-lg flex justify-between items-center">
              <span className="text-slate-400">مفاهيم تم تثبيتها (100%):</span>
              <span className="font-bold text-brand-emerald-400">0</span>
            </div>
          </CardContent>
        </Card>

        {/* Active review queue */}
        <Card className="glass-panel border-brand-emerald-800/10 text-slate-100 md:col-span-2">
          <CardHeader className="pb-2 border-b border-slate-800/40 flex justify-between items-center">
            <h3 className="font-bold text-slate-300">طابور المراجعة الحالي</h3>
            <span className="text-xs text-slate-500 font-medium">محدّث تلقائياً</span>
          </CardHeader>
          <CardContent className="py-4">
            {reviewsQueue.length > 0 ? (
              <div className="space-y-4">
                {reviewsQueue.map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-900/40 border border-slate-800/60 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-emerald-950/40 rounded-lg text-brand-emerald-400">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-200 text-sm">{item.concept}</h4>
                        <p className="text-[10px] text-slate-500">{item.book}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-red-500/10 text-red-400 border-red-500/20">
                        التمكن: {item.strength}
                      </span>
                      <Button className="bg-brand-emerald-500 hover:bg-brand-emerald-600 text-slate-950 font-bold text-xs py-1.5 px-3 rounded-lg cursor-pointer">
                        ابدأ المراجعة
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <CheckCircle className="w-12 h-12 text-brand-emerald-500" />
                <p className="font-bold text-slate-300">لا توجد مفاهيم تحتاج مراجعة اليوم!</p>
                <p className="text-xs text-slate-500">طابورك نظيف ومعلوماتك الفقهية ثابتة ومثبتة.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
