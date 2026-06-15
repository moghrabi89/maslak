"use client";

import { Card, CardContent, Button } from "@heroui/react";
import { BookOpen, Plus, Edit3, Archive } from "lucide-react";
import { getLevelsWithBooks } from "@/actions/content";

type LevelsWithBooks = Awaited<ReturnType<typeof getLevelsWithBooks>>;
type LevelView = LevelsWithBooks[number];
type BookView = LevelView["books"][number];

interface BookListProps {
  levels: LevelsWithBooks;
  openNewBookModal: (lvlId: number) => void;
  openEditBookModal: (book: BookView) => void;
  handleArchiveBook: (id: string) => void;
  handleSelectBook: (book: BookView) => void;
}

export default function BookList({
  levels,
  openNewBookModal,
  openEditBookModal,
  handleArchiveBook,
  handleSelectBook,
}: BookListProps) {
  return (
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
  );
}
