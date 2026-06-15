"use server";

import { createHmac, timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, asc, eq, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { conceptBank, lessons, questionTemplates, reviewQueue, users } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import env from "@/lib/env";
import { calculateReviewOutcome } from "@/lib/spaced-review";
import { generateQuestion, type Concept, type ConceptData, type QuestionTemplate } from "@/lib/generator";
import { checkAndAwardBadges } from "@/lib/gamification";
import { calculateNewStreak } from "@/lib/streak";
import type { ActiveReviewQuestion, ReviewAnswerResult, ReviewCenterData } from "@/types/spaced-review";

const TOKEN_TTL_MS = 10 * 60 * 1000;

const startQuestionSchema = z.object({
  conceptId: z.string().min(1).max(160),
});

const submitAnswerSchema = z.object({
  token: z.string().min(32),
  selectedAnswer: z.string().min(1).max(2000),
});

interface ReviewTokenPayload {
  userId: string;
  conceptId: string;
  questionPrompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  type: string;
  issuedAt: string;
  expiresAt: string;
  queueLastReviewedAt: string | null;
}

function toIsoString(date: Date | null) {
  return date ? date.toISOString() : null;
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function sign(payloadPart: string) {
  return createHmac("sha256", env.CLERK_SECRET_KEY).update(payloadPart).digest("base64url");
}

function createReviewToken(payload: ReviewTokenPayload) {
  const payloadPart = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${payloadPart}.${sign(payloadPart)}`;
}

function verifyReviewToken(token: string): ReviewTokenPayload {
  const [payloadPart, signature] = token.split(".");
  if (!payloadPart || !signature) {
    throw new Error("رمز المراجعة غير صالح");
  }

  const expected = sign(payloadPart);
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (receivedBuffer.length !== expectedBuffer.length || !timingSafeEqual(receivedBuffer, expectedBuffer)) {
    throw new Error("رمز المراجعة غير موثوق");
  }

  const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8")) as ReviewTokenPayload;
  if (new Date(payload.expiresAt).getTime() < Date.now()) {
    throw new Error("انتهت صلاحية سؤال المراجعة، ابدأ محاولة جديدة");
  }

  return payload;
}

export async function getReviewCenterData(): Promise<ReviewCenterData> {
  const user = await requireAuth();
  const now = new Date();
  const today = startOfToday();

  const rows = await db
    .select({
      conceptId: reviewQueue.conceptId,
      conceptName: conceptBank.conceptName,
      category: conceptBank.category,
      lessonId: lessons.id,
      lessonTitle: lessons.title,
      strength: reviewQueue.strength,
      mistakeCount: reviewQueue.mistakeCount,
      nextReviewAt: reviewQueue.nextReviewAt,
      lastReviewedAt: reviewQueue.lastReviewedAt,
    })
    .from(reviewQueue)
    .innerJoin(conceptBank, eq(reviewQueue.conceptId, conceptBank.id))
    .innerJoin(lessons, eq(conceptBank.lessonId, lessons.id))
    .where(
      and(
        eq(reviewQueue.userId, user.id),
        eq(conceptBank.status, "published"),
        eq(lessons.status, "published")
      )
    )
    .orderBy(asc(reviewQueue.nextReviewAt));

  const items = rows.map((row) => ({
    ...row,
    nextReviewAt: row.nextReviewAt.toISOString(),
    lastReviewedAt: toIsoString(row.lastReviewedAt),
    isDue: row.nextReviewAt.getTime() <= now.getTime(),
  }));

  return {
    stats: {
      total: items.length,
      dueCount: items.filter((item) => item.isDue).length,
      reviewedToday: rows.filter((row) => row.lastReviewedAt && row.lastReviewedAt >= today).length,
      strongCount: items.filter((item) => item.strength >= 4).length,
      attentionCount: items.filter((item) => item.strength <= 1 || item.mistakeCount >= 2).length,
      xp: user.xp,
      gems: user.gems,
    },
    dueItems: items.filter((item) => item.isDue),
    upcomingItems: items.filter((item) => !item.isDue).slice(0, 6),
  };
}

export async function startReviewQuestion(input: unknown): Promise<ActiveReviewQuestion> {
  const user = await requireAuth();
  const { conceptId } = startQuestionSchema.parse(input);
  const now = new Date();

  const [row] = await db
    .select({
      conceptId: reviewQueue.conceptId,
      nextReviewAt: reviewQueue.nextReviewAt,
      lastReviewedAt: reviewQueue.lastReviewedAt,
      conceptName: conceptBank.conceptName,
      category: conceptBank.category,
      data: conceptBank.data,
      notesForAdvancedStudents: conceptBank.notesForAdvancedStudents,
    })
    .from(reviewQueue)
    .innerJoin(conceptBank, eq(reviewQueue.conceptId, conceptBank.id))
    .innerJoin(lessons, eq(conceptBank.lessonId, lessons.id))
    .where(
      and(
        eq(reviewQueue.userId, user.id),
        eq(reviewQueue.conceptId, conceptId),
        lte(reviewQueue.nextReviewAt, now),
        eq(conceptBank.status, "published"),
        eq(lessons.status, "published")
      )
    );

  if (!row) {
    throw new Error("هذا المفهوم غير مستحق للمراجعة الآن");
  }

  const [templates, concepts] = await Promise.all([
    db.select().from(questionTemplates).where(eq(questionTemplates.status, "published")),
    db.select().from(conceptBank).where(eq(conceptBank.status, "published")),
  ]);

  if (templates.length === 0) {
    throw new Error("لا توجد قوالب أسئلة منشورة للمراجعة");
  }

  const concept: Concept = {
    id: row.conceptId,
    conceptName: row.conceptName,
    category: row.category,
    notesForAdvancedStudents: row.notesForAdvancedStudents,
    data: row.data as ConceptData,
  };

  const allConcepts: Concept[] = concepts.map((item) => ({
    id: item.id,
    conceptName: item.conceptName,
    category: item.category,
    notesForAdvancedStudents: item.notesForAdvancedStudents,
    data: item.data as ConceptData,
  }));

  const template = templates[Math.floor(Math.random() * templates.length)];
  const questionTemplate: QuestionTemplate = {
    id: template.id,
    type: template.type,
    difficulty: template.difficulty,
    templateText: template.templateText,
    explanationTemplate: template.explanationTemplate,
  };
  const question = generateQuestion(concept, questionTemplate, allConcepts);
  const issuedAt = now.toISOString();

  return {
    conceptId: row.conceptId,
    conceptName: row.conceptName,
    category: row.category,
    questionPrompt: question.questionPrompt,
    options: question.options,
    difficulty: question.difficulty,
    type: question.type,
    token: createReviewToken({
      userId: user.id,
      conceptId: row.conceptId,
      questionPrompt: question.questionPrompt,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      difficulty: question.difficulty,
      type: question.type,
      issuedAt,
      expiresAt: new Date(now.getTime() + TOKEN_TTL_MS).toISOString(),
      queueLastReviewedAt: toIsoString(row.lastReviewedAt),
    }),
  };
}

export async function submitReviewAnswer(input: unknown): Promise<ReviewAnswerResult> {
  const user = await requireAuth();
  const { token, selectedAnswer } = submitAnswerSchema.parse(input);
  const payload = verifyReviewToken(token);

  if (payload.userId !== user.id) {
    throw new Error("لا يمكنك تسجيل مراجعة تخص مستخدما آخر");
  }

  if (!payload.options.includes(selectedAnswer)) {
    throw new Error("الإجابة المختارة لا تنتمي إلى هذا السؤال");
  }

  const [row] = await db
    .select({
      strength: reviewQueue.strength,
      lastReviewedAt: reviewQueue.lastReviewedAt,
    })
    .from(reviewQueue)
    .innerJoin(conceptBank, eq(reviewQueue.conceptId, conceptBank.id))
    .innerJoin(lessons, eq(conceptBank.lessonId, lessons.id))
    .where(
      and(
        eq(reviewQueue.userId, user.id),
        eq(reviewQueue.conceptId, payload.conceptId),
        eq(conceptBank.status, "published"),
        eq(lessons.status, "published")
      )
    );

  if (!row) {
    throw new Error("لم يعد هذا المفهوم موجودا في طابور مراجعتك");
  }

  if (toIsoString(row.lastReviewedAt) !== payload.queueLastReviewedAt) {
    throw new Error("تم تسجيل هذه المحاولة أو تغيرت حالة المراجعة، ابدأ سؤالا جديدا");
  }

  const isCorrect = selectedAnswer === payload.correctAnswer;
  const outcome = calculateReviewOutcome({
    currentStrength: row.strength,
    isCorrect,
    now: new Date(),
  });

  await db
    .update(reviewQueue)
    .set({
      strength: outcome.nextStrength,
      nextReviewAt: outcome.nextReviewAt,
      lastReviewedAt: new Date(),
      mistakeCount: isCorrect ? sql`${reviewQueue.mistakeCount}` : sql`${reviewQueue.mistakeCount} + 1`,
      updatedAt: new Date(),
    })
    .where(and(eq(reviewQueue.userId, user.id), eq(reviewQueue.conceptId, payload.conceptId)));

  // Fetch user to compute streak
  const [dbUser] = await db
    .select({ streak: users.streak, lastActive: users.lastActive })
    .from(users)
    .where(eq(users.id, user.id));

  const now = new Date();
  const newStreak = dbUser
    ? calculateNewStreak(dbUser.lastActive, dbUser.streak, now)
    : 1;

  await db
    .update(users)
    .set({
      xp: sql`${users.xp} + ${outcome.xpReward}`,
      gems: sql`${users.gems} + ${outcome.gemsReward}`,
      streak: newStreak,
      lastActive: now,
      updatedAt: now,
    })
    .where(eq(users.id, user.id));

  const awardedBadges = await checkAndAwardBadges(user.id);

  revalidatePath("/review");
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/shop");

  return {
    isCorrect,
    correctAnswer: payload.correctAnswer,
    explanation: payload.explanation,
    nextStrength: outcome.nextStrength,
    nextReviewAt: outcome.nextReviewAt.toISOString(),
    xpGained: outcome.xpReward,
    gemsGained: outcome.gemsReward,
    improved: outcome.improved,
    needsAttention: outcome.needsAttention,
    awardedBadges,
  };
}
