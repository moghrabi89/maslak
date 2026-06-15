"use client";

import { Card, CardContent, Button } from "@heroui/react";
import { ChevronRight, Plus, Loader2, Archive } from "lucide-react";
import { getUnitDetails } from "@/actions/content";

type UnitDetails = NonNullable<Awaited<ReturnType<typeof getUnitDetails>>>;
type SkillView = UnitDetails["skills"][number];

interface SkillListProps {
  selectedBook: { title: string; id: string };
  selectedUnit: { title: string; id: string };
  loadingUnit: boolean;
  skillsList: SkillView[];
  openNewSkillModal: () => void;
  handleArchiveSkill: (id: string) => void;
  handleSelectSkill: (skill: SkillView) => void;
}

export default function SkillList({
  selectedBook,
  selectedUnit,
  loadingUnit,
  skillsList,
  openNewSkillModal,
  handleArchiveSkill,
  handleSelectSkill,
}: SkillListProps) {
  return (
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
                    className="bg-slate-900 hover:bg-rose-950/20 text-rose-400 p-2 min-w-8 h-8 rounded-lg cursor-pointer"
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
  );
}
