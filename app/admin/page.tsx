import Link from "next/link";
import { Card, CardHeader, CardContent } from "@heroui/react";
import { BookOpen, CheckCircle, Users, ArrowLeft } from "lucide-react";

export default function AdminPage() {
  const stats = [
    { title: "الكتب المسجلة", value: 17, icon: BookOpen, color: "text-brand-emerald-400" },
    { title: "قيد المراجعة الفقهية", value: 0, icon: CheckCircle, color: "text-brand-gold-400" },
    { title: "إجمالي الطلاب", value: 1, icon: Users, color: "text-sky-400" },
  ];

  return (
    <div className="p-8 space-y-8 max-w-5xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-200">الإدارة العامة للمنصة 🛠️</h1>
        <p className="text-slate-400 text-sm">متابعة إحصائيات النشاط، إدارة الكتب والمناهج، وتدقيق المسائل والمفاهيم الفقهية.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="glass-panel border-slate-800/80 text-slate-100">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-1">{item.title}</p>
                  <p className="text-3xl font-black text-slate-200">{item.value}</p>
                </div>
                <div className={`p-4 bg-slate-900/60 rounded-2xl ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Navigation cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <Card className="glass-panel border-slate-800/80 text-slate-100 hover:border-brand-emerald-500/20 transition-all">
          <CardHeader className="pb-1">
            <h3 className="font-extrabold text-slate-200 text-lg">إدارة المناهج والمتون</h3>
          </CardHeader>
          <CardContent className="py-4 space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              إضافة وتحرير مستويات المناهج، إدراج الكتب الدراسية والوحدات التعليمية، وتأطير مفاهيم الدروس الفقهية المقرنة بمصادرها الشرعية.
            </p>
            <Link 
              href="/admin/content"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-emerald-400 hover:text-brand-emerald-300"
            >
              <span>فتح لوحة المحتوى</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="glass-panel border-slate-800/80 text-slate-100 hover:border-brand-gold-500/20 transition-all">
          <CardHeader className="pb-1">
            <h3 className="font-extrabold text-slate-200 text-lg">لوحة الاعتماد العلمي</h3>
          </CardHeader>
          <CardContent className="py-4 space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              تدقيق ومراجعة متون الدروس الفقهية، تقييم قوالب الأسئلة المولدة، إقرار مستويات الثقة العلمية واعتماد المحتوى للنشر العام للطلاب.
            </p>
            <Link 
              href="/admin/review"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-gold-400 hover:text-brand-gold-300"
            >
              <span>فتح طابور المراجعة</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
