import { Card, CardHeader, CardContent, Button } from "@heroui/react";
import { Gem, Flame, ShieldAlert, Sparkles } from "lucide-react";

export default function ShopPage() {
  const shopItems = [
    {
      title: "تجميد الحماس (Streak Freeze)",
      description: "يحمي سلسلة نشاطك اليومي (Streak) من الانقطاع إذا تغيبت يوماً واحداً عن التعلم.",
      cost: 50,
      icon: Flame,
      iconColor: "text-orange-500",
      bg: "bg-orange-500/5",
    },
    {
      title: "شارة طالب مجتهد",
      description: "شارة حصرية تظهر بجوار اسمك في لوحة الصدارة لتمييز تحصيلك العلمي الفقهي.",
      cost: 120,
      icon: Sparkles,
      iconColor: "text-amber-400",
      bg: "bg-amber-400/5",
    },
    {
      title: "تخطي تعثر فقهي (Retry Shield)",
      description: "يسمح لك بإعادة محاولة التحدي التفاعلي للدرس المتعثر فيه فوراً دون فقدان النقاط.",
      cost: 80,
      icon: ShieldAlert,
      iconColor: "text-brand-emerald-400",
      bg: "bg-brand-emerald-500/5",
    },
  ];

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div className="space-y-2 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-gold-500 flex items-center gap-2">
            <Gem className="w-8 h-8" /> متجر الفوائد الفقهية 💎
          </h1>
          <p className="text-slate-400 text-sm">استبدل جواهرك بمنافع تعليمية وتلعيبية تساعدك في مسار تفوقك.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shopItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card 
              key={idx} 
              className="glass-panel border-brand-gold-800/10 text-slate-100 border hover-gold-glow transition-all duration-300 flex flex-col justify-between"
            >
              <CardHeader className="pb-2 flex gap-3">
                <div className={`p-3 rounded-xl bg-slate-900/60 ${item.iconColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-200 text-sm">{item.title}</h3>
                </div>
              </CardHeader>
              <CardContent className="pt-2 pb-6 space-y-6 flex flex-col justify-between flex-1">
                <p className="text-xs text-slate-400 leading-relaxed min-h-[50px]">{item.description}</p>
                
                <div className="space-y-3 pt-4 border-t border-slate-800/40">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">تكلفة العنصر:</span>
                    <span className="flex items-center gap-1 font-black text-brand-gold-400">
                      💎 {item.cost} جوهرة
                    </span>
                  </div>

                  <Button className="w-full bg-brand-gold-500 hover:bg-brand-gold-600 text-slate-950 font-extrabold text-xs py-2 rounded-lg cursor-pointer transition-all shadow-md shadow-amber-500/10">
                    شراء الآن
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
