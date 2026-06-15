"use client";

import { useState, useEffect, type ChangeEvent } from "react";
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
  BookOpen, 
  Plus, 
  FileText, 
  Bookmark, 
  FolderPlus, 
  Edit3, 
  Archive, 
  ArrowLeft,
  ChevronRight,
  Loader2,
  Trash2,
  Send,
  PlusCircle
} from "lucide-react";
import { 
  getLevelsWithBooks,
  getBookDetails,
  getUnitDetails,
  getSkillDetails,
  getLessonFullData,
  createBook,
  updateBook,
  archiveBook,
  createUnit,
  archiveUnit,
  createSkill,
  archiveSkill,
  saveFullLessonData,
  archiveLesson,
  submitForReview
} from "@/actions/content";

type LevelsWithBooks = Awaited<ReturnType<typeof getLevelsWithBooks>>;
type LevelView = LevelsWithBooks[number];
type BookView = LevelView["books"][number];
type BookDetails = NonNullable<Awaited<ReturnType<typeof getBookDetails>>>;
type UnitView = BookDetails["units"][number];
type UnitDetails = NonNullable<Awaited<ReturnType<typeof getUnitDetails>>>;
type SkillView = UnitDetails["skills"][number];
type SkillDetails = NonNullable<Awaited<ReturnType<typeof getSkillDetails>>>;
type LessonView = SkillDetails["lessons"][number];
type LessonFullData = NonNullable<Awaited<ReturnType<typeof getLessonFullData>>>;
type ConceptPreview = NonNullable<LessonFullData["concept"]>;
type ConceptListKey = "pillars" | "conditions" | "invalidators" | "rulings" | "commonMistakes";

interface ConceptItem {
  title: string;
  description: string;
}

type ConceptJsonData = Partial<Record<ConceptListKey, ConceptItem[]>>;

