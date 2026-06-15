"use server";

import { db } from "@/db";
import { 
  levels, 
  books, 
  units, 
  skills, 
  lessons, 
  fiqhReferences, 
  conceptBank, 
  questionTemplates 
} from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { requireAdmin, requireReviewerOrAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ==========================================
// 1. Read Operations
// ==========================================

export async function getLevelsWithBooks() {
  const allLevels = await db.select().from(levels).orderBy(asc(levels.id));
  const allBooks = await db.select().from(books).orderBy(asc(books.levelId), asc(books.order));
  
  return allLevels.map(lvl => ({
    ...lvl,
    books: allBooks.filter(b => b.levelId === lvl.id && b.status !== "archived")
  }));
}

export async function getBookDetails(bookId: string) {
  const [book] = await db.select().from(books).where(eq(books.id, bookId));
  if (!book) return null;

  const bookUnits = await db.select().from(units).where(and(eq(units.bookId, bookId))).orderBy(asc(units.order));
  
  return {
    ...book,
    units: bookUnits.filter(u => u.status !== "archived")
  };
}

export async function getUnitDetails(unitId: string) {
  const [unit] = await db.select().from(units).where(eq(units.id, unitId));
  if (!unit) return null;

  const unitSkills = await db.select().from(skills).where(eq(skills.unitId, unitId)).orderBy(asc(skills.order));

  return {
    ...unit,
    skills: unitSkills.filter(s => s.status !== "archived")
  };
}

export async function getSkillDetails(skillId: string) {
  const [skill] = await db.select().from(skills).where(eq(skills.id, skillId));
  if (!skill) return null;

  const skillLessons = await db.select().from(lessons).where(eq(lessons.skillId, skillId)).orderBy(asc(lessons.order));

  return {
    ...skill,
    lessons: skillLessons.filter(l => l.status !== "archived")
  };
}

export async function getLessonFullData(lessonId: string) {
  const [lesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId));
  if (!lesson) return null;

  const [concept] = await db.select().from(conceptBank).where(eq(conceptBank.lessonId, lessonId));
  
  let reference = null;
  if (concept?.referenceId) {
    [reference] = await db.select().from(fiqhReferences).where(eq(fiqhReferences.id, concept.referenceId));
  }

  return {
    lesson,
    concept: concept && concept.status !== "archived" ? concept : null,
    reference
  };
}

// ==========================================
// 2. CRUD Book
// ==========================================

export async function createBook(data: {
  id: string;
  levelId: number;
  title: string;
  author: string;
  description: string;
  order: number;
}) {
  const admin = await requireAdmin();

  const [newBook] = await db.insert(books).values({
    ...data,
    status: "draft",
    createdBy: admin.id,
    updatedBy: admin.id
  }).returning();

  revalidatePath("/admin/content");
  return newBook;
}

export async function updateBook(id: string, data: {
  title: string;
  author: string;
  description: string;
  order: number;
}) {
  const admin = await requireAdmin();

  const [updatedBook] = await db.update(books).set({
    ...data,
    updatedBy: admin.id,
    updatedAt: new Date()
  }).where(eq(books.id, id)).returning();

  revalidatePath("/admin/content");
  return updatedBook;
}

export async function archiveBook(id: string) {
  const admin = await requireAdmin();

  // Rule: Soft archive to protect student progress metrics
  const [archivedBook] = await db.update(books).set({
    status: "archived",
    updatedBy: admin.id,
    updatedAt: new Date()
  }).where(eq(books.id, id)).returning();

  revalidatePath("/admin/content");
  return archivedBook;
}

// ==========================================
// 3. CRUD Unit
// ==========================================

export async function createUnit(data: {
  id: string;
  bookId: string;
  title: string;
  description: string;
  order: number;
}) {
  const admin = await requireAdmin();

  const [newUnit] = await db.insert(units).values({
    ...data,
    status: "draft",
    createdBy: admin.id,
    updatedBy: admin.id
  }).returning();

  revalidatePath("/admin/content");
  return newUnit;
}

export async function updateUnit(id: string, data: {
  title: string;
  description: string;
  order: number;
}) {
  const admin = await requireAdmin();

  const [updatedUnit] = await db.update(units).set({
    ...data,
    updatedBy: admin.id,
    updatedAt: new Date()
  }).where(eq(units.id, id)).returning();

  revalidatePath("/admin/content");
  return updatedUnit;
}

export async function archiveUnit(id: string) {
  const admin = await requireAdmin();

  const [archivedUnit] = await db.update(units).set({
    status: "archived",
    updatedBy: admin.id,
    updatedAt: new Date()
  }).where(eq(units.id, id)).returning();

  revalidatePath("/admin/content");
  return archivedUnit;
}

// ==========================================
// 4. CRUD Skill
// ==========================================

export async function createSkill(data: {
  id: string;
  unitId: string;
  title: string;
  order: number;
}) {
  const admin = await requireAdmin();

  const [newSkill] = await db.insert(skills).values({
    ...data,
    status: "draft",
    createdBy: admin.id,
    updatedBy: admin.id
  }).returning();

  revalidatePath("/admin/content");
  return newSkill;
}

