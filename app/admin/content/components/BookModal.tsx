"use client";

import { useState, useEffect } from "react";
import { 
  Modal, 
  ModalDialog, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button 
} from "@heroui/react";

interface BookModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingBook: {
    id: string;
    levelId: number;
    title: string;
    author: string;
    description: string | null;
    order: number;
  } | null;
  bookLevelId: number;
  initialOrder: number;
  onSave: (data: {
    id: string;
    levelId: number;
    title: string;
    author: string;
    description: string;
    order: number;
  }) => Promise<void>;
}

export default function BookModal({
  isOpen,
  onOpenChange,
  editingBook,
  bookLevelId,
  initialOrder,
  onSave
}: BookModalProps) {
  const [bookId, setBookId] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookDescription, setBookDescription] = useState("");
  const [bookOrder, setBookOrder] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingBook) {
        setBookId(editingBook.id);
        setBookTitle(editingBook.title);
        setBookAuthor(editingBook.author);
        setBookDescription(editingBook.description || "");
        setBookOrder(editingBook.order);
      } else {
        setBookId("");
        setBookTitle("");
        setBookAuthor("");
        setBookDescription("");
        setBookOrder(initialOrder);
      }
    }
  }, [isOpen, editingBook, initialOrder]);

  const handleSave = async () => {
    if (!bookId.trim() || !bookTitle.trim() || !bookAuthor.trim()) return;
    setSubmitting(true);
    try {
      await onSave({
        id: bookId.trim(),
        levelId: bookLevelId,
        title: bookTitle.trim(),
        author: bookAuthor.trim(),
        description: bookDescription.trim(),
        order: bookOrder
      });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
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
            onClick={() => onOpenChange(false)}
            className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 font-bold text-xs"
          >
            إغلاق
          </Button>
          <Button 
            onClick={handleSave}
            isDisabled={submitting || !bookId.trim() || !bookTitle.trim() || !bookAuthor.trim()}
            className="bg-brand-emerald-500 hover:bg-brand-emerald-600 text-slate-950 font-bold text-xs"
          >
            {submitting ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </ModalFooter>
      </ModalDialog>
    </Modal>
  );
}
