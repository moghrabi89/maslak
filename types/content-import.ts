export type ImportEntityStatus = "draft";

export interface DraftLessonImport {
  id: string;
  skillId: string;
  title: string;
  content: string;
  order: number;
  status: ImportEntityStatus;
  sourceReferenceId: string;
}

export interface DraftConceptImport {
  id: string;
  lessonId: string;
  referenceId: string;
  conceptName: string;
  category: string;
  data: unknown;
  status: ImportEntityStatus;
}

export interface ContentImportBatch {
  bookId: string;
  unitId: string;
  lessons: DraftLessonImport[];
  concepts: DraftConceptImport[];
}
