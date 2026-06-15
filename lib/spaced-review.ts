export const MIN_REVIEW_STRENGTH = 1;
export const MAX_REVIEW_STRENGTH = 5;

const CORRECT_INTERVAL_HOURS: Record<number, number> = {
  1: 24,
  2: 72,
  3: 168,
  4: 336,
  5: 720,
};

export interface ReviewOutcomeInput {
  currentStrength: number;
  isCorrect: boolean;
  now?: Date;
}

export interface ReviewOutcome {
  nextStrength: number;
  nextReviewAt: Date;
  xpReward: number;
  gemsReward: number;
  improved: boolean;
  needsAttention: boolean;
}

export function clampReviewStrength(strength: number) {
  return Math.min(MAX_REVIEW_STRENGTH, Math.max(MIN_REVIEW_STRENGTH, Math.trunc(strength)));
}

export function calculateReviewOutcome({
  currentStrength,
  isCorrect,
  now = new Date(),
}: ReviewOutcomeInput): ReviewOutcome {
  const normalizedStrength = clampReviewStrength(currentStrength);
  const nextStrength = isCorrect
    ? Math.min(MAX_REVIEW_STRENGTH, normalizedStrength + 1)
    : Math.max(MIN_REVIEW_STRENGTH, normalizedStrength - 1);

  const intervalHours = isCorrect ? CORRECT_INTERVAL_HOURS[nextStrength] : 6;
  const nextReviewAt = new Date(now.getTime() + intervalHours * 60 * 60 * 1000);

  return {
    nextStrength,
    nextReviewAt,
    xpReward: isCorrect ? 6 : 2,
    gemsReward: isCorrect ? 1 : 0,
    improved: isCorrect && nextStrength > normalizedStrength,
    needsAttention: !isCorrect || nextStrength <= 1,
  };
}