export default function AdminContentPage() {
  // Navigation states
  const [levels, setLevels] = useState<LevelsWithBooks>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBook, setSelectedBook] = useState<BookView | BookDetails | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<UnitView | UnitDetails | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillView | SkillDetails | null>(null);
  
  // Loading sub-items states
  const [loadingBook, setLoadingBook] = useState<boolean>(false);
  const [loadingUnit, setLoadingUnit] = useState<boolean>(false);
  const [loadingSkill, setLoadingSkill] = useState<boolean>(false);
  
  // Lists for display
  const [unitsList, setUnitsList] = useState<UnitView[]>([]);
  const [skillsList, setSkillsList] = useState<SkillView[]>([]);
  const [lessonsList, setLessonsList] = useState<LessonView[]>([]);
  
  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState<boolean>(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState<boolean>(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState<boolean>(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState<boolean>(false);
  
  // Editing contexts
  const [editingBook, setEditingBook] = useState<BookView | null>(null);
  
  // Form values - Book
  const [bookId, setBookId] = useState("");
  const [bookLevelId, setBookLevelId] = useState(0);
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookDescription, setBookDescription] = useState("");
  const [bookOrder, setBookOrder] = useState(1);

  // Form values - Unit
  const [unitId, setUnitId] = useState("");
  const [unitTitle, setUnitTitle] = useState("");
  const [unitDescription, setUnitDescription] = useState("");
  const [unitOrder, setUnitOrder] = useState(1);

  // Form values - Skill
  const [skillId, setSkillId] = useState("");
  const [skillTitle, setSkillTitle] = useState("");
  const [skillOrder, setSkillOrder] = useState(1);

  // Form values - Full Lesson (Lesson + Reference + Concept)
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

  const loadLevels = async () => {
    setLoading(true);
    const data = await getLevelsWithBooks();
    setLevels(data);
    setLoading(false);
  };

  // Load levels on init
  useEffect(() => {
    let isActive = true;

    async function loadInitialLevels() {
      setLoading(true);
      const data = await getLevelsWithBooks();
      if (!isActive) return;
      setLevels(data);
      setLoading(false);
    }

    void loadInitialLevels();

    return () => {
      isActive = false;
    };
  }, []);

  // Selection handlers
  const handleSelectBook = async (book: BookView | BookDetails) => {
    setSelectedBook(book);
    setSelectedUnit(null);
    setSelectedSkill(null);
    
    setLoadingBook(true);
    const details = await getBookDetails(book.id);
    if (details) {
      setUnitsList(details.units);
    }
    setLoadingBook(false);
  };

  const handleSelectUnit = async (unit: UnitView | UnitDetails) => {
    setSelectedUnit(unit);
    setSelectedSkill(null);
    
    setLoadingUnit(true);
    const details = await getUnitDetails(unit.id);
    if (details) {
      setSkillsList(details.skills);
    }
    setLoadingUnit(false);
  };

  const handleSelectSkill = async (skill: SkillView | SkillDetails) => {
    setSelectedSkill(skill);
    
    setLoadingSkill(true);
    const details = await getSkillDetails(skill.id);
    if (details) {
      setLessonsList(details.lessons);
    }
    setLoadingSkill(false);
  };

  // Form setup functions
  const openNewBookModal = (lvlId: number) => {
    setEditingBook(null);
    setBookLevelId(lvlId);
    setBookId("");
    setBookTitle("");
    setBookAuthor("");
    setBookDescription("");
    setBookOrder((levels.find(l => l.id === lvlId)?.books.length ?? 0) + 1);
    setIsBookModalOpen(true);
  };

  const openEditBookModal = (book: BookView) => {
    setEditingBook(book);
    setBookLevelId(book.levelId);
    setBookId(book.id);
    setBookTitle(book.title);
    setBookAuthor(book.author);
    setBookDescription(book.description || "");
    setBookOrder(book.order);
    setIsBookModalOpen(true);
  };

  const openNewUnitModal = () => {
    setUnitId("");
    setUnitTitle("");
    setUnitDescription("");
    setUnitOrder(unitsList.length + 1);
    setIsUnitModalOpen(true);
  };

  const openNewSkillModal = () => {
    setSkillId("");
    setSkillTitle("");
    setSkillOrder(skillsList.length + 1);
    setIsSkillModalOpen(true);
  };

  const openLessonModalForEdit = async (lesson: LessonView) => {
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
    setIsLessonModalOpen(true);
  };

  const openNewLessonModal = () => {
    setLessId("");
    setLessTitle("");
    setLessContent("");
    setLessOrder(lessonsList.length + 1);
    
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
    
    setIsLessonModalOpen(true);
  };

  // Database Mutations Handlers
  const handleSaveBook = async () => {
    if (!bookId || !bookTitle || !bookAuthor) return;
    
    if (editingBook) {
      await updateBook(bookId, {
        title: bookTitle,
        author: bookAuthor,
        description: bookDescription,
        order: bookOrder
      });
    } else {
      await createBook({
        id: bookId,
        levelId: bookLevelId,
        title: bookTitle,
        author: bookAuthor,
        description: bookDescription,
        order: bookOrder
      });
    }
    
    setIsBookModalOpen(false);
    loadLevels();
    if (selectedBook && selectedBook.id === bookId) {
      handleSelectBook({ ...selectedBook, title: bookTitle, author: bookAuthor });
    }
  };

  const handleSaveUnit = async () => {
    if (!unitId || !unitTitle || !selectedBook) return;

    await createUnit({
      id: unitId,
      bookId: selectedBook.id,
      title: unitTitle,
      description: unitDescription,
      order: unitOrder
    });

    setIsUnitModalOpen(false);
    handleSelectBook(selectedBook);
  };

  const handleSaveSkill = async () => {
    if (!skillId || !skillTitle || !selectedUnit) return;

    await createSkill({
      id: skillId,
      unitId: selectedUnit.id,
      title: skillTitle,
      order: skillOrder
    });

    setIsSkillModalOpen(false);
    handleSelectUnit(selectedUnit);
  };

  const handleSaveFullLesson = async () => {
    if (!lessId || !lessTitle || !selectedSkill) return;

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

    await saveFullLessonData(
      lessId,
      selectedSkill.id,
      lessTitle,
      lessContent,
      lessOrder,
      formattedRefData,
      formattedConceptData
    );

    setIsLessonModalOpen(false);
    handleSelectSkill(selectedSkill);
  };

  // Submit & Soft Archive actions
  const handleSubmitReview = async (type: "lesson" | "concept", id: string) => {
    await submitForReview(type, id);
    if (selectedSkill) handleSelectSkill(selectedSkill);
  };

  const handleArchiveBook = async (id: string) => {
    if (confirm("هل أنت متأكد من أرشفة هذا الكتاب؟ لن يُحذف فحص تقدّم الطلاب القديم.")) {
      await archiveBook(id);
      loadLevels();
      setSelectedBook(null);
    }
  };

  const handleArchiveUnit = async (id: string) => {
    if (confirm("هل أنت متأكد من أرشفة هذه الوحدة؟")) {
      await archiveUnit(id);
      if (selectedBook) handleSelectBook(selectedBook);
    }
  };

  const handleArchiveSkill = async (id: string) => {
    if (confirm("هل أنت متأكد من أرشفة هذه المهارة؟")) {
      await archiveSkill(id);
      if (selectedUnit) handleSelectUnit(selectedUnit);
    }
  };

  const handleArchiveLesson = async (id: string) => {
    if (confirm("هل أنت متأكد من أرشفة هذا الدرس؟")) {
      await archiveLesson(id);
      if (selectedSkill) handleSelectSkill(selectedSkill);
    }
  };

  // JSON Items helpers
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

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-800/60 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-200 flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-brand-emerald-400" />
            إدارة المحتوى المنهجي 📖
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            إدخال وتعديل وتصنيف كتب الفقه الشافعي، ورفع المتون والمفاهيم المهيكلة لتقديم الحوكمة العلمية.
          </p>
        </div>

        {selectedBook && (
          <Button 
            onClick={() => {
              if (selectedSkill) setSelectedSkill(null);
              else if (selectedUnit) setSelectedUnit(null);
              else setSelectedBook(null);
            }}
            className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 font-bold text-xs py-2 px-4 rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> رجوع
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-10 h-10 text-brand-emerald-500 animate-spin" />
          <p className="text-slate-400 text-sm">جاري تحميل المحتوى الفقهي...</p>
        </div>
      ) : !selectedBook ? (
        // 1. Levels and Books view
        <div className="space-y-8">
          {levels.map((lvl) => (
            <div key={lvl.id} className="space-y-4">
              <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-slate-850">
                <div>
                  <h2 className="text-base font-extrabold text-brand-gold-400">{lvl.title}</h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">{lvl.description}</p>
                </div>
                <Button 
                  onClick={() => openNewBookModal(lvl.id)}
                  className="bg-brand-emerald-500/10 text-brand-emerald-400 border border-brand-emerald-500/20 hover:bg-brand-emerald-500/20 text-[10px] font-bold py-1.5 px-3 rounded-lg cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> إضافة كتاب
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {lvl.books.length > 0 ? (
                  lvl.books.map((book) => (
                    <Card 
                      key={book.id} 
                      className="glass-panel border-slate-800/80 text-slate-100 hover:border-brand-emerald-500/20 cursor-pointer transition-all hover:scale-[1.01]"
                    >
                      <CardContent className="p-4 space-y-3" onClick={() => handleSelectBook(book)}>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-brand-emerald-950/40 rounded-lg text-brand-emerald-400">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-200 text-sm">{book.title}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">المؤلف: {book.author}</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 min-h-8">{book.description || "لا يوجد وصف لهذا الكتاب."}</p>
                        
                        <div className="flex justify-between items-center pt-2 border-t border-slate-850 text-[10px]">
                          <span className="px-2 py-0.5 rounded-full bg-slate-900/50 text-slate-400 border border-slate-800">
                            ترتيب: {book.order}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full font-bold ${
                            book.status === "published" 
                              ? "bg-brand-emerald-500/10 text-brand-emerald-400" 
                              : "bg-brand-gold-500/10 text-brand-gold-400"
                          }`}>
                            {book.status === "published" ? "منشور" : "مسودة"}
                          </span>
                        </div>
                      </CardContent>
                      
                      {/* Admin Book Actions Overlay */}
                      <div className="p-3 bg-slate-950/20 border-t border-slate-900 flex justify-end gap-2">
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditBookModal(book);
                          }}
                          className="bg-slate-900 hover:bg-slate-850 text-slate-300 min-w-8 h-8 rounded-lg"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchiveBook(book.id);
                          }}
                          className="bg-slate-900 hover:bg-rose-950/20 text-rose-400 min-w-8 h-8 rounded-lg"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-6 text-slate-500 text-xs border border-dashed border-slate-850 rounded-xl">
                    لا توجد كتب مضافة في هذا المستوى حالياً.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : !selectedUnit ? (
        // 2. Units list inside Book
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/20 p-2.5 rounded-xl border border-slate-850">
            <span>المستويات</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-200 font-bold">{selectedBook.title}</span>
          </div>

          <div className="flex justify-between items-center pb-2">
            <h3 className="text-lg font-bold text-slate-300">الوحدات الفقهية داخل الكتاب ({selectedBook.title})</h3>
            <Button 
              onClick={openNewUnitModal}
              className="bg-brand-emerald-500 hover:bg-brand-emerald-600 text-slate-950 font-bold text-xs py-2 px-4 rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              <FolderPlus className="w-4 h-4" /> إضافة وحدة فقهية
            </Button>
          </div>

          {loadingBook ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-brand-emerald-500 animate-spin" />
            </div>
          ) : unitsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unitsList.map((unit) => (
                <Card 
                  key={unit.id} 
                  className="glass-panel border-slate-800/80 text-slate-100 hover:border-brand-emerald-500/20 cursor-pointer"
                  onClick={() => handleSelectUnit(unit)}
                >
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-extrabold text-slate-200 text-sm">{unit.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">{unit.description || "لا يوجد وصف لهذه الوحدة."}</p>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <span className="px-2 py-0.5 rounded-full bg-slate-900/50 text-[10px] text-slate-400 border border-slate-800">
                        ترتيب: {unit.order}
                      </span>
                      <Button 
                        onClick={() => handleArchiveUnit(unit.id)}
                        className="bg-slate-900 hover:bg-rose-950/25 text-rose-400 p-2 min-w-8 h-8 rounded-lg"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 border border-dashed border-slate-850 rounded-2xl">
              لا توجد وحدات فقهية مضافة حالياً.
            </div>
          )}
        </div>
      ) : !selectedSkill ? (
        // 3. Skills list inside Unit
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/20 p-2.5 rounded-xl border border-slate-850">
            <span>{selectedBook.title}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-200 font-bold">الوحدة: {selectedUnit.title}</span>
          </div>

          <div className="flex justify-between items-center pb-2">
            <h3 className="text-lg font-bold text-slate-300">المهارات والعقد التعليمية (Skills)</h3>
            <Button 
              onClick={openNewSkillModal}
              className="bg-brand-emerald-500 hover:bg-brand-emerald-600 text-slate-950 font-bold text-xs py-2 px-4 rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> إضافة مهارة
            </Button>
          </div>

          {loadingUnit ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-brand-emerald-500 animate-spin" />
            </div>
          ) : skillsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {skillsList.map((skill) => (
                <Card 
                  key={skill.id} 
                  className="glass-panel border-slate-800/80 text-slate-100 hover:border-brand-emerald-500/20 cursor-pointer"
                  onClick={() => handleSelectSkill(skill)}
                >
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-extrabold text-slate-200 text-sm">{skill.title}</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5">معرّف: {skill.id}</p>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <span className="px-2 py-0.5 rounded-full bg-slate-900/50 text-[9px] text-slate-400 border border-slate-800">
                        {skill.order}
                      </span>
                      <Button 
                        onClick={() => handleArchiveSkill(skill.id)}
                        className="bg-slate-900 hover:bg-rose-950/20 text-rose-400 p-2 min-w-8 h-8 rounded-lg"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 border border-dashed border-slate-850 rounded-2xl">
              لا توجد مهارات مضافة حالياً.
            </div>
          )}
        </div>
      ) : (
        // 4. Lessons list inside Skill (Lessons, References, Concepts CRUD)
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
      )}

      {/* Book Add/Edit Modal */}
      <Modal isOpen={isBookModalOpen} onOpenChange={setIsBookModalOpen}>
        <ModalDialog className="dark text-slate-100 bg-[#070d1e] border border-slate-800/80 rounded-2xl max-w-lg font-sans">
          <ModalHeader className="border-b border-slate-800/40 font-extrabold text-brand-emerald-400">
            {editingBook ? "تعديل كتاب فقهي" : "إضافة كتاب فقهي جديد"}
          </ModalHeader>
          <ModalBody className="py-4 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold">معرّف الكتاب (ASCII ID):</label>
                <input 
                  type="text" 
                  value={bookId} 
                  onChange={(e) => setBookId(e.target.value)} 
                  disabled={!!editingBook}
                  placeholder="مثال: safina" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-brand-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 font-bold">ترتيب الكتاب:</label>
                <input 
                  type="number" 
                  value={bookOrder} 
                  onChange={(e) => setBookOrder(Number(e.target.value))} 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-brand-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold">اسم الكتاب:</label>
                <input 
                  type="text" 
                  value={bookTitle} 
                  onChange={(e) => setBookTitle(e.target.value)} 
                  placeholder="مثال: سفينة النجاة" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-brand-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 font-bold">المؤلف:</label>
                <input 
                  type="text" 
                  value={bookAuthor} 
                  onChange={(e) => setBookAuthor(e.target.value)} 
                  placeholder="مثال: سالم بن سمير الحضرمي" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-brand-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">وصف الكتاب:</label>
              <textarea 
                value={bookDescription} 
                onChange={(e) => setBookDescription(e.target.value)} 
                rows={3}
                placeholder="وصف مختصر لمستوى ومحتوى الكتاب..." 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-brand-emerald-500 resize-none"
              />
            </div>
          </ModalBody>
          <ModalFooter className="border-t border-slate-800/40">
            <Button 
              onClick={() => setIsBookModalOpen(false)}
              className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 font-bold text-xs"
            >
              إلغلاق
            </Button>
            <Button 
              onClick={handleSaveBook}
              className="bg-brand-emerald-500 hover:bg-brand-emerald-600 text-slate-950 font-bold text-xs"
            >
              حفظ
            </Button>
          </ModalFooter>
        </ModalDialog>
      </Modal>

      {/* Unit Add/Edit Modal */}
      <Modal isOpen={isUnitModalOpen} onOpenChange={setIsUnitModalOpen}>
        <ModalDialog className="dark text-slate-100 bg-[#070d1e] border border-slate-800/80 rounded-2xl max-w-lg font-sans">
          <ModalHeader className="border-b border-slate-800/40 font-extrabold text-brand-emerald-400">
            إضافة وحدة فقهية جديدة
          </ModalHeader>
          <ModalBody className="py-4 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold">معرّف الوحدة (ASCII ID):</label>
                <input 
                  type="text" 
                  value={unitId} 
                  onChange={(e) => setUnitId(e.target.value)} 
                  placeholder="مثال: safina_taharah" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 font-bold">الترتيب:</label>
                <input 
                  type="number" 
                  value={unitOrder} 
                  onChange={(e) => setUnitOrder(Number(e.target.value))} 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">عنوان الوحدة:</label>
              <input 
                type="text" 
                value={unitTitle} 
                onChange={(e) => setUnitTitle(e.target.value)} 
                placeholder="مثال: باب الطهارة" 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">وصف الوحدة:</label>
              <textarea 
                value={unitDescription} 
                onChange={(e) => setUnitDescription(e.target.value)} 
                rows={3}
                placeholder="تفاصيل ما يدرسه الطالب في هذه الوحدة..." 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none resize-none"
              />
            </div>
          </ModalBody>
          <ModalFooter className="border-t border-slate-800/40">
            <Button onClick={() => setIsUnitModalOpen(false)} className="bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs">إلغلاق</Button>
            <Button onClick={handleSaveUnit} className="bg-brand-emerald-500 hover:bg-brand-emerald-600 text-slate-950 font-bold text-xs">حفظ</Button>
          </ModalFooter>
        </ModalDialog>
      </Modal>

      {/* Skill Add Modal */}
      <Modal isOpen={isSkillModalOpen} onOpenChange={setIsSkillModalOpen}>
        <ModalDialog className="dark text-slate-100 bg-[#070d1e] border border-slate-800/80 rounded-2xl max-w-md font-sans">
          <ModalHeader className="border-b border-slate-800/40 font-extrabold text-brand-emerald-400">
            إضافة مهارة تعليمية جديدة
          </ModalHeader>
          <ModalBody className="py-4 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold">معرّف المهارة (ASCII ID):</label>
                <input 
                  type="text" 
                  value={skillId} 
                  onChange={(e) => setSkillId(e.target.value)} 
                  placeholder="مثال: skill_puberty" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 font-bold">ترتيب المهارة:</label>
                <input 
                  type="number" 
                  value={skillOrder} 
                  onChange={(e) => setSkillOrder(Number(e.target.value))} 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">اسم المهارة:</label>
              <input 
                type="text" 
                value={skillTitle} 
                onChange={(e) => setSkillTitle(e.target.value)} 
                placeholder="مثال: علامات البلوغ" 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
              />
            </div>
          </ModalBody>
          <ModalFooter className="border-t border-slate-800/40">
            <Button onClick={() => setIsSkillModalOpen(false)} className="bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs">إلغلاق</Button>
            <Button onClick={handleSaveSkill} className="bg-brand-emerald-500 hover:bg-brand-emerald-600 text-slate-950 font-bold text-xs">حفظ</Button>
          </ModalFooter>
        </ModalDialog>
      </Modal>

      {/* Lesson Full Form Dialog (Lesson + Reference + Concept JSON) */}
      <Modal isOpen={isLessonModalOpen} onOpenChange={setIsLessonModalOpen}>
        <ModalDialog className="dark text-slate-100 bg-[#060b17] border border-slate-800/80 rounded-2xl max-w-3xl font-sans my-4 max-h-[90vh] overflow-y-auto">
          <ModalHeader className="border-b border-slate-800/40 font-extrabold text-brand-emerald-400 flex items-center gap-1">
            <Edit3 className="w-5 h-5" /> إدارة تفاصيل الدرس والتوثيق والمفهوم
          </ModalHeader>
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
                    placeholder="مثال: lesson_puberty" 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-slate-400 font-bold">عنوان الدرس:</label>
                  <input 
                    type="text" 
                    value={lessTitle} 
                    onChange={(e) => setLessTitle(e.target.value)} 
                    placeholder="مثال: علامات البلوغ" 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
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
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                  />
                </div>
                <div className="space-y-1 md:col-span-3">
                  <label className="text-slate-400 font-bold">نص المتن الشرعي (بالتشكيل):</label>
                  <textarea 
                    value={lessContent} 
                    onChange={(e) => setLessContent(e.target.value)} 
                    rows={2}
                    placeholder="اكتب المتن الفقهي مشكّلاً بدقة..." 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none resize-none font-serif text-sm"
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
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">الفصل أو الباب:</label>
                  <input 
                    type="text" 
                    value={refSourceSection} 
                    onChange={(e) => setRefSourceSection(e.target.value)} 
                    placeholder="مثال: فصل علامات البلوغ" 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">الصفحة والطبعة:</label>
                  <input 
                    type="text" 
                    value={refPageNumber} 
                    onChange={(e) => setRefPageNumber(e.target.value)} 
                    placeholder="صفحة 12 (طبعة دار المنهاج)" 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">الدليل الشرعي وتخريجه (اختياري ولكن يوصى به):</label>
                <textarea 
                  value={refSourceText} 
                  onChange={(e) => setRefSourceText(e.target.value)} 
                  rows={2}
                  placeholder="اكتب الحديث أو الآية المستدل بها فقهياً..." 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none resize-none font-serif text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">الشرح المعتمد المرفق بالدليل:</label>
                <textarea 
                  value={refExplanation} 
                  onChange={(e) => setRefExplanation(e.target.value)} 
                  rows={2}
                  placeholder="شرح مبسط لدلالة الدليل ووجه الاستدلال في المذهب..." 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none resize-none"
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
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">التصنيف:</label>
                  <input 
                    type="text" 
                    value={conCategory} 
                    onChange={(e) => setConCategory(e.target.value)} 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold">مستوى الفروع:</label>
                  <select 
                    value={conRulingLevel} 
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setConRulingLevel(e.target.value as typeof conRulingLevel)} 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none h-[34px]"
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
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none h-[34px]"
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
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none resize-none"
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
          <ModalFooter className="border-t border-slate-800/40">
            <Button onClick={() => setIsLessonModalOpen(false)} className="bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs">إلغلاق</Button>
            <Button onClick={handleSaveFullLesson} className="bg-brand-emerald-500 hover:bg-brand-emerald-600 text-slate-950 font-bold text-xs">حفظ الدرس والمفهوم</Button>
          </ModalFooter>
        </ModalDialog>
      </Modal>
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
