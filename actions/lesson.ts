"use server";

import { db } from "@/db";
import { 
  lessons, 
  conceptBank, 
  fiqhReferences, 
  userProgress, 
  challengeSessions, 
  challengeAnswers, 
  users, 
  reviewQueue,
  questionTemplates
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { canAccessLesson } from "@/lib/progression";
import { revalidatePath } from "next/cache";
import {
  generateQuestion,
  type Concept,
  type ConceptData,
  type GeneratedQuestion,
  type QuestionTemplate,
} from "@/lib/generator";
import { checkAndAwardBadges } from "@/lib/gamification";
import crypto from "crypto";
import { signChallengeToken, verifyChallengeToken } from "@/lib/crypto";
import { calculateNewStreak } from "@/lib/streak";

// ==========================================
// 1. Get Lesson details & Progression lock check
// ==========================================

export async function getLessonDetailsForStudent(lessonId: string) {
  const user = await requireAuth();

  // Load lesson
  const [lesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId));
  if (!lesson || lesson.status === "archived") {
    throw new Error("الدرس غير موجود أو تم أرشفته");
  }

  // If lesson is not published, only admins or reviewers can see it
  if (lesson.status !== "published" && user.role === "student") {
    throw new Error("غير مصرح لك بمشاهدة هذا الدرس غير المعتمد");
  }

  // Lock status check via progression service
  const { isLocked } = await canAccessLesson(user.id, lessonId);

  // Get associated concept
  const [concept] = await db
    .select()
    .from(conceptBank)
    .where(and(eq(conceptBank.lessonId, lessonId), eq(conceptBank.status, "published")));

  // Get reference
  let reference = null;
  if (concept?.referenceId) {
    [reference] = await db.select().from(fiqhReferences).where(eq(fiqhReferences.id, concept.referenceId));
  }

  return {
    lesson,
    concept,
    reference,
    isLocked
  };
}

// ==========================================
// 2. Start challenge session & generate questions
// ==========================================

export async function startChallengeSession(lessonId: string) {
  const user = await requireAuth();

  // Insert session record
  const sessionId = `sess_${crypto.randomUUID()}`;
  await db.insert(challengeSessions).values({
    id: sessionId,
    userId: user.id,
    lessonId,
    status: "started",
    xpGained: 0
  });

  // Get active templates
  const templates = await db
    .select()
    .from(questionTemplates)
    .where(eq(questionTemplates.status, "published"));

  if (templates.length === 0) {
    throw new Error("لا توجد قوالب أسئلة معتمدة في المنصة حالياً");
  }

  // Get concept for this lesson
  const [concept] = await db
    .select()
    .from(conceptBank)
    .where(and(eq(conceptBank.lessonId, lessonId), eq(conceptBank.status, "published")));

  if (!concept) {
    throw new Error("لا يوجد مفهوم معتمد لهذا الدرس لتوليد الأسئلة منه");
  }

  // Get all concepts in database for distractor selection
  const allConcepts = await db
    .select()
    .from(conceptBank)
    .where(eq(conceptBank.status, "published"));

  // Build a 5-question test by looping templates
  const questions: GeneratedQuestion[] = [];
  const generatorConcept = {
    id: concept.id,
    conceptName: concept.conceptName,
    category: concept.category,
    notesForAdvancedStudents: concept.notesForAdvancedStudents,
    data: concept.data as ConceptData,
  } satisfies Concept;

  for (let i = 0; i < 5; i++) {
    // Pick template: cycle through templates or pick random
    const templateIndex = i % templates.length;
    const template = templates[templateIndex];
    
    // Format template
    const formattedTemplate = {
      id: template.id,
      type: template.type,
      difficulty: template.difficulty,
      templateText: template.templateText,
      explanationTemplate: template.explanationTemplate
    } satisfies QuestionTemplate;

    const conceptsForDistractors = allConcepts.map((item) => ({
      id: item.id,
      conceptName: item.conceptName,
      category: item.category,
      notesForAdvancedStudents: item.notesForAdvancedStudents,
      data: item.data as ConceptData,
    })) satisfies Concept[];

    const q = generateQuestion(generatorConcept, formattedTemplate, conceptsForDistractors);
    
    // Sign the challenge token
    const token = signChallengeToken({
      conceptId: concept.id,
      questionPrompt: q.questionPrompt,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      expiresAt: Date.now() + 30 * 60 * 1000 // 30 minutes
    });

    questions.push({
      ...q,
      token
    });
  }

  return {
    sessionId,
    questions
  };
}

// ==========================================
// 3. Submit results
// ==========================================

