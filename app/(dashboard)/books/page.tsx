import { Card, CardHeader, CardContent, Button } from "@heroui/react";
import { BookOpen, Calendar, Lock } from "lucide-react";

export default function BooksPage() {
  const booksList = [
    {
      level: "المستوى التمهيدي",
      color: "border-brand-emerald-500/30",
      bg: "bg-brand-emerald-950/20",
      texts: [
        { title: "سفينة النجاة", author: "الشيخ سالم بن سمير الحضري", status: "متاح الآن (MVP)", unlocked: true },
        { title: "الياقوت النفيس", author: "السيد أحمد بن عمر الشاطري", status: "قريباً", unlocked: false },
        { title: "المقدمة الحضرمية", author: "الشيخ عبد الله بن عبد الرحمن بافضل", status: "قريباً", unlocked: false },
      ],
    },
    {
      level: "المستوى الأول",
      color: "border-brand-gold-500/20",
      bg: "bg-brand-gold-900/5",
      texts: [
        { title: "متن أبي شجاع", author: "القاضي أبو شجاع الأصفهاني", status: "مقفل", unlocked: false },
        { title: "فتح القريب المجيب", author: "ابن قاسم الغزي", status: "مقفل", unlocked: false },
        { title: "كفاية الأخيار", author: "التقي الحصني", status: "مقفل", unlocked: false },
      ],
    },
    {
      level: "المستوى المتوسط",
      color: "border-slate-800/80",
      bg: "bg-slate-900/10",
      texts: [
        { title: "عمدة السالك", author: "ابن النقيب المصري", status: "مقفل", unlocked: false },
        { title: "منهج الطلاب", author: "شيخ الإسلام زكريا الأنصاري", status: "مقفل", unlocked: false },
        { title: "فتح المعين", author: "المليباري", status: "مقفل", unlocked: false },
      ],
    },
  ];

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-brand-emerald-400">خزانة المتون الفقهية 📚</h1>
        <p className="text-slate-400 text-sm">تصفح مسار المنهج التعليمي المتدرج للفقه الشافعي وابدأ دراسة الكتب المتاحة.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {booksList.map((levelGroup, idx) => (
          <div key={idx} className="space-y-4">
            <h2 className="text-lg font-bold text-slate-300 pr-2 border-r-2 border-brand-emerald-500/80">
              {levelGroup.level}
            </h2>
            <div className="space-y-3">
              {levelGroup.texts.map((book, bIdx) => (
                <Card 
                  key={bIdx} 
                  className={`glass-panel ${levelGroup.color} ${levelGroup.bg} text-slate-100 border hover-emerald-glow transition-all duration-300`}
                >
                  <CardHeader className="pb-2 flex justify-between items-start gap-4">
                    <div className="flex gap-3">
                      <div className="p-2 bg-slate-900/50 rounded-lg text-brand-emerald-400">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-200">{book.title}</h3>
                        <p className="text-xs text-slate-400">{book.author}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 pb-4 space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> المنهج المعتمد
                      </span>
                      <span 
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          book.unlocked 
                            ? "bg-brand-emerald-500/10 text-brand-emerald-400 border-brand-emerald-500/30" 
                            : "bg-slate-900/50 text-slate-500 border-slate-800"
                        }`}
                      >
                        {book.status}
                      </span>
                    </div>

                    <Button
                      isDisabled={!book.unlocked}
                      className={`w-full font-bold text-xs py-2 rounded-lg cursor-pointer ${
                        book.unlocked 
                          ? "bg-brand-emerald-500 hover:bg-brand-emerald-600 text-slate-950 shadow-md shadow-emerald-500/10" 
                          : "bg-slate-900/30 border border-slate-800/80 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {book.unlocked ? (
                        "افتح الكتاب للدراسة"
                      ) : (
                        <span className="flex items-center justify-center gap-1">
                          <Lock className="w-3 h-3" /> مقفل حالياً
                        </span>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
