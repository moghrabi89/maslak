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

interface UnitModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialOrder: number;
  onSave: (data: {
    id: string;
    title: string;
    description: string;
    order: number;
  }) => Promise<void>;
}

export default function UnitModal({
  isOpen,
  onOpenChange,
  initialOrder,
  onSave
}: UnitModalProps) {
  const [unitId, setUnitId] = useState("");
  const [unitTitle, setUnitTitle] = useState("");
  const [unitDescription, setUnitDescription] = useState("");
  const [unitOrder, setUnitOrder] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUnitId("");
      setUnitTitle("");
      setUnitDescription("");
      setUnitOrder(initialOrder);
    }
  }, [isOpen, initialOrder]);

  const handleSave = async () => {
    if (!unitId.trim() || !unitTitle.trim()) return;
    setSubmitting(true);
    try {
      await onSave({
        id: unitId.trim(),
        title: unitTitle.trim(),
        description: unitDescription.trim(),
        order: unitOrder
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
          <Button onClick={() => onOpenChange(false)} className="bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs">إلغلاق</Button>
          <Button 
            onClick={handleSave} 
            isDisabled={submitting || !unitId.trim() || !unitTitle.trim()}
            className="bg-brand-emerald-500 hover:bg-brand-emerald-600 text-slate-950 font-bold text-xs"
          >
            {submitting ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </ModalFooter>
      </ModalDialog>
    </Modal>
  );
}
