import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-[#030712] font-sans text-slate-100 min-h-screen relative overflow-hidden">
      {/* Background gradients for premium feel */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

      <main className="flex flex-col items-center justify-center max-w-4xl px-6 py-20 text-center z-10 space-y-8">
        {/* Logo Icon */}
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-emerald-500 to-brand-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/20 animate-pulse">
          <span className="text-5xl">🧭</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-emerald-400 via-brand-emerald-100 to-brand-gold-400 py-1">
            مَسْلَك - دَرْبُ الشَّافِعِيِّ
          </h1>
          <p className="text-xl md:text-2xl text-brand-emerald-100/80 font-medium">
            رحلتك التفاعلية لتعلم الفقه الشافعي باللعب والتحفيز العلمي
          </p>
        </div>

        <p className="max-w-2xl text-base md:text-lg text-slate-400 leading-relaxed">
          تعلّم الفقه الشافعي بطريقة حديثة ومرحة شبيهة بـ Duolingo. ابدأ بدراسة متن <b>"سفينة النجاة"</b> في باب الطهارة،
          وتقدم في شجرة التعلم من خلال تحديات فقهية ذكية، واعتمد على نظام مراجعة متباعدة يثبت معلوماتك دون نسيان.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link
            href="/dashboard"
            className="flex h-14 w-60 items-center justify-center gap-3 rounded-full bg-brand-emerald-500 hover:bg-brand-emerald-600 text-[#030712] font-bold text-lg transition-all shadow-lg shadow-emerald-500/20 hover:scale-105 group"
          >
            <span>ابدأ رحلتك التعليمية</span>
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          </Link>

          <Link
            className="flex h-14 w-48 items-center justify-center rounded-full border border-solid border-slate-700/60 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-500/80 text-slate-200 transition-all font-semibold"
            href="/sign-in"
          >
            تسجيل الدخول
          </Link>
        </div>

        {/* Governance disclaimer */}
        <div className="pt-16 border-t border-slate-800/60 max-w-lg mx-auto">
          <p className="text-xs text-slate-500 leading-relaxed">
            جميع المادة العلمية ومولدات المسائل الفقهية في مسلك تخضع للتدقيق والاعتماد الشرعي والعلمي الصارم
            وفق معتمد المذهب الشافعي.
          </p>
        </div>
      </main>
    </div>
  );
}

