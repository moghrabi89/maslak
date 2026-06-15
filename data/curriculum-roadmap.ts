export type CurriculumBookType = "matn" | "commentary" | "reference";
export type CurriculumRoadmapStatus = "draft" | "reviewed" | "approved" | "published" | "archived";

export interface CurriculumRoadmapBook {
  id: string;
  title: string;
  levelId: number;
  type: CurriculumBookType;
  status: CurriculumRoadmapStatus;
  productUse: "student_path" | "advanced_path" | "source_reference";
}

export const CURRICULUM_ROADMAP: CurriculumRoadmapBook[] = [
  { id: "safina", title: "سفينة النجاة", levelId: 0, type: "matn", status: "published", productUse: "student_path" },
  { id: "yaqut", title: "الياقوت النفيس", levelId: 0, type: "matn", status: "draft", productUse: "student_path" },
  { id: "muqaddimah_hadramiyyah", title: "المقدمة الحضرمية", levelId: 0, type: "matn", status: "draft", productUse: "student_path" },
  { id: "abi_shuja", title: "متن أبي شجاع", levelId: 1, type: "matn", status: "draft", productUse: "student_path" },
  { id: "fath_alqareeb", title: "فتح القريب", levelId: 1, type: "commentary", status: "draft", productUse: "student_path" },
  { id: "kifayat_alakhyar", title: "كفاية الأخيار", levelId: 1, type: "commentary", status: "draft", productUse: "advanced_path" },
  { id: "umdat_assalik", title: "عمدة السالك", levelId: 2, type: "matn", status: "draft", productUse: "advanced_path" },
  { id: "manhaj_alqawim", title: "المنهج القويم", levelId: 2, type: "commentary", status: "draft", productUse: "advanced_path" },
  { id: "fath_almuin", title: "فتح المعين", levelId: 2, type: "commentary", status: "draft", productUse: "advanced_path" },
  { id: "ianat_attalibin", title: "إعانة الطالبين", levelId: 2, type: "commentary", status: "draft", productUse: "source_reference" },
  { id: "minhaj_attalibin", title: "منهاج الطالبين", levelId: 3, type: "matn", status: "draft", productUse: "advanced_path" },
  { id: "mughni_almuhtaj", title: "مغني المحتاج", levelId: 3, type: "commentary", status: "draft", productUse: "source_reference" },
  { id: "nihayat_almuhtaj", title: "نهاية المحتاج", levelId: 3, type: "commentary", status: "draft", productUse: "source_reference" },
  { id: "tuhfat_almuhtaj", title: "تحفة المحتاج", levelId: 3, type: "commentary", status: "draft", productUse: "source_reference" },
  { id: "hawashi_shirwani", title: "حواشي الشرواني والعبادي", levelId: 3, type: "reference", status: "draft", productUse: "source_reference" },
  { id: "muhazzab", title: "المهذب", levelId: 4, type: "reference", status: "draft", productUse: "source_reference" },
  { id: "majmu", title: "المجموع", levelId: 4, type: "reference", status: "draft", productUse: "source_reference" },
  { id: "rawdat_attalibin", title: "روضة الطالبين", levelId: 4, type: "reference", status: "draft", productUse: "source_reference" },
  { id: "umm", title: "الأم", levelId: 4, type: "reference", status: "draft", productUse: "source_reference" },
];
