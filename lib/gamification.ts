import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  badges,
  challengeAnswers,
  challengeSessions,
  lessons,
  reviewQueue,
  skills,
  units,
  userBadges,
  userProgress,
  users,
} from "@/db/schema";
import { BADGE_CATALOG } from "@/data/badges";
import type { BadgeMetrics } from "@/lib/gamification-rules";
import { evaluateBadgeCriteria } from "@/lib/gamification-rules";

export { BADGE_CATALOG } from "@/data/badges";
export { evaluateBadgeCriteria } from "@/lib/gamification-rules";
export type { BadgeId } from "@/data/badges";
export type { BadgeMetrics } from "@/lib/gamification-rules";

export async function checkAndAwardBadges(userId: string) {
  await db.insert(badges).values([...BADGE_CATALOG]).onConflictDoNothing();

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return [];

  const [completedCountRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(userProgress)
    .where(and(eq(userProgress.userId, userId), eq(userProgress.completed, true)));

  const wuduLessonIds = ["lesson_wudu_pillars", "lesson_wudu_conds", "lesson_wudu_invals"];
  const [completedWuduRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(userProgress)
    .where(
      and(
        eq(userProgress.userId, userId),
        eq(userProgress.completed, true),
        inArray(userProgress.lessonId, wuduLessonIds)
      )
    );

  const publishedPurityLessons = await db
    .select({ id: lessons.id })
    .from(lessons)
    .innerJoin(skills, eq(lessons.skillId, skills.id))
    .innerJoin(units, eq(skills.unitId, units.id))
    .where(and(eq(units.id, "safina_taharah"), eq(lessons.status, "published")));

  const purityLessonIds =
    publishedPurityLessons.length > 0
      ? publishedPurityLessons.map((lesson) => lesson.id)
      : [
          "lesson_puberty",
          "lesson_istinja",
          "lesson_wudu_pillars",
          "lesson_wudu_conds",
          "lesson_wudu_invals",
          "lesson_ghusl",
        ];

  const [completedPurityRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(userProgress)
    .where(
      and(
        eq(userProgress.userId, userId),
        eq(userProgress.completed, true),
        inArray(userProgress.lessonId, purityLessonIds)
      )
    );

  const [wrongAnswerRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(challengeAnswers)
    .innerJoin(challengeSessions, eq(challengeAnswers.sessionId, challengeSessions.id))
    .where(and(eq(challengeSessions.userId, userId), eq(challengeAnswers.isCorrect, false)));

  const [queueMistakeRow] = await db
    .select({ total: sql<number>`coalesce(sum(${reviewQueue.mistakeCount}), 0)::int` })
    .from(reviewQueue)
    .where(eq(reviewQueue.userId, userId));

  const metrics: BadgeMetrics = {
    completedLessons: completedCountRow?.count ?? 0,
    completedWuduLessons: completedWuduRow?.count ?? 0,
    publishedPurityLessons: purityLessonIds.length,
    completedPurityLessons: completedPurityRow?.count ?? 0,
    streak: user.streak,
    mistakeSignals: (wrongAnswerRow?.count ?? 0) + (queueMistakeRow?.total ?? 0),
  };

  const qualifiedBadgeIds = evaluateBadgeCriteria(metrics);
  if (qualifiedBadgeIds.length === 0) return [];

  const existing = await db
    .select({ badgeId: userBadges.badgeId })
    .from(userBadges)
    .where(and(eq(userBadges.userId, userId), inArray(userBadges.badgeId, qualifiedBadgeIds)));

  const existingIds = new Set(existing.map((badge) => badge.badgeId));
  const newBadgeIds = qualifiedBadgeIds.filter((badgeId) => !existingIds.has(badgeId));
  if (newBadgeIds.length === 0) return [];

  await db
    .insert(userBadges)
    .values(newBadgeIds.map((badgeId) => ({ userId, badgeId })))
    .onConflictDoNothing();

  return db.select().from(badges).where(inArray(badges.id, newBadgeIds));
}
