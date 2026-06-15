"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { 
  Modal, 
  ModalDialog, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button 
} from "@heroui/react";
import { 
  FileText, 
  Bookmark, 
  Edit3, 
  Trash2, 
  PlusCircle,
  Loader2
} from "lucide-react";
import { getLessonFullData } from "@/actions/content";
import { type ConceptItem, type ConceptData as ConceptJsonData } from "@/lib/generator";

interface LessonModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: {
    id: string;
    title: string;
    content: string;
    order: number;
    skillId: string;
  } | null;
  selectedBook: { id: string; title: string } | null;
  selectedUnit: { id: string; title: string } | null;
  selectedSkill: { id: string; title: string } | null;
  initialOrder: number;
  onSave: (
    lessonId: string,
    skillId: string,
    lessonTitle: string,
    lessonContent: string,
    lessonOrder: number,
    refData: {
      sourceBook: string;
      sourceSection: string;
      sourceText: string;
      explanation: string;
      pageNumber: string;
      edition: string;
    } | null,
    conceptData: {
      conceptName: string;
      category: string;
      rulingLevel: "beginner" | "standard" | "advanced";
      madhhabPosition: "mutamad" | "alternative_view" | "disputed";
      notesForAdvancedStudents: string;
      data: ConceptJsonData;
    } | null
  ) => Promise<void>;
}

