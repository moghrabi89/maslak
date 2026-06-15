import { db } from "@/db";
import { lessons, skills, units, userProgress } from "@/db/schema";
import { eq, and, asc, inArray } from "drizzle-orm";

export interface ProgressionResult {
  isLocked: boolean;
  reason?: string;
}

export async function canAccessLesson(userId: string, lessonId: string): Promise<ProgressionResult> {
  const [lesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId));
  if (!lesson) return { isLocked: true, reason: "الدرس غير موجود" };

  const siblingLessons = await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.skillId, lesson.skillId), eq(lessons.status, "published")))
    .orderBy(asc(lessons.order));

  const currentIdx = siblingLessons.findIndex((l) => l.id === lessonId);
  if (currentIdx > 0) {
    const prevLesson = siblingLessons[currentIdx - 1];
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.lessonId, prevLesson.id)));

    if (!progress || !progress.completed) {
      return { isLocked: true, reason: "أكمل الدرس السابق أولاً" };
    }
  }

  return { isLocked: false };
}

export async function canAccessSkill(userId: string, skillId: string): Promise<ProgressionResult> {
  const [skill] = await db.select().from(skills).where(eq(skills.id, skillId));
  if (!skill) return { isLocked: true, reason: "المهارة غير موجودة" };

  const siblingSkills = await db
    .select()
    .from(skills)
    .where(and(eq(skills.unitId, skill.unitId), eq(skills.status, "published")))
    .orderBy(asc(skills.order));

  const currentIdx = siblingSkills.findIndex((s) => s.id === skillId);
  if (currentIdx > 0) {
    const prevSkill = siblingSkills[currentIdx - 1];
    const prevSkillLessons = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(and(eq(lessons.skillId, prevSkill.id), eq(lessons.status, "published")));

    if (prevSkillLessons.length > 0) {
      const prevIds = prevSkillLessons.map((l) => l.id);
      const completed = await db
        .select()
        .from(userProgress)
        .where(and(eq(userProgress.userId, userId), eq(userProgress.completed, true), inArray(userProgress.lessonId, prevIds)));

      if (completed.length < prevIds.length) {
        return { isLocked: true, reason: "أكمل جميع دروس المهارة السابقة أولاً" };
      }
    }
  }

  return { isLocked: false };
}

export async function canAccessUnit(userId: string, unitId: string): Promise<ProgressionResult> {
  const [unit] = await db.select().from(units).where(eq(units.id, unitId));
  if (!unit) return { isLocked: true, reason: "الوحدة غير موجودة" };

  const siblingUnits = await db
    .select()
    .from(units)
    .where(and(eq(units.bookId, unit.bookId), eq(units.status, "published")))
    .orderBy(asc(units.order));

  const currentIdx = siblingUnits.findIndex((u) => u.id === unitId);
  if (currentIdx > 0) {
    const prevUnit = siblingUnits[currentIdx - 1];
    const prevSkills = await db
      .select()
      .from(skills)
      .where(and(eq(skills.unitId, prevUnit.id), eq(skills.status, "published")));

    const prevSkillIds = prevSkills.map((s) => s.id);
    const prevLessonIds: string[] = [];

    if (prevSkillIds.length > 0) {
      const skillLessons = await db
        .select({ id: lessons.id })
        .from(lessons)
        .where(and(inArray(lessons.skillId, prevSkillIds), eq(lessons.status, "published")));
      prevLessonIds.push(...skillLessons.map((l) => l.id));
    }

    if (prevLessonIds.length > 0) {
      const completed = await db
        .select()
        .from(userProgress)
        .where(and(eq(userProgress.userId, userId), eq(userProgress.completed, true), inArray(userProgress.lessonId, prevLessonIds)));

      if (completed.length < prevLessonIds.length) {
        return { isLocked: true, reason: "أكمل جميع دروس الوحدة السابقة أولاً" };
      }
    }
  }

  return { isLocked: false };
}
