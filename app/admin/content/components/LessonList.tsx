"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, Button } from "@heroui/react";
import { ChevronRight, Plus, Loader2, Send, Archive } from "lucide-react";
import { getSkillDetails, getLessonFullData } from "@/actions/content";

type SkillDetails = NonNullable<Awaited<ReturnType<typeof getSkillDetails>>>;
type LessonView = SkillDetails["lessons"][number];
type LessonFullData = NonNullable<Awaited<ReturnType<typeof getLessonFullData>>>;
type ConceptPreview = NonNullable<LessonFullData["concept"]>;

interface LessonListProps {
  selectedBook: { title: string; id: string };
  selectedUnit: { title: string; id: string };
  selectedSkill: { title: string; id: string };
  loadingSkill: boolean;
  lessonsList: LessonView[];
  openNewLessonModal: () => void;
  openLessonModalForEdit: (lesson: LessonView) => void;
  handleArchiveLesson: (id: string) => void;
  handleSubmitReview: (type: "lesson" | "concept", id: string) => void;
}

export default function LessonList({
  selectedBook,
  selectedUnit,
  selectedSkill,
  loadingSkill,
  lessonsList,
  openNewLessonModal,
  openLessonModalForEdit,
  handleArchiveLesson,
  handleSubmitReview,
}: LessonListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/20 p-2.5 rounded-xl border border-slate-850">
        <span>{selectedBook.title}</span>
        <ChevronRight className="w-3 h-3" />
        <span>{selectedUnit.title}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-200 font-bold">المهارة: {selectedSkill.title}</span>
      </div>

      <div className="flex justify-between items-center pb-2">
        <h3 className="text-lg font-bold text-slate-300">الدروس التفصيلية والمفاهيم المقرنة</h3>
        <Button 
          onClick={openNewLessonModal}
          className="bg-brand-emerald-500 hover:bg-brand-emerald-600 text-slate-950 font-bold text-xs py-2 px-4 rounded-xl cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> إضافة درس متكامل
        </Button>
      </div>

      {loadingSkill ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 text-brand-emerald-500 animate-spin" />
        </div>
      ) : lessonsList.length > 0 ? (
        <div className="space-y-4">
          {lessonsList.map((lesson) => (
            <Card key={lesson.id} className="glass-panel border-slate-800/80 text-slate-100">
              <CardContent className="p-4 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                        درس {lesson.order}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        lesson.status === "published"
                          ? "bg-brand-emerald-500/10 text-brand-emerald-400 border border-brand-emerald-500/25"
                          : lesson.status === "reviewed"
                          ? "bg-brand-gold-500/10 text-brand-gold-400 border border-brand-gold-500/25"
                          : "bg-slate-900 text-slate-400 border border-slate-800"
                      }`}>
                        {lesson.status === "published" ? "منشور" : lesson.status === "reviewed" ? "في المراجعة" : "مسودة"}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-slate-200 text-sm mt-1">{lesson.title}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    {lesson.status === "draft" && (
                      <Button 
                        onClick={() => handleSubmitReview("lesson", lesson.id)}
                        className="bg-brand-gold-500 hover:bg-brand-gold-600 text-slate-950 font-bold text-xs py-1.5 px-3 rounded-lg cursor-pointer flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" /> إرسال للمراجعة
                      </Button>
                    )}
                    <Button 
                      onClick={() => openLessonModalForEdit(lesson)}
                      className="bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs py-1.5 px-3 rounded-lg cursor-pointer"
                    >
                      تعديل الدرس والمفهوم
                    </Button>
                    <Button 
                      onClick={() => handleArchiveLesson(lesson.id)}
                      className="bg-slate-900 hover:bg-rose-950/20 text-rose-400 p-2 min-w-8 h-8 rounded-lg cursor-pointer"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-850 text-xs">
                  <div>
                    <span className="text-slate-400 block font-bold mb-1">المتن الفقهي:</span>
                    <p className="font-serif text-slate-300 leading-relaxed bg-slate-950/45 p-3 rounded-xl border border-slate-900">
                      {lesson.content}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-[#070e1f] p-3 rounded-xl border border-slate-850">
                      <span className="text-brand-gold-400 block font-bold mb-1">المفهوم الفقهي المرتبط:</span>
                      <ConceptMiniPreview lessonId={lesson.id} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 border border-dashed border-slate-850 rounded-2xl">
          لا توجد دروس مضافة في هذه المهارة حالياً.
        </div>
      )}
    </div>
  );
}

// Sub-component to load concept status dynamically without full page reload
function ConceptMiniPreview({ lessonId }: { lessonId: string }) {
  const [data, setData] = useState<ConceptPreview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLessonFullData(lessonId).then(res => {
      setData(res?.concept ?? null);
      setLoading(false);
    });
  }, [lessonId]);

  if (loading) return <span className="text-[10px] text-slate-500 animate-pulse">جاري التحميل...</span>;
  if (!data) return <span className="text-[10px] text-rose-400 font-semibold">لا يوجد مفهوم فقهي مربوط!</span>;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="font-extrabold text-slate-200 text-xs">{data.conceptName}</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-emerald-500/10 text-brand-emerald-400 border border-brand-emerald-500/20">
          الثقة: {data.scientificConfidence}%
        </span>
      </div>
      <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">
        المستوى: {data.rulingLevel === "beginner" ? "تمهيدي" : data.rulingLevel === "standard" ? "متوسط" : "متقدم"} | 
        معتمد: {data.madhhabPosition === "mutamad" ? "المعتمد" : "خلاف"}
      </p>
    </div>
  );
}
