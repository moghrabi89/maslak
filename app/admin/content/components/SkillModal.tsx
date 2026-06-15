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

interface SkillModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialOrder: number;
  onSave: (data: {
    id: string;
    title: string;
    order: number;
  }) => Promise<void>;
}

export default function SkillModal({
  isOpen,
  onOpenChange,
  initialOrder,
  onSave
}: SkillModalProps) {
  const [skillId, setSkillId] = useState("");
  const [skillTitle, setSkillTitle] = useState("");
  const [skillOrder, setSkillOrder] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSkillId("");
      setSkillTitle("");
      setSkillOrder(initialOrder);
    }
  }, [isOpen, initialOrder]);

  const handleSave = async () => {
    if (!skillId.trim() || !skillTitle.trim()) return;
    setSubmitting(true);
    try {
      await onSave({
        id: skillId.trim(),
        title: skillTitle.trim(),
        order: skillOrder
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
          <Button onClick={() => onOpenChange(false)} className="bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs">إلغلاق</Button>
          <Button 
            onClick={handleSave} 
            isDisabled={submitting || !skillId.trim() || !skillTitle.trim()}
            className="bg-brand-emerald-500 hover:bg-brand-emerald-600 text-slate-950 font-bold text-xs"
          >
            {submitting ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </ModalFooter>
      </ModalDialog>
    </Modal>
  );
}
