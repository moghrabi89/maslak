"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  Button, 
  Modal, 
  ModalDialog, 
  ModalHeader, 
  ModalBody, 
  ModalFooter 
} from "@heroui/react";
import { 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Sparkles, 
  Loader2, 
  RefreshCw, 
  Check, 
  History,
} from "lucide-react";
import { 
  getPendingReviews, 
  getReviewLogs, 
  approveEntity, 
  requestChangesEntity, 
  rejectEntity 
} from "@/actions/review";
import {
  generateQuestion,
  type Concept,
  type ConceptData,
  type GeneratedQuestion,
  type QuestionTemplate,
} from "@/lib/generator";

type PendingReviews = Awaited<ReturnType<typeof getPendingReviews>>;
type PendingLesson = PendingReviews["lessons"][number];
type PendingConcept = PendingReviews["concepts"][number];
type ReviewLogs = Awaited<ReturnType<typeof getReviewLogs>>;
type ReviewEntityType = "lesson" | "concept" | "question_template";

interface DecisionEntity {
  id: string;
  title: string;
  entityType: ReviewEntityType;
}

const previewTemplates: QuestionTemplate[] = [
  {
    id: "tmpl_recall_pillar",
    type: "recall",
    difficulty: "easy",
    templateText: "أي مما يلي يعتبر ركناً/فرضاً من فروض {concept}؟",
    explanationTemplate: "نعم! يعتبر ({item}) ركناً أساسياً من أركان {concept} كما ورد في المتن المعتمد.",
  },
  {
    id: "tmpl_distinguish_condition",
    type: "distinguish",
    difficulty: "medium",
    templateText: "أي مما يلي ليس من شروط صحة {concept}؟",
    explanationTemplate: "إجابة صحيحة! ({item}) ليس من شروط {concept}.",
  },
  {
    id: "tmpl_apply_ruling",
    type: "apply",
    difficulty: "hard",
    templateText: "توضأ شخص ثم {scenario}، ما حكم وضوئه وطهارته في مذهب الشافعية؟",
    explanationTemplate: "صحيح! حكمه هو: ({item}). العلة هي: {reason}.",
  },
  {
    id: "tmpl_true_false",
    type: "true_false",
    difficulty: "easy",
    templateText: "هل العبارة التالية صحيحة؟ {concept}",
    explanationTemplate: "شرح السؤال: {item}.",
  },
  {
    id: "tmpl_fill_in",
    type: "fill_in",
    difficulty: "medium",
    templateText: "املأ الفراغ في النص التالي المتعلق بـ {concept}",
    explanationTemplate: "الإجابة الصحيحة: {item}.",
  },
];

function toGeneratorConcept(concept: PendingConcept): Concept {
  return {
    id: concept.id,
    conceptName: concept.conceptName,
    category: concept.category,
    notesForAdvancedStudents: concept.notesForAdvancedStudents,
    data: concept.data as ConceptData,
  };
}

function countConceptItems(concept: PendingConcept, key: keyof ConceptData) {
  const data = concept.data as Partial<ConceptData>;
  const value = data[key];
  return Array.isArray(value) ? value.length : 0;
}