export async function submitChallengeResult(
  sessionId: string,
  lessonId: string,
  answers: Array<{
    conceptId: string | null;
    questionPrompt: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
    token?: string;
  }>
) {
  const user = await requireAuth();

  // Validate session
  const [session] = await db
    .select()
    .from(challengeSessions)
    .where(and(eq(challengeSessions.id, sessionId), eq(challengeSessions.userId, user.id)));

  if (!session) {
    throw new Error("جلسة التحدي غير موجودة أو غير تابعة لك");
  }

  // Cryptographically verify each answer on the server side
  const verifiedAnswers = [];
  for (const ans of answers) {
    if (!ans.token) {
      throw new Error("عذراً، التوكن الخاص بالسؤال مفقود أو غير صالح للتقييم الأمني");
    }
    const tokenData = verifyChallengeToken(ans.token);
    if (!tokenData) {
      throw new Error("عذراً، انتهت صلاحية جلسة السؤال أو تم التلاعب بها");
    }
    if (tokenData.questionPrompt !== ans.questionPrompt) {
      throw new Error("عذراً، هناك عدم تطابق بين السؤال والتوكن المشفر");
    }

    const isCorrect = ans.userAnswer === tokenData.correctAnswer;
    verifiedAnswers.push({
      conceptId: tokenData.conceptId,
      questionPrompt: tokenData.questionPrompt,
      userAnswer: ans.userAnswer,
      correctAnswer: tokenData.correctAnswer,
      isCorrect,
      explanation: tokenData.explanation
    });
  }

  const correctAnswers = verifiedAnswers.filter((a) => a.isCorrect).length;
  const scorePercentage = verifiedAnswers.length > 0 ? (correctAnswers / verifiedAnswers.length) * 100 : 0;
  const isPassed = scorePercentage >= 80;

  // Rewards calculation
  const xpReward = isPassed ? 15 : 5;
  const gemsReward = isPassed ? 5 : 0;

  // Insert answers to database
  const answerInserts = verifiedAnswers.map((ans, idx) => ({
    id: `ans_${sessionId}_${idx}_${Date.now()}`,
    sessionId,
    conceptId: ans.conceptId || null,
    questionPrompt: ans.questionPrompt,
    userAnswer: ans.userAnswer,
    correctAnswer: ans.correctAnswer,
    isCorrect: ans.isCorrect,
    explanation: ans.explanation
  }));
  
  if (answerInserts.length > 0) {
    await db.insert(challengeAnswers).values(answerInserts);
  }

  // If passed, record progress completion
  if (isPassed) {
    await db
      .insert(userProgress)
      .values({
        userId: user.id,
        lessonId,
        completed: true,
        completedAt: new Date()
      })
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.lessonId],
        set: {
          completed: true,
          completedAt: new Date()
        }
      });
  }

  // Update session status
  await db
    .update(challengeSessions)
    .set({
      status: isPassed ? "completed" : "failed",
      xpGained: xpReward,
      completedAt: new Date()
    })
    .where(eq(challengeSessions.id, sessionId));

  // Fetch user to compute streak
  const [dbUser] = await db
    .select({ streak: users.streak, lastActive: users.lastActive })
    .from(users)
    .where(eq(users.id, user.id));

  const now = new Date();
  const newStreak = dbUser 
    ? calculateNewStreak(dbUser.lastActive, dbUser.streak, now) 
    : 1;

  // Update user XP, gems, streak, and lastActive
  await db
    .update(users)
    .set({
      xp: sql`${users.xp} + ${xpReward}`,
      gems: sql`${users.gems} + ${gemsReward}`,
      streak: newStreak,
      lastActive: now,
      updatedAt: now
    })
    .where(eq(users.id, user.id));

  // Spaced Repetition Queue: Loop incorrect answers and schedule concepts
  const wrongAnswers = verifiedAnswers.filter(
    (a): a is (typeof verifiedAnswers)[number] & { conceptId: string } => !a.isCorrect && a.conceptId !== null
  );
  for (const wrong of wrongAnswers) {
    const nextReview = new Date(Date.now() + 24 * 60 * 60 * 1000); // after 24 hours
    
    await db
      .insert(reviewQueue)
      .values({
        id: `rq_${user.id}_${wrong.conceptId}`,
        userId: user.id,
        conceptId: wrong.conceptId,
        strength: 1, // weak
        nextReviewAt: nextReview,
        mistakeCount: 1
      })
      .onConflictDoUpdate({
        target: [reviewQueue.userId, reviewQueue.conceptId],
        set: {
          strength: 1,
          nextReviewAt: nextReview,
          mistakeCount: sql`${reviewQueue.mistakeCount} + 1`,
          updatedAt: new Date()
        }
      });
  }

  const awardedBadges = await checkAndAwardBadges(user.id);

  revalidatePath("/dashboard");
  revalidatePath(`/lesson/${lessonId}`);
  revalidatePath("/profile");
  revalidatePath("/shop");
  return {
    success: true,
    scorePercentage,
    isPassed,
    xpGained: xpReward,
    gemsGained: gemsReward,
    awardedBadges
  };
}
