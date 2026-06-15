"use server";

import { db } from "@/db";
import { 
  lessons, 
  conceptBank, 
  questionTemplates, 
  contentReviews,
  users 
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireReviewerOrAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ==========================================
// 1. Fetch Operations
// ==========================================

export async function getPendingReviews() {
  await requireReviewerOrAdmin();

  // Find all lessons, concepts, and question templates with status 'reviewed'
  const reviewedLessons = await db.select().from(lessons).where(eq(lessons.status, "reviewed"));
  const reviewedConcepts = await db.select().from(conceptBank).where(eq(conceptBank.status, "reviewed"));
  const reviewedTemplates = await db.select().from(questionTemplates).where(eq(questionTemplates.status, "reviewed"));

  return {
    lessons: reviewedLessons,
    concepts: reviewedConcepts,
    templates: reviewedTemplates
  };
}

export async function getReviewLogs() {
  await requireReviewerOrAdmin();

  const logs = await db
    .select({
      id: contentReviews.id,
      entityType: contentReviews.entityType,
      entityId: contentReviews.entityId,
      status: contentReviews.status,
      notes: contentReviews.notes,
      reviewedAt: contentReviews.reviewedAt,
      reviewerName: users.name
    })
    .from(contentReviews)
    .innerJoin(users, eq(contentReviews.reviewerId, users.id))
    .orderBy(desc(contentReviews.reviewedAt))
    .limit(30);

  return logs;
}

// ==========================================
// 2. Review Decision Actions
// ==========================================

export async function approveEntity(
  entityType: "lesson" | "concept" | "question_template",
  entityId: string,
  notes: string = ""
) {
  const reviewer = await requireReviewerOrAdmin();
  const reviewId = `rev_${entityType}_${entityId}_${Date.now()}`;

  // Apply approval logic per type
  if (entityType === "lesson") {
    await db.update(lessons).set({
      status: "published",
      updatedBy: reviewer.id,
      updatedAt: new Date()
    }).where(eq(lessons.id, entityId));
  } else if (entityType === "concept") {
    await db.update(conceptBank).set({
      status: "published",
      scientificConfidence: 100, // Core rule: rises to 100 upon official verification
      approvedBy: reviewer.id,
      reviewDate: new Date(),
      reviewerNotes: notes,
      updatedBy: reviewer.id,
      updatedAt: new Date()
    }).where(eq(conceptBank.id, entityId));
  } else if (entityType === "question_template") {
    await db.update(questionTemplates).set({
      status: "published",
      approvedBy: reviewer.id,
      updatedAt: new Date()
    }).where(eq(questionTemplates.id, entityId));
  }

  // Insert review audit log
  await db.insert(contentReviews).values({
    id: reviewId,
    entityType,
    entityId,
    reviewerId: reviewer.id,
    status: "approved",
    notes
  });

  // Revalidate to update UI
  revalidatePath("/admin/content");
  revalidatePath("/admin/review");
  return { success: true };
}

export async function requestChangesEntity(
  entityType: "lesson" | "concept" | "question_template",
  entityId: string,
  notes: string
) {
  const reviewer = await requireReviewerOrAdmin();
  const reviewId = `rev_${entityType}_${entityId}_${Date.now()}`;

  if (entityType === "lesson") {
    await db.update(lessons).set({
      status: "draft",
      updatedBy: reviewer.id,
      updatedAt: new Date()
    }).where(eq(lessons.id, entityId));
  } else if (entityType === "concept") {
    await db.update(conceptBank).set({
      status: "draft",
      scientificConfidence: 0, // Reset confidence
      reviewerNotes: notes,
      updatedBy: reviewer.id,
      updatedAt: new Date()
    }).where(eq(conceptBank.id, entityId));
  } else if (entityType === "question_template") {
    await db.update(questionTemplates).set({
      status: "draft",
      updatedAt: new Date()
    }).where(eq(questionTemplates.id, entityId));
  }

  // Log audit
  await db.insert(contentReviews).values({
    id: reviewId,
    entityType,
    entityId,
    reviewerId: reviewer.id,
    status: "needs_changes",
    notes
  });

  revalidatePath("/admin/content");
  revalidatePath("/admin/review");
  return { success: true };
}

export async function rejectEntity(
  entityType: "lesson" | "concept" | "question_template",
  entityId: string,
  notes: string
) {
  const reviewer = await requireReviewerOrAdmin();
  const reviewId = `rev_${entityType}_${entityId}_${Date.now()}`;

  if (entityType === "lesson") {
    await db.update(lessons).set({
      status: "draft",
      updatedBy: reviewer.id,
      updatedAt: new Date()
    }).where(eq(lessons.id, entityId));
  } else if (entityType === "concept") {
    await db.update(conceptBank).set({
      status: "draft",
      scientificConfidence: 0,
      reviewerNotes: notes,
      updatedBy: reviewer.id,
      updatedAt: new Date()
    }).where(eq(conceptBank.id, entityId));
  } else if (entityType === "question_template") {
    await db.update(questionTemplates).set({
      status: "draft",
      updatedAt: new Date()
    }).where(eq(questionTemplates.id, entityId));
  }

  // Log audit
  await db.insert(contentReviews).values({
    id: reviewId,
    entityType,
    entityId,
    reviewerId: reviewer.id,
    status: "rejected",
    notes
  });

  revalidatePath("/admin/content");
  revalidatePath("/admin/review");
  return { success: true };
}
