import type { BadgeId } from "@/data/badges";

export interface BadgeMetrics {
  completedLessons: number;
  completedWuduLessons: number;
  publishedPurityLessons: number;
  completedPurityLessons: number;
  streak: number;
  mistakeSignals: number;
}

export function evaluateBadgeCriteria(metrics: BadgeMetrics): BadgeId[] {
  const awards: BadgeId[] = [];

  if (metrics.completedLessons >= 1) {
    awards.push("first_step");
  }

  if (metrics.completedWuduLessons >= 3) {
    awards.push("faqih_wudu");
  }

  if (metrics.publishedPurityLessons > 0 && metrics.completedPurityLessons >= metrics.publishedPurityLessons) {
    awards.push("purity_master");
  }

  if (metrics.streak >= 7) {
    awards.push("persistent_7");
  }

  if (metrics.mistakeSignals >= 10) {
    awards.push("mistake_reviewer_10");
  }

  return awards;
}