export default function LessonModal({
  isOpen,
  onOpenChange,
  lesson,
  selectedBook,
  selectedUnit,
  selectedSkill,
  initialOrder,
  onSave
}: LessonModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Lesson core
  const [lessId, setLessId] = useState("");
  const [lessTitle, setLessTitle] = useState("");
  const [lessContent, setLessContent] = useState("");
  const [lessOrder, setLessOrder] = useState(1);

  // Reference sub-form
  const [refSourceBook, setRefSourceBook] = useState("سفينة النجاة");
  const [refSourceSection, setRefSourceSection] = useState("");
  const [refSourceText, setRefSourceText] = useState("");
  const [refExplanation, setRefExplanation] = useState("");
  const [refPageNumber, setRefPageNumber] = useState("");
  const [refEdition, setRefEdition] = useState("طبعة دار المنهاج المعتمدة");

  // Concept sub-form
  const [conName, setConName] = useState("");
  const [conCategory, setConCategory] = useState("الطهارة");
  const [conRulingLevel, setConRulingLevel] = useState<"beginner" | "standard" | "advanced">("beginner");
  const [conPosition, setConPosition] = useState<"mutamad" | "alternative_view" | "disputed">("mutamad");
  const [conNotes, setConNotes] = useState("");

  // Structured arrays for Concept JSON data
  const [pillars, setPillars] = useState<ConceptItem[]>([]);
  const [conditions, setConditions] = useState<ConceptItem[]>([]);
  const [invalidators, setInvalidators] = useState<ConceptItem[]>([]);
  const [rulings, setRulings] = useState<ConceptItem[]>([]);
  const [commonMistakes, setCommonMistakes] = useState<ConceptItem[]>([]);

  // Array edit item inputs
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    async function loadData() {
      if (lesson) {
        setLoading(true);
        try {
          const details = await getLessonFullData(lesson.id);
          if (details) {
            setLessId(details.lesson.id);
            setLessTitle(details.lesson.title);
            setLessContent(details.lesson.content);
            setLessOrder(details.lesson.order);
            
            if (details.reference) {
              setRefSourceBook(details.reference.sourceBook);
              setRefSourceSection(details.reference.sourceSection);
              setRefSourceText(details.reference.sourceText);
              setRefExplanation(details.reference.explanation || "");
              setRefPageNumber(details.reference.pageNumber || "");
              setRefEdition(details.reference.edition || "");
            } else {
              setRefSourceBook(selectedBook?.title || "سفينة النجاة");
              setRefSourceSection(`باب ${selectedUnit?.title || ""}`);
              setRefSourceText("");
              setRefExplanation("");
              setRefPageNumber("");
              setRefEdition("طبعة دار المنهاج المعتمدة");
            }

            if (details.concept) {
              setConName(details.concept.conceptName);
              setConCategory(details.concept.category);
              setConRulingLevel(details.concept.rulingLevel);
              setConPosition(details.concept.madhhabPosition);
              setConNotes(details.concept.notesForAdvancedStudents || "");
              
              const cData = details.concept.data as ConceptJsonData;
              setPillars(cData?.pillars || []);
              setConditions(cData?.conditions || []);
              setInvalidators(cData?.invalidators || []);
              setRulings(cData?.rulings || []);
              setCommonMistakes(cData?.commonMistakes || []);
            } else {
              setConName(lesson.title);
              setConCategory("الطهارة");
              setConRulingLevel("beginner");
              setConPosition("mutamad");
              setConNotes("");
              setPillars([]);
              setConditions([]);
              setInvalidators([]);
              setRulings([]);
              setCommonMistakes([]);
            }
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        setLessId("");
        setLessTitle("");
        setLessContent("");
        setLessOrder(initialOrder);
        
        setRefSourceBook(selectedBook?.title || "سفينة النجاة");
        setRefSourceSection(`باب ${selectedUnit?.title || ""}`);
        setRefSourceText("");
        setRefExplanation("");
        setRefPageNumber("");
        setRefEdition("طبعة دار المنهاج المعتمدة");

        setConName("");
        setConCategory("الطهارة");
        setConRulingLevel("beginner");
        setConPosition("mutamad");
        setConNotes("");
        
        setPillars([]);
        setConditions([]);
        setInvalidators([]);
        setRulings([]);
        setCommonMistakes([]);
      }
    }

    void loadData();
  }, [isOpen, lesson, selectedBook, selectedUnit, initialOrder]);

  const addItemToArray = (arrayType: "pillars" | "conditions" | "invalidators" | "rulings" | "commonMistakes") => {
    if (!newTitle.trim()) return;
    const item = { title: newTitle.trim(), description: newDesc.trim() };
    
    if (arrayType === "pillars") setPillars([...pillars, item]);
    if (arrayType === "conditions") setConditions([...conditions, item]);
    if (arrayType === "invalidators") setInvalidators([...invalidators, item]);
    if (arrayType === "rulings") setRulings([...rulings, item]);
    if (arrayType === "commonMistakes") setCommonMistakes([...commonMistakes, item]);

    setNewTitle("");
    setNewDesc("");
  };

  const removeItemFromArray = (index: number, arrayType: "pillars" | "conditions" | "invalidators" | "rulings" | "commonMistakes") => {
    if (arrayType === "pillars") setPillars(pillars.filter((_, i) => i !== index));
    if (arrayType === "conditions") setConditions(conditions.filter((_, i) => i !== index));
    if (arrayType === "invalidators") setInvalidators(invalidators.filter((_, i) => i !== index));
    if (arrayType === "rulings") setRulings(rulings.filter((_, i) => i !== index));
    if (arrayType === "commonMistakes") setCommonMistakes(commonMistakes.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!lessId.trim() || !lessTitle.trim() || !selectedSkill) return;
    setSubmitting(true);
    try {
      const formattedConceptData = {
        conceptName: conName || lessTitle,
        category: conCategory,
        rulingLevel: conRulingLevel,
        madhhabPosition: conPosition,
        notesForAdvancedStudents: conNotes,
        data: {
          name: conName || lessTitle,
          pillars,
          conditions,
          invalidators,
          rulings,
          commonMistakes
        }
      };

      const formattedRefData = refSourceText ? {
        sourceBook: refSourceBook,
        sourceSection: refSourceSection,
        sourceText: refSourceText,
        explanation: refExplanation,
        pageNumber: refPageNumber,
        edition: refEdition
      } : null;

      await onSave(
        lessId.trim(),
        selectedSkill.id,
        lessTitle.trim(),
        lessContent,
        lessOrder,
        formattedRefData,
        formattedConceptData
      );
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalDialog className="dark text-slate-100 bg-[#060b17] border border-slate-800/80 rounded-2xl max-w-3xl font-sans my-4 max-h-[90vh] overflow-y-auto">
        <ModalHeader className="border-b border-slate-800/40 font-extrabold text-brand-emerald-400 flex items-center gap-1">
          <Edit3 className="w-5 h-5" /> إدارة تفاصيل الدرس والتوثيق والمفهوم
        </ModalHeader>
        {loading ? (
          <ModalBody className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 text-brand-emerald-500 animate-spin" />
            <p className="text-slate-400 text-sm">جاري تحميل البيانات الفقهية التفصيلية...</p>
          </ModalBody>
        ) : (
          <ModalBody className="py-4 space-y-6 text-xs">
            {/* Part 1: Lesson core */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-brand-gold-500 border-b border-slate-800 pb-1 flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> 1. تفاصيل متن الدرس
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">معرّف الدرس (ASCII ID):</label>
                  <input 
                    type="text" 
                    value={lessId} 
                    onChange={(e) => setLessId(e.target.value)} 
                    disabled={!!lesson}
                    placeholder="مثال: lesson_puberty" 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-brand-emerald-500"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-slate-400 font-bold">عنوان الدرس:</label>
                  <input 
                    type="text" 
                    value={lessTitle} 
                    onChange={(e) => setLessTitle(e.target.value)} 
                    placeholder="مثال: علامات البلوغ" 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-brand-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">الترتيب:</label>
                  <input 
                    type="number" 
                    value={lessOrder} 
                    onChange={(e) => setLessOrder(Number(e.target.value))} 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-brand-emerald-500"
                  />
                </div>
                <div className="space-y-1 md:col-span-3">
                  <label className="text-slate-400 font-bold">نص المتن الشرعي (بالتشكيل):</label>
                  <textarea 
                    value={lessContent} 
                    onChange={(e) => setLessContent(e.target.value)} 
                    rows={2}
                    placeholder="اكتب المتن الفقهي مشكّلاً بدقة..." 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none resize-none font-serif text-sm focus:border-brand-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Part 2: Fiqh Reference */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-brand-gold-500 border-b border-slate-800 pb-1 flex items-center gap-1.5">
                <Bookmark className="w-4 h-4" /> 2. مصادر التوثيق الشرعي والدليل
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">الكتاب المصدر:</label>
                  <input 
                    type="text" 
                    value={refSourceBook} 
                    onChange={(e) => setRefSourceBook(e.target.value)} 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-brand-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">الفصل أو الباب:</label>
                  <input 
                    type="text" 
                    value={refSourceSection} 
                    onChange={(e) => setRefSourceSection(e.target.value)} 
                    placeholder="مثال: فصل علامات البلوغ" 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-brand-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">الصفحة والطبعة:</label>
                  <input 
                    type="text" 
                    value={refPageNumber} 
                    onChange={(e) => setRefPageNumber(e.target.value)} 
                    placeholder="صفحة 12 (طبعة دار المنهاج)" 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-brand-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">الدليل الشرعي وتخريجه (أو نص المتن المعتمد كاملاً كحجة):</label>
                <textarea 
                  value={refSourceText} 
                  onChange={(e) => setRefSourceText(e.target.value)} 
                  rows={2}
                  placeholder="اكتب الحديث أو الآية المستدل بها فقهياً..." 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none resize-none font-serif text-xs focus:border-brand-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">الشرح المعتمد المرفق بالدليل:</label>
                <textarea 
                  value={refExplanation} 
                  onChange={(e) => setRefExplanation(e.target.value)} 
                  rows={2}
                  placeholder="شرح مبسط لدلالة الدليل ووجه الاستدلال في المذهب..." 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none resize-none focus:border-brand-emerald-500"
                />
              </div>
            </div>

            {/* Part 3: Concept Bank & JSON Array editors */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-brand-gold-500 border-b border-slate-800 pb-1 flex items-center gap-1.5">
                <Bookmark className="w-4 h-4" /> 3. بنك المفاهيم الفقهية المهيكلة (Concept Bank)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">اسم المفهوم فقهياً:</label>
                  <input 
                    type="text" 
                    value={conName} 
                    onChange={(e) => setConName(e.target.value)} 
                    placeholder="مثال: علامات البلوغ" 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-brand-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">التصنيف:</label>
                  <input 
                    type="text" 
                    value={conCategory} 
                    onChange={(e) => setConCategory(e.target.value)} 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-brand-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">مستوى الفروع:</label>
                  <select 
                    value={conRulingLevel} 
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setConRulingLevel(e.target.value as typeof conRulingLevel)} 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none h-[34px] focus:border-brand-emerald-500"
                  >
                    <option value="beginner">تمهيدي (Beginner)</option>
                    <option value="standard">متوسط (Standard)</option>
                    <option value="advanced">متقدم (Advanced)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">معتمد المذهب:</label>
                  <select 
                    value={conPosition} 
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setConPosition(e.target.value as typeof conPosition)} 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none h-[34px] focus:border-brand-emerald-500"
                  >
                    <option value="mutamad">المعتمد (mutamad)</option>
                    <option value="alternative_view">وجه آخر (alternative_view)</option>
                    <option value="disputed">خلاف (disputed)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">تنبيهات الخلاف وتفاصيل للمتقدمين:</label>
                <textarea 
                  value={conNotes} 
                  onChange={(e) => setConNotes(e.target.value)} 
                  rows={2}
                  placeholder="ملاحظات حول تحرير المسألة والخلاف بين المتأخرين..." 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none resize-none focus:border-brand-emerald-500"
                />
              </div>

              {/* Dynamic JSON arrays editor */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-4">
                <span className="font-extrabold text-slate-300 block pb-1 border-b border-slate-850 text-xs">
                  🔨 محرر مصفوفات المفهوم (JSON arrays) لتغذية مولد الأسئلة:
                </span>
                
                {/* Inputs to add dynamic elements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">العنوان/النص:</label>
                    <input 
                      type="text" 
                      value={newTitle} 
                      onChange={(e) => setNewTitle(e.target.value)} 
                      placeholder="العنوان (مثال: غسل الوجه)" 
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">الشرح/العلة:</label>
                    <input 
                      type="text" 
                      value={newDesc} 
                      onChange={(e) => setNewDesc(e.target.value)} 
                      placeholder="الشرح والتفسير التفصيلي..." 
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none text-xs"
                    />
                  </div>
                </div>

                {/* Arrays options to click and insert */}
                <div className="flex flex-wrap gap-2 text-[10px]">
                  <Button onClick={() => addItemToArray("pillars")} className="bg-brand-emerald-500/10 text-brand-emerald-400 border border-brand-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer">
                    <PlusCircle className="w-3.5 h-3.5" /> أضف إلى الأركان (Pillars)
                  </Button>
                  <Button onClick={() => addItemToArray("conditions")} className="bg-brand-gold-500/10 text-brand-gold-400 border border-brand-gold-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer">
                    <PlusCircle className="w-3.5 h-3.5" /> أضف إلى الشروط (Conditions)
                  </Button>
                  <Button onClick={() => addItemToArray("invalidators")} className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer">
                    <PlusCircle className="w-3.5 h-3.5" /> أضف إلى النواقض (Invalidators)
                  </Button>
                  <Button onClick={() => addItemToArray("rulings")} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer">
                    <PlusCircle className="w-3.5 h-3.5" /> أضف إلى الفروع (Rulings)
                  </Button>
                  <Button onClick={() => addItemToArray("commonMistakes")} className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer">
                    <PlusCircle className="w-3.5 h-3.5" /> أضف إلى الأخطاء الشائعة
                  </Button>
                </div>

                {/* Displaying lists to let user review/delete */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] pt-2">
                  <div className="space-y-1">
                    <span className="text-slate-300 font-bold block">الأركان المضافة ({pillars.length}):</span>
                    <ul className="space-y-1 max-h-24 overflow-y-auto bg-slate-900/40 p-2 rounded-lg">
                      {pillars.map((item, i) => (
                        <li key={i} className="flex justify-between items-center text-slate-300 bg-slate-950/30 p-1.5 rounded border border-slate-900">
                          <span><b>{item.title}</b>: {item.description}</span>
                          <Button onClick={() => removeItemFromArray(i, "pillars")} className="bg-transparent hover:text-rose-400 text-slate-500 min-w-0 p-0 h-auto"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-300 font-bold block">الشروط المضافة ({conditions.length}):</span>
                    <ul className="space-y-1 max-h-24 overflow-y-auto bg-slate-900/40 p-2 rounded-lg">
                      {conditions.map((item, i) => (
                        <li key={i} className="flex justify-between items-center text-slate-300 bg-slate-950/30 p-1.5 rounded border border-slate-900">
                          <span><b>{item.title}</b>: {item.description}</span>
                          <Button onClick={() => removeItemFromArray(i, "conditions")} className="bg-transparent hover:text-rose-400 text-slate-500 min-w-0 p-0 h-auto"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-300 font-bold block">النواقض المضافة ({invalidators.length}):</span>
                    <ul className="space-y-1 max-h-24 overflow-y-auto bg-slate-900/40 p-2 rounded-lg">
                      {invalidators.map((item, i) => (
                        <li key={i} className="flex justify-between items-center text-slate-300 bg-slate-950/30 p-1.5 rounded border border-slate-900">
                          <span><b>{item.title}</b>: {item.description}</span>
                          <Button onClick={() => removeItemFromArray(i, "invalidators")} className="bg-transparent hover:text-rose-400 text-slate-500 min-w-0 p-0 h-auto"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-300 font-bold block">الأحكام والفروع ({rulings.length}):</span>
                    <ul className="space-y-1 max-h-24 overflow-y-auto bg-slate-900/40 p-2 rounded-lg">
                      {rulings.map((item, i) => (
                        <li key={i} className="flex justify-between items-center text-slate-300 bg-slate-950/30 p-1.5 rounded border border-slate-900">
                          <span><b>{item.title}</b>: {item.description}</span>
                          <Button onClick={() => removeItemFromArray(i, "rulings")} className="bg-transparent hover:text-rose-400 text-slate-500 min-w-0 p-0 h-auto"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
        )}
        <ModalFooter className="border-t border-slate-800/40">
          <Button onClick={() => onOpenChange(false)} className="bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs">إلغلاق</Button>
          <Button 
            onClick={handleSave} 
            isDisabled={loading || submitting || !lessId.trim() || !lessTitle.trim()}
            className="bg-brand-emerald-500 hover:bg-brand-emerald-600 text-slate-950 font-bold text-xs"
          >
            {submitting ? "جاري الحفظ..." : "حفظ الدرس والمفهوم"}
          </Button>
        </ModalFooter>
      </ModalDialog>
    </Modal>
  );
}
