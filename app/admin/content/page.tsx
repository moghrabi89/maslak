"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import BookModal from "./components/BookModal";
import UnitModal from "./components/UnitModal";
import SkillModal from "./components/SkillModal";
import LessonModal from "./components/LessonModal";
import BookList from "./components/BookList";
import UnitList from "./components/UnitList";
import SkillList from "./components/SkillList";
import LessonList from "./components/LessonList";
import { 
  BookOpen, 
  ArrowLeft,
  Loader2
} from "lucide-react";
import { 
  getLevelsWithBooks,
  getBookDetails,
  getUnitDetails,
  getSkillDetails,
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
  const [bookLevelId, setBookLevelId] = useState<number>(0);
  const [selectedLessonForModal, setSelectedLessonForModal] = useState<LessonView | null>(null);

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
    setIsBookModalOpen(true);
  };

  const openEditBookModal = (book: BookView) => {
    setEditingBook(book);
    setBookLevelId(book.levelId);
    setIsBookModalOpen(true);
  };

  const openNewUnitModal = () => {
    setIsUnitModalOpen(true);
  };

  const openNewSkillModal = () => {
    setIsSkillModalOpen(true);
  };

  const openLessonModalForEdit = async (lesson: LessonView) => {
    setSelectedLessonForModal(lesson);
    setIsLessonModalOpen(true);
  };

  const openNewLessonModal = () => {
    setSelectedLessonForModal(null);
    setIsLessonModalOpen(true);
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
        <BookList
          levels={levels}
          openNewBookModal={openNewBookModal}
          openEditBookModal={openEditBookModal}
          handleArchiveBook={handleArchiveBook}
          handleSelectBook={handleSelectBook}
        />
      ) : !selectedUnit ? (
        <UnitList
          selectedBook={selectedBook}
          loadingBook={loadingBook}
          unitsList={unitsList}
          openNewUnitModal={openNewUnitModal}
          handleArchiveUnit={handleArchiveUnit}
          handleSelectUnit={handleSelectUnit}
        />
      ) : !selectedSkill ? (
        <SkillList
          selectedBook={selectedBook}
          selectedUnit={selectedUnit}
          loadingUnit={loadingUnit}
          skillsList={skillsList}
          openNewSkillModal={openNewSkillModal}
          handleArchiveSkill={handleArchiveSkill}
          handleSelectSkill={handleSelectSkill}
        />
      ) : (
        <LessonList
          selectedBook={selectedBook}
          selectedUnit={selectedUnit}
          selectedSkill={selectedSkill}
          loadingSkill={loadingSkill}
          lessonsList={lessonsList}
          openNewLessonModal={openNewLessonModal}
          openLessonModalForEdit={openLessonModalForEdit}
          handleArchiveLesson={handleArchiveLesson}
          handleSubmitReview={handleSubmitReview}
        />
      )}

      {/* Book Add/Edit Modal */}
      <BookModal
        isOpen={isBookModalOpen}
        onOpenChange={setIsBookModalOpen}
        editingBook={editingBook}
        bookLevelId={bookLevelId}
        initialOrder={(levels.find((l) => l.id === bookLevelId)?.books.length ?? 0) + 1}
        onSave={async (data) => {
          if (editingBook) {
            await updateBook(data.id, {
              title: data.title,
              author: data.author,
              description: data.description,
              order: data.order
            });
          } else {
            await createBook(data);
          }
          loadLevels();
          if (selectedBook && selectedBook.id === data.id) {
            handleSelectBook({ ...selectedBook, title: data.title, author: data.author });
          }
        }}
      />

      {/* Unit Add/Edit Modal */}
      <UnitModal
        isOpen={isUnitModalOpen}
        onOpenChange={setIsUnitModalOpen}
        initialOrder={unitsList.length + 1}
        onSave={async (data) => {
          if (!selectedBook) return;
          await createUnit({
            id: data.id,
            bookId: selectedBook.id,
            title: data.title,
            description: data.description,
            order: data.order
          });
          handleSelectBook(selectedBook);
        }}
      />

      {/* Skill Add Modal */}
      <SkillModal
        isOpen={isSkillModalOpen}
        onOpenChange={setIsSkillModalOpen}
        initialOrder={skillsList.length + 1}
        onSave={async (data) => {
          if (!selectedUnit) return;
          await createSkill({
            id: data.id,
            unitId: selectedUnit.id,
            title: data.title,
            order: data.order
          });
          handleSelectUnit(selectedUnit);
        }}
      />

      {/* Lesson Full Form Dialog */}
      <LessonModal
        isOpen={isLessonModalOpen}
        onOpenChange={setIsLessonModalOpen}
        lesson={selectedLessonForModal}
        selectedBook={selectedBook}
        selectedUnit={selectedUnit}
        selectedSkill={selectedSkill}
        initialOrder={lessonsList.length + 1}
        onSave={async (lessonId, skillId, lessonTitle, lessonContent, lessonOrder, refData, conceptData) => {
          await saveFullLessonData(
            lessonId,
            skillId,
            lessonTitle,
            lessonContent,
            lessonOrder,
            refData,
            conceptData
          );
          if (selectedSkill) handleSelectSkill(selectedSkill);
        }}
      />
    </div>
  );
}