export async function archiveSkill(id: string) {
  const admin = await requireAdmin();

  const [archivedSkill] = await db.update(skills).set({
    status: "archived",
    updatedBy: admin.id,
    updatedAt: new Date()
  }).where(eq(skills.id, id)).returning();

  revalidatePath("/admin/content");
  return archivedSkill;
}

// ==========================================
// 5. CRUD Lesson, Reference, and Concept Jointly
// ==========================================

export async function saveFullLessonData(
  lessonId: string,
  skillId: string,
  lessonTitle: string,
  lessonContent: string,
  lessonOrder: number,
  refData: {
    sourceBook: string;
    sourceSection: string;
    sourceText: string;
    explanation: string;
    pageNumber: string;
    edition: string;
  } | null,
  conceptData: {
    conceptName: string;
    category: string;
    rulingLevel: "beginner" | "standard" | "advanced";
    madhhabPosition: "mutamad" | "alternative_view" | "disputed";
    notesForAdvancedStudents: string;
    data: any;
  } | null
) {
  const admin = await requireAdmin();

  // 1. Create or Update Lesson
  const [existingLesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId));
  
  if (existingLesson) {
    await db.update(lessons).set({
      title: lessonTitle,
      content: lessonContent,
      order: lessonOrder,
      updatedBy: admin.id,
      updatedAt: new Date(),
      status: "draft" // Reset to draft when modified so reviewer re-approves
    }).where(eq(lessons.id, lessonId));
  } else {
    await db.insert(lessons).values({
      id: lessonId,
      skillId,
      title: lessonTitle,
      content: lessonContent,
      order: lessonOrder,
      xpReward: 15,
      status: "draft",
      createdBy: admin.id,
      updatedBy: admin.id
    });
  }

  // 2. Fiqh Reference Handling
  let referenceId = `${lessonId}_ref`;
  if (refData) {
    const [existingRef] = await db.select().from(fiqhReferences).where(eq(fiqhReferences.id, referenceId));
    if (existingRef) {
      await db.update(fiqhReferences).set({
        ...refData,
        verifiedBy: admin.id,
        updatedAt: new Date()
      }).where(eq(fiqhReferences.id, referenceId));
    } else {
      await db.insert(fiqhReferences).values({
        id: referenceId,
        ...refData,
        verifiedBy: admin.id
      });
    }
  } else {
    referenceId = ""; // No reference
  }

  // 3. Concept Bank Handling
  let conceptId = `${lessonId}_concept`;
  if (conceptData) {
    const [existingConcept] = await db.select().from(conceptBank).where(eq(conceptBank.id, conceptId));
    if (existingConcept) {
      await db.update(conceptBank).set({
        conceptName: conceptData.conceptName,
        category: conceptData.category,
        rulingLevel: conceptData.rulingLevel,
        madhhabPosition: conceptData.madhhabPosition,
        notesForAdvancedStudents: conceptData.notesForAdvancedStudents,
        data: conceptData.data,
        referenceId: referenceId || null,
        scientificConfidence: 0, // Reset to 0 until re-reviewed
        status: "draft", // Reset to draft
        updatedBy: admin.id,
        updatedAt: new Date()
      }).where(eq(conceptBank.id, conceptId));
    } else {
      await db.insert(conceptBank).values({
        id: conceptId,
        lessonId,
        referenceId: referenceId || null,
        conceptName: conceptData.conceptName,
        category: conceptData.category,
        data: conceptData.data,
        rulingLevel: conceptData.rulingLevel,
        madhhabPosition: conceptData.madhhabPosition,
        notesForAdvancedStudents: conceptData.notesForAdvancedStudents,
        scientificConfidence: 0,
        status: "draft",
        createdBy: admin.id,
        updatedBy: admin.id
      });
    }
  }

  revalidatePath("/admin/content");
  return { success: true };
}

export async function archiveLesson(id: string) {
  const admin = await requireAdmin();

  const [archivedLesson] = await db.update(lessons).set({
    status: "archived",
    updatedBy: admin.id,
    updatedAt: new Date()
  }).where(eq(lessons.id, id)).returning();

  // Also archive corresponding concept if exists
  await db.update(conceptBank).set({
    status: "archived",
    updatedBy: admin.id,
    updatedAt: new Date()
  }).where(eq(conceptBank.lessonId, id));

  revalidatePath("/admin/content");
  return archivedLesson;
}

// ==========================================
// 6. Submit Content for Review
// ==========================================

export async function submitForReview(entityType: "lesson" | "concept", entityId: string) {
  const user = await requireAdmin();

  if (entityType === "lesson") {
    await db.update(lessons).set({
      status: "reviewed",
      updatedBy: user.id,
      updatedAt: new Date()
    }).where(eq(lessons.id, entityId));
  } else if (entityType === "concept") {
    await db.update(conceptBank).set({
      status: "reviewed",
      updatedBy: user.id,
      updatedAt: new Date()
    }).where(eq(conceptBank.id, entityId));
  }

  revalidatePath("/admin/content");
  revalidatePath("/admin/review");
  return { success: true };
}