export default function AdminReviewPage() {
  const [pending, setPending] = useState<PendingReviews>({ lessons: [], concepts: [], templates: [] });
  const [logs, setLogs] = useState<ReviewLogs>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "logs">("pending");
  
  // Dialog states
  const [selectedEntity, setSelectedEntity] = useState<DecisionEntity | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState<"approve" | "changes" | "reject">("approve");
  
  // Interactive testing of generator
  const [previewQuestion, setPreviewQuestion] = useState<GeneratedQuestion | null>(null);
  const [generatingPreview, setGeneratingPreview] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const pendingData = await getPendingReviews();
    const logsData = await getReviewLogs();
    setPending(pendingData);
    setLogs(logsData);
    setLoading(false);
  };

  // Load reviews on mount
  useEffect(() => {
    let isActive = true;

    async function loadInitialData() {
      setLoading(true);
      const pendingData = await getPendingReviews();
      const logsData = await getReviewLogs();
      if (!isActive) return;
      setPending(pendingData);
      setLogs(logsData);
      setLoading(false);
    }

    void loadInitialData();

    return () => {
      isActive = false;
    };
  }, []);

  // Decisions
  const openDecisionModal = (entity: DecisionEntity, type: "approve" | "changes" | "reject") => {
    setSelectedEntity(entity);
    setDecisionType(type);
    setReviewNotes("");
    setIsDecisionModalOpen(true);
  };

  const handleExecuteDecision = async () => {
    if (!selectedEntity) return;

    const type = selectedEntity.entityType; // 'lesson' | 'concept' | 'question_template'
    const id = selectedEntity.id;

    if (decisionType === "approve") {
      await approveEntity(type, id, reviewNotes);
    } else if (decisionType === "changes") {
      await requestChangesEntity(type, id, reviewNotes);
    } else {
      await rejectEntity(type, id, reviewNotes);
    }

    setIsDecisionModalOpen(false);
    loadData();
    setPreviewQuestion(null);
  };

  // Generate question preview dynamically
  const handlePreviewQuestion = async (concept: PendingConcept) => {
    setGeneratingPreview(true);
    const chosenTemplate = previewTemplates[concept.id.length % previewTemplates.length];

    // Fetch other concepts to pass as allConcepts (for distractors)
    const pendingData = await getPendingReviews();
    const allConcepts = [concept, ...pendingData.concepts].map(toGeneratorConcept);

    try {
      const q = generateQuestion(toGeneratorConcept(concept), chosenTemplate, allConcepts);
      setPreviewQuestion(q);
    } catch (err) {
      console.error(err);
      setPreviewQuestion({
        questionPrompt: "تعذر التوليد لعدم اكتمال بيانات المفهوم (الشرط أو الركن).",
        options: ["خيارات غير متوفرة"],
        correctAnswer: "خطأ",
        explanation: "يرجى التحقق من ملء المصفوفات بشكل صحيح في محرر المحتوى.",
        difficulty: "easy",
        type: "recall",
      });
    }
    
    setGeneratingPreview(false);
  };

  const getEntityTypeLabel = (type: string) => {
    if (type === "lesson") return "درس فقهي";
    if (type === "concept") return "مفهوم فقهي";
    return "قالب أسئلة";
  };

  const totalPending = pending.lessons.length + pending.concepts.length + pending.templates.length;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-800/60 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-200 flex items-center gap-2">
            <CheckCircle className="w-8 h-8 text-brand-gold-500" />
            الاعتماد الشرعي والعلمي ⚖️
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            مراجعة نصوص الفقه المتوافقة مع معتمد المذهب الشافعي، واختبار مولد الأسئلة التفاعلي وإقرار دقة البيانات.
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => setActiveTab("pending")}
            className={`font-bold text-xs py-2 px-4 rounded-xl cursor-pointer flex items-center gap-1.5 ${
              activeTab === "pending" 
                ? "bg-brand-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10" 
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850"
            }`}
          >
            <FileText className="w-4 h-4" /> المعلقات ({totalPending})
          </Button>
          <Button 
            onClick={() => setActiveTab("logs")}
            className={`font-bold text-xs py-2 px-4 rounded-xl cursor-pointer flex items-center gap-1.5 ${
              activeTab === "logs" 
                ? "bg-brand-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10" 
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850"
            }`}
          >
            <History className="w-4 h-4" /> سجل الاعتماد العلمي
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-10 h-10 text-brand-gold-500 animate-spin" />
          <p className="text-slate-400 text-sm">جاري تحميل طلبات الاعتماد الشرعي...</p>
        </div>
      ) : activeTab === "pending" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Pending items list */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-bold text-slate-300">طلبات المراجعة المعلقة</h2>
            
            {totalPending > 0 ? (
              <div className="space-y-4">
                
                {/* 1. Lessons pending */}
                {pending.lessons.map((lesson: PendingLesson) => (
                  <Card key={lesson.id} className="glass-panel border-slate-800 text-slate-100">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                            درس فقهي
                          </span>
                          <h4 className="font-extrabold text-slate-200 text-sm mt-1">{lesson.title}</h4>
                        </div>
                        <span className="text-[9px] text-slate-500">{new Date(lesson.updatedAt).toLocaleDateString("ar-EG")}</span>
                      </div>

                      <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900 text-xs">
                        <span className="text-slate-400 block font-bold mb-1">المتن المكتوب:</span>
                        <p className="font-serif text-slate-300 leading-relaxed">{lesson.content}</p>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
                        <Button 
                          onClick={() => openDecisionModal({ id: lesson.id, title: lesson.title, entityType: "lesson" }, "approve")}
                          className="bg-brand-emerald-500 hover:bg-brand-emerald-600 text-slate-950 font-bold text-[10px] py-1.5 px-3 rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> اعتماد ونشر
                        </Button>
                        <Button 
                          onClick={() => openDecisionModal({ id: lesson.id, title: lesson.title, entityType: "lesson" }, "changes")}
                          className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 font-bold text-[10px] py-1.5 px-3 rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-brand-gold-500" /> طلب تعديل
                        </Button>
                        <Button 
                          onClick={() => openDecisionModal({ id: lesson.id, title: lesson.title, entityType: "lesson" }, "reject")}
                          className="bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-bold text-[10px] py-1.5 px-3 rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          رفض
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* 2. Concepts pending */}
                {pending.concepts.map((concept: PendingConcept) => (
                  <Card key={concept.id} className="glass-panel border-slate-850 text-slate-100">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-gold-500/10 text-brand-gold-400 border border-brand-gold-500/20 font-bold">
                            مفهوم فقهي مهيكل
                          </span>
                          <h4 className="font-extrabold text-slate-200 text-sm mt-1">{concept.conceptName}</h4>
                        </div>
                        <span className="text-[9px] text-slate-500">{new Date(concept.updatedAt).toLocaleDateString("ar-EG")}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-400 bg-slate-950/20 p-2.5 rounded-xl border border-slate-900">
                        <div>المذهب: <b className="text-slate-200">{concept.madhhabPosition === "mutamad" ? "المعتمد" : "خلاف"}</b></div>
                        <div>المستوى: <b className="text-slate-200">{concept.rulingLevel}</b></div>
                      </div>

                      {concept.notesForAdvancedStudents && (
                        <div className="bg-amber-500/5 p-2 rounded-lg border border-amber-500/10 text-[10px] text-amber-200">
                          ℹ️ {concept.notesForAdvancedStudents}
                        </div>
                      )}

                      {/* Displaying details of JSON */}
                      <div className="text-[10px] space-y-1.5 pt-2 border-t border-slate-850">
                        <span className="text-slate-400 font-bold">عناصر البيانات المهيكلة (JSON arrays):</span>
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded">
                            أركان: {countConceptItems(concept, "pillars")}
                          </span>
                          <span className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded">
                            شروط: {countConceptItems(concept, "conditions")}
                          </span>
                          <span className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded">
                            نواقض: {countConceptItems(concept, "invalidators")}
                          </span>
                          <span className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded">
                            فروع: {countConceptItems(concept, "rulings")}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-between items-center pt-3 border-t border-slate-850 gap-2">
                        <Button 
                          onClick={() => handlePreviewQuestion(concept)}
                          className="bg-[#0b1429] border border-brand-emerald-500/25 hover:bg-[#101e3d] text-brand-emerald-400 font-bold text-[10px] py-1.5 px-3 rounded-lg cursor-pointer flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> تجربة المولد (Preview Question)
                        </Button>

                        <div className="flex gap-2">
                          <Button 
                            onClick={() => openDecisionModal({ id: concept.id, title: concept.conceptName, entityType: "concept" }, "approve")}
                            className="bg-brand-emerald-500 hover:bg-brand-emerald-600 text-slate-950 font-bold text-[10px] py-1.5 px-3 rounded-lg cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> اعتماد ونشر
                          </Button>
                          <Button 
                            onClick={() => openDecisionModal({ id: concept.id, title: concept.conceptName, entityType: "concept" }, "changes")}
                            className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 font-bold text-[10px] py-1.5 px-3 rounded-lg cursor-pointer flex items-center gap-1"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-brand-gold-500" /> طلب تعديل
                          </Button>
                          <Button 
                            onClick={() => openDecisionModal({ id: concept.id, title: concept.conceptName, entityType: "concept" }, "reject")}
                            className="bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-bold text-[10px] py-1.5 px-3 rounded-lg cursor-pointer flex items-center gap-1"
                          >
                            رفض
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* 3. Question Templates pending */}
                <h3 className="text-sm font-bold text-slate-400 pt-4 border-t border-slate-850">قوالب الأسئلة</h3>
                {pending.templates.length > 0 ? (
                  pending.templates.map((tmpl) => (
                    <Card key={tmpl.id} className="glass-panel border-slate-850 text-slate-100">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                              قالب سؤال {tmpl.type === "recall" ? "استذكار" : tmpl.type === "distinguish" ? "تمييز" : tmpl.type === "apply" ? "تطبيق" : tmpl.type === "synthesis" ? "تركيب" : tmpl.type === "true_false" ? "صح/خطأ" : "إكمال"}
                            </span>
                            <p className="text-[10px] text-slate-300 mt-1.5">{tmpl.templateText}</p>
                            <p className="text-[9px] text-slate-500 mt-1">الصعوبة: {tmpl.difficulty === "easy" ? "سهل" : tmpl.difficulty === "medium" ? "متوسط" : "صعب"}</p>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
                          <Button 
                            onClick={() => openDecisionModal({ id: tmpl.id, title: tmpl.templateText.slice(0, 40), entityType: "question_template" }, "approve")}
                            className="bg-brand-emerald-500 hover:bg-brand-emerald-600 text-slate-950 font-bold text-[10px] py-1.5 px-3 rounded-lg cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> اعتماد
                          </Button>
                          <Button 
                            onClick={() => openDecisionModal({ id: tmpl.id, title: tmpl.templateText.slice(0, 40), entityType: "question_template" }, "changes")}
                            className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 font-bold text-[10px] py-1.5 px-3 rounded-lg cursor-pointer flex items-center gap-1"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-brand-gold-500" /> طلب تعديل
                          </Button>
                          <Button 
                            onClick={() => openDecisionModal({ id: tmpl.id, title: tmpl.templateText.slice(0, 40), entityType: "question_template" }, "reject")}
                            className="bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-bold text-[10px] py-1.5 px-3 rounded-lg cursor-pointer flex items-center gap-1"
                          >
                            رفض
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-500 py-2">لا توجد قوالب أسئلة معلقة للمراجعة.</p>
                )}

              </div>
            ) : (
              <div className="text-center py-20 text-slate-500 border border-dashed border-slate-850 rounded-2xl">
                لا توجد طلبات اعتماد فقهي معلقة حالياً.
              </div>
            )}
          </div>

          {/* Generator Preview Panel (Right column) */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-base font-bold text-slate-300">معاينة مولد الأسئلة 🧠</h2>
            
            <Card className="glass-panel border-slate-850 text-slate-100">
              <CardContent className="p-4 space-y-4">
                {generatingPreview ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Loader2 className="w-8 h-8 text-brand-emerald-500 animate-spin" />
                    <span className="text-[10px] text-slate-400">جاري توليد السؤال فقهياً...</span>
                  </div>
                ) : previewQuestion ? (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-1.5 text-brand-gold-400 font-bold border-b border-slate-850 pb-1.5 text-[10px]">
                      <Sparkles className="w-4 h-4 text-brand-gold-500" />
                      سؤال مولد تلقائياً من المفهوم المختبر:
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-400 font-bold">صيغة السؤال:</span>
                      <p className="font-extrabold text-slate-200 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900 leading-relaxed text-xs">
                        {previewQuestion.questionPrompt}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-400 font-bold">الخيارات المتاحة:</span>
                      <div className="space-y-1">
                        {previewQuestion.options.map((opt: string, i: number) => (
                          <div 
                            key={i} 
                            className={`p-2 rounded-lg border text-[11px] ${
                              opt === previewQuestion.correctAnswer 
                                ? "bg-brand-emerald-500/10 text-brand-emerald-400 border-brand-emerald-500/25 font-bold"
                                : "bg-slate-900/60 text-slate-300 border-slate-850"
                            }`}
                          >
                            {i + 1}) {opt}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-slate-850">
                      <span className="text-slate-400 font-bold text-[10px] block">التفسير الفقهي المبرهن المرافق:</span>
                      <p className="text-slate-300 bg-slate-900/40 p-2.5 rounded-lg text-[10px] leading-relaxed">
                        {previewQuestion.explanation}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    اختر &quot;تجربة المولد&quot; لمعاينة واختبار الأسئلة التي سيطرحها محرك التوليد على الطلاب قبل اعتماد المفهوم.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      ) : (
        // 3. Historical reviews logs view
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-300">أحدث عمليات التحكيم والاعتماد العلمي</h2>

          {logs.length > 0 ? (
            <div className="space-y-3">
              {logs.map((log) => (
                <Card key={log.id} className="glass-panel border-slate-850 text-slate-100">
                  <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          log.status === "approved" 
                            ? "bg-brand-emerald-500/10 text-brand-emerald-400" 
                            : log.status === "needs_changes"
                            ? "bg-brand-gold-500/10 text-brand-gold-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}>
                          {log.status === "approved" ? "معتمد ومنشور" : log.status === "needs_changes" ? "طلب تعديل" : "مرفوض"}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {getEntityTypeLabel(log.entityType)} | معرّف: {log.entityId}
                        </span>
                      </div>
                      
                      {log.notes && (
                        <p className="text-slate-300 italic pt-1">
                          &quot; {log.notes} &quot;
                        </p>
                      )}
                    </div>

                    <div className="text-left text-[10px] text-slate-400 space-y-0.5">
                      <div>المحكّم: <b className="text-slate-300">{log.reviewerName}</b></div>
                      <div>التاريخ: {new Date(log.reviewedAt).toLocaleString("ar-EG")}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 border border-dashed border-slate-850 rounded-2xl">
              لا توجد مراجعات مؤرشفة في سجل الاعتماد.
            </div>
          )}
        </div>
      )}

      {/* Decision Modal */}
      <Modal isOpen={isDecisionModalOpen} onOpenChange={setIsDecisionModalOpen}>
        <ModalDialog className="dark text-slate-100 bg-[#070d1e] border border-slate-800/80 rounded-2xl max-w-md font-sans">
          <ModalHeader className="border-b border-slate-800/40 font-extrabold text-brand-gold-400">
            {decisionType === "approve" ? "إقرار واعتماد المحتوى" : decisionType === "changes" ? "طلب تعديلات وملاحظات" : "رفض الكيان المعروض"}
          </ModalHeader>
          <ModalBody className="py-4 space-y-4 text-xs">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850">
              <span className="text-slate-400 block font-bold">الكيان المستهدف:</span>
              <span className="text-slate-200 font-extrabold text-sm">{selectedEntity?.title}</span>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">ملاحظات وقرار التحكيم الشرعي:</label>
              <textarea 
                value={reviewNotes} 
                onChange={(e) => setReviewNotes(e.target.value)} 
                rows={3}
                placeholder="اكتب ملاحظاتك العلمية التي ستظهر لمدير المحتوى..." 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none resize-none focus:border-brand-gold-500"
              />
            </div>
            
            {decisionType === "approve" && (
              <div className="bg-brand-emerald-500/5 p-3 rounded-xl border border-brand-emerald-500/10 text-[10px] text-brand-emerald-400 leading-relaxed">
                ⚠️ <b>تنبيه الحوكمة:</b> باعتماد هذا الكيان، سيتم رفعه تلقائياً للنشر الفوري وعرضه للطلاب في التحديات، كما سترتفع نسبة الثقة العلمية للمفهوم <code>scientificConfidence</code> إلى <b>100%</b> فورياً.
              </div>
            )}
          </ModalBody>
          <ModalFooter className="border-t border-slate-800/40">
            <Button onClick={() => setIsDecisionModalOpen(false)} className="bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs">إلغلاق</Button>
            <Button 
              onClick={handleExecuteDecision} 
              className={`font-bold text-xs ${
                decisionType === "approve" 
                  ? "bg-brand-emerald-500 text-slate-950" 
                  : decisionType === "changes" 
                  ? "bg-brand-gold-500 text-slate-950" 
                  : "bg-rose-500 text-slate-100"
              }`}
            >
              إرسال القرار
            </Button>
          </ModalFooter>
        </ModalDialog>
      </Modal>
    </div>
  );
}
