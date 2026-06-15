import { evaluateBadgeCriteria, type BadgeMetrics } from "../lib/gamification-rules";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const emptyMetrics: BadgeMetrics = {
  completedLessons: 0,
  completedWuduLessons: 0,
  publishedPurityLessons: 6,
  completedPurityLessons: 0,
  streak: 0,
  mistakeSignals: 0,
};

const noBadges = evaluateBadgeCriteria(emptyMetrics);
assert(noBadges.length === 0, "Empty metrics should not award badges");

const wuduBadges = evaluateBadgeCriteria({
  ...emptyMetrics,
  completedLessons: 3,
  completedWuduLessons: 3,
});
assert(wuduBadges.includes("first_step"), "First completed lesson should award first_step");
assert(wuduBadges.includes("faqih_wudu"), "Three wudu lessons should award faqih_wudu");

const purityBadges = evaluateBadgeCriteria({
  ...emptyMetrics,
  completedLessons: 6,
  completedWuduLessons: 3,
  completedPurityLessons: 6,
});
assert(purityBadges.includes("purity_master"), "Completing published purity lessons should award purity_master");

const habitBadges = evaluateBadgeCriteria({
  ...emptyMetrics,
  streak: 7,
  mistakeSignals: 10,
});
assert(habitBadges.includes("persistent_7"), "Seven-day streak should award persistent_7");
assert(habitBadges.includes("mistake_reviewer_10"), "Ten mistake signals should award mistake_reviewer_10");

console.log("Gamification tests passed");
