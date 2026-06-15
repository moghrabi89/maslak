"use client";

import { Card, CardContent, Button } from "@heroui/react";
import { ChevronRight, FolderPlus, Loader2, Archive } from "lucide-react";
import { getBookDetails } from "@/actions/content";

type BookDetails = NonNullable<Awaited<ReturnType<typeof getBookDetails>>>;
type UnitView = BookDetails["units"][number];

interface UnitListProps {
  selectedBook: { title: string; id: string };
  loadingBook: boolean;
  unitsList: UnitView[];
  openNewUnitModal: () => void;
  handleArchiveUnit: (id: string) => void;
  handleSelectUnit: (unit: UnitView) => void;
}

export default function UnitList({
  selectedBook,
  loadingBook,
  unitsList,
  openNewUnitModal,
  handleArchiveUnit,
  handleSelectUnit,
}: UnitListProps) {
  return (
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
                    className="bg-slate-900 hover:bg-rose-950/25 text-rose-400 p-2 min-w-8 h-8 rounded-lg cursor-pointer"
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
  );
}
