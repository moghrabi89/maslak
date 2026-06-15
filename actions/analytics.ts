"use server";

import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  challengeAnswers,
  challengeSessions,
  conceptBank,
  lessons,
  reviewQueue,
  users,
  userProgress,
} from "@/db/schema";
import { requireReviewerOrAdmin } from "@/lib/auth";

export interface AnalyticsSnapshot {
  totals: {
    students: number;
    publishedLessons: number;
    challengeSessions: number;
    completedLessons: number;
    completionRate: number;
    failureRate: number;
  };
  topWrongConcepts: Array<{
    conceptId: string | null;
    conceptName: string | null;
    wrongCount: number;
  }>;
  confusingQuestions: Array<{
    questionPrompt: string;
    wrongCount: number;
  }>;
  lessonAttempts: Array<{
    lessonId: string;
    lessonTitle: string;
    attempts: number;
    completed: number;
    failed: number;
  }>;
  activeStudents: Array<{
    label: string;
    xp: number;
    sessions: number;
    lastActive: string | null;
  }>;
  improvementAlerts: Array<{
    conceptId: string;
    conceptName: string;
    queuedStudents: number;
    totalMistakes: number;
  }>;
}

function percentage(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

export async function getAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  await requireReviewerOrAdmin();

  const [
    studentCountRow,
    publishedLessonsRow,
    challengeSessionsRow,
    completedProgressRow,
    failedSessionsRow,
    completedSessionsRow,
    topWrongConcepts,
    confusingQuestions,
    lessonAttempts,
    activeStudents,
    improvementAlerts,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(users).where(eq(users.role, "student")),
    db.select({ count: sql<number>`count(*)::int` }).from(lessons).where(eq(lessons.status, "published")),
    db.select({ count: sql<number>`count(*)::int` }).from(challengeSessions),
    db.select({ count: sql<number>`count(*)::int` }).from(userProgress).where(eq(userProgress.completed, true)),
    db.select({ count: sql<number>`count(*)::int` }).from(challengeSessions).where(eq(challengeSessions.status, "failed")),
    db.select({ count: sql<number>`count(*)::int` }).from(challengeSessions).where(eq(challengeSessions.status, "completed")),
    db
      .select({
        conceptId: challengeAnswers.conceptId,
        conceptName: conceptBank.conceptName,
        wrongCount: sql<number>`count(*)::int`,
      })
      .from(challengeAnswers)
      .leftJoin(conceptBank, eq(challengeAnswers.conceptId, conceptBank.id))
      .where(eq(challengeAnswers.isCorrect, false))
      .groupBy(challengeAnswers.conceptId, conceptBank.conceptName)
      .orderBy(desc(sql`count(*)`))
      .limit(8),
    db
      .select({
        questionPrompt: challengeAnswers.questionPrompt,
        wrongCount: sql<number>`count(*)::int`,
      })
      .from(challengeAnswers)
      .where(eq(challengeAnswers.isCorrect, false))
      .groupBy(challengeAnswers.questionPrompt)
      .orderBy(desc(sql`count(*)`))
      .limit(6),
    db
      .select({
        lessonId: lessons.id,
        lessonTitle: lessons.title,
        attempts: sql<number>`count(${challengeSessions.id})::int`,
        completed: sql<number>`count(*) filter (where ${challengeSessions.status} = 'completed')::int`,
        failed: sql<number>`count(*) filter (where ${challengeSessions.status} = 'failed')::int`,
      })
      .from(lessons)
      .leftJoin(challengeSessions, eq(lessons.id, challengeSessions.lessonId))
      .where(eq(lessons.status, "published"))
      .groupBy(lessons.id, lessons.title)
      .orderBy(desc(sql`count(${challengeSessions.id})`))
      .limit(10),
    db
      .select({
        id: users.id,
        xp: users.xp,
        lastActive: users.lastActive,
        sessions: sql<number>`count(${challengeSessions.id})::int`,
      })
      .from(users)
      .leftJoin(challengeSessions, eq(users.id, challengeSessions.userId))
      .where(eq(users.role, "student"))
      .groupBy(users.id, users.xp, users.lastActive)
      .orderBy(desc(sql`count(${challengeSessions.id})`), desc(users.xp))
      .limit(8),
    db
      .select({
        conceptId: conceptBank.id,
        conceptName: conceptBank.conceptName,
        queuedStudents: sql<number>`count(distinct ${reviewQueue.userId})::int`,
        totalMistakes: sql<number>`coalesce(sum(${reviewQueue.mistakeCount}), 0)::int`,
      })
      .from(reviewQueue)
      .innerJoin(conceptBank, eq(reviewQueue.conceptId, conceptBank.id))
      .groupBy(conceptBank.id, conceptBank.conceptName)
      .orderBy(desc(sql`coalesce(sum(${reviewQueue.mistakeCount}), 0)`))
      .limit(8),
  ]);

  const studentCount = studentCountRow[0]?.count ?? 0;
  const publishedLessons = publishedLessonsRow[0]?.count ?? 0;
  const challengeSessionsCount = challengeSessionsRow[0]?.count ?? 0;
  const completedProgress = completedProgressRow[0]?.count ?? 0;
  const failedSessions = failedSessionsRow[0]?.count ?? 0;
  const completedSessions = completedSessionsRow[0]?.count ?? 0;

  return {
    totals: {
      students: studentCount,
      publishedLessons,
      challengeSessions: challengeSessionsCount,
      completedLessons: completedProgress,
      completionRate: percentage(completedProgress, Math.max(1, studentCount * publishedLessons)),
      failureRate: percentage(failedSessions, failedSessions + completedSessions),
    },
    topWrongConcepts,
    confusingQuestions,
    lessonAttempts,
    activeStudents: activeStudents.map((student, index) => ({
      label: `طالب ${index + 1}`,
      xp: student.xp,
      sessions: student.sessions,
      lastActive: student.lastActive?.toISOString() ?? null,
    })),
    improvementAlerts: improvementAlerts.filter((alert) => alert.totalMistakes >= 2 || alert.queuedStudents >= 2),
  };
}
