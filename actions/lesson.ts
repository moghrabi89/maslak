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
import { eq, and, asc, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { generateQuestion } from "@/lib/generator";

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

  // Lock status check:
  // First, find all lessons in the same skill/unit, ordered by 'order'
  const siblingLessons = await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.skillId, lesson.skillId), eq(lessons.status, "published")))
    .orderBy(asc(lessons.order));

  let isLocked = false;
  // If there's a lesson in the skill with an order less than ours, check if it's completed
  const currentIdx = siblingLessons.findIndex((l) => l.id === lessonId);
  if (currentIdx > 0) {
    const prevLesson = siblingLessons[currentIdx - 1];
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, user.id), eq(userProgress.lessonId, prevLesson.id)));
    
    if (!progress || !progress.completed) {
      isLocked = true;
    }
  }

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
  const sessionId = `sess_${user.id}_${lessonId}_${Date.now()}`;
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
  const questions = [];
  const generatorConcept = {
    id: concept.id,
    conceptName: concept.conceptName,
    category: concept.category,
    notesForAdvancedStudents: concept.notesForAdvancedStudents,
    data: concept.data as any
  };

  for (let i = 0; i < 5; i++) {
    // Pick template: cycle through templates or pick random
    const templateIndex = i % templates.length;
    const template = templates[templateIndex];
    
    // Format template
    const formattedTemplate = {
      id: template.id,
      type: template.type as any,
      difficulty: template.difficulty as any,
      templateText: template.templateText,
      explanationTemplate: template.explanationTemplate
    };

    const q = generateQuestion(generatorConcept, formattedTemplate, allConcepts as any);
    questions.push(q);
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
    conceptId: string;
    questionPrompt: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
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

  const correctAnswers = answers.filter((a) => a.isCorrect).length;
  const scorePercentage = (correctAnswers / answers.length) * 100;
  const isPassed = scorePercentage >= 80;

  // Rewards calculation
  const xpReward = isPassed ? 15 : 5;
  const gemsReward = isPassed ? 5 : 0;

  // Insert answers to database
  const answerInserts = answers.map((ans, idx) => ({
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

  // Update user XP, gems, and lastActive
  await db
    .update(users)
    .set({
      xp: sql`${users.xp} + ${xpReward}`,
      gems: sql`${users.gems} + ${gemsReward}`,
      lastActive: new Date()
    })
    .where(eq(users.id, user.id));

  // Spaced Repetition Queue: Loop incorrect answers and schedule concepts
  const wrongAnswers = answers.filter((a) => !a.isCorrect && a.conceptId);
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

  revalidatePath("/dashboard");
  revalidatePath(`/lesson/${lessonId}`);
  return {
    success: true,
    scorePercentage,
    isPassed,
    xpGained: xpReward,
    gemsGained: gemsReward
  };
}
