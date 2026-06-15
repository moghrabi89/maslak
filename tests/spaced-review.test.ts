import { calculateReviewOutcome } from "../lib/spaced-review";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const baseDate = new Date("2026-06-15T12:00:00.000Z");

const correct = calculateReviewOutcome({
  currentStrength: 2,
  isCorrect: true,
  now: baseDate,
});

assert(correct.nextStrength === 3, "Correct answer should increase strength by one");
assert(correct.xpReward === 6, "Correct review should grant XP");
assert(correct.gemsReward === 1, "Correct review should grant gems");
assert(correct.nextReviewAt.getTime() === baseDate.getTime() + 168 * 60 * 60 * 1000, "Strength 3 should schedule after 7 days");

const wrong = calculateReviewOutcome({
  currentStrength: 3,
  isCorrect: false,
  now: baseDate,
});

assert(wrong.nextStrength === 2, "Wrong answer should reduce strength by one");
assert(wrong.xpReward === 2, "Wrong review should only grant participation XP");
assert(wrong.gemsReward === 0, "Wrong review should not grant gems");
assert(wrong.nextReviewAt.getTime() === baseDate.getTime() + 6 * 60 * 60 * 1000, "Wrong answer should schedule a near review");

const floor = calculateReviewOutcome({
  currentStrength: 1,
  isCorrect: false,
  now: baseDate,
});

assert(floor.nextStrength === 1, "Strength should not go below one");
assert(floor.needsAttention, "Weak wrong answer should need attention");

const cap = calculateReviewOutcome({
  currentStrength: 5,
  isCorrect: true,
  now: baseDate,
});

assert(cap.nextStrength === 5, "Strength should not exceed five");

console.log("Spaced review tests passed");
