import { Card, CardHeader, CardContent, Avatar, AvatarFallback } from "@heroui/react";
import { Trophy, Medal, Star } from "lucide-react";

export default function LeaderboardPage() {
  const leaders = [
    { rank: 1, name: "أحمد بن عبد الله", xp: 1250, book: "سفينة النجاة", isMe: false },
    { rank: 2, name: "محمد الشافعي", xp: 1100, book: "سفينة النجاة", isMe: false },
    { rank: 3, name: "يوسف الأنصاري", xp: 950, book: "سفينة النجاة", isMe: false },
    { rank: 4, name: "عمر الفاروق", xp: 820, book: "سفينة النجاة", isMe: false },
    { rank: 5, name: "طالب مسلك (أنت)", xp: 0, book: "سفينة النجاة", isMe: true },
  ];

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-brand-gold-500 flex items-center gap-2">
          <Trophy className="w-8 h-8" /> لوحة التنافس العلمي 🏆
        </h1>
        <p className="text-slate-400 text-sm">
          تنافس شريف بين طلاب العلم في التحصيل الفقهي لمستوى كتاب سفينة النجاة.
        </p>
      </div>

      <Card className="glass-panel border-brand-gold-800/10 text-slate-100">
        <CardHeader className="border-b border-brand-gold-900/10 pb-4 flex justify-between items-center">
          <span className="font-bold text-slate-300">الترتيب الأسبوعي الحالي</span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-brand-gold-500/10 text-brand-gold-400 border border-brand-gold-500/20 font-semibold">
            متن سفينة النجاة
          </span>
        </CardHeader>
        <CardContent className="py-4 divide-y divide-slate-800/50">
          {leaders.map((student, idx) => (
            <div 
              key={idx} 
              className={`flex items-center justify-between py-4 ${
                student.isMe ? "bg-brand-emerald-500/5 px-3 rounded-xl border border-brand-emerald-500/10 my-1" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank indicator */}
                <div className="w-8 flex justify-center items-center">
                  {student.rank === 1 ? (
                    <Trophy className="w-6 h-6 text-brand-gold-500" />
                  ) : student.rank === 2 ? (
                    <Medal className="w-6 h-6 text-slate-300" />
                  ) : student.rank === 3 ? (
                    <Medal className="w-6 h-6 text-brand-gold-700" />
                  ) : (
                    <span className="text-slate-500 font-bold text-sm">#{student.rank}</span>
                  )}
                </div>

                {/* Student info */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 text-slate-200 flex items-center justify-center">
                    <AvatarFallback>{student.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className={`font-bold text-sm ${student.isMe ? "text-brand-emerald-400" : "text-slate-200"}`}>
                      {student.name}
                    </h3>
                    <p className="text-[10px] text-slate-500">{student.book}</p>
                  </div>
                </div>
              </div>

              {/* Score details */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-brand-gold-400">{student.xp}</span>
                <span className="text-xs text-slate-500 font-medium">نقطة XP</span>
                <Star className="w-3.5 h-3.5 text-brand-gold-500 fill-brand-gold-500/30" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
