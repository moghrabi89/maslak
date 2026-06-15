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

// Streak calculation tests
import { calculateNewStreak } from "../lib/streak";

const baseDate = new Date("2026-06-15T12:00:00Z"); // UTC noon
const sameDay = new Date("2026-06-15T18:00:00Z"); // Same day UTC
const yesterday = new Date("2026-06-14T10:00:00Z"); // Yesterday UTC
const twoDaysAgo = new Date("2026-06-13T23:59:00Z"); // More than 1 day ago UTC

assert(calculateNewStreak(null, 0, baseDate) === 1, "Streak should be 1 if lastActive is null");
assert(calculateNewStreak(sameDay, 5, baseDate) === 5, "Streak should not change if lastActive is today");
assert(calculateNewStreak(yesterday, 5, baseDate) === 6, "Streak should increment by 1 if lastActive is yesterday");
assert(calculateNewStreak(twoDaysAgo, 5, baseDate) === 1, "Streak should reset to 1 if lastActive is more than 1 day ago");

console.log("Gamification tests passed");
