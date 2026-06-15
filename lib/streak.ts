/**
 * Calculates the user's new streak by comparing current UTC date and lastActive UTC date.
 */
export function calculateNewStreak(lastActive: Date | null, currentStreak: number, now: Date): number {
  const getUtcMidnight = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const todayUtcMidnight = getUtcMidnight(now);

  if (!lastActive) {
    return 1;
  }

  const lastActiveUtcMidnight = getUtcMidnight(lastActive);
  const diffTime = todayUtcMidnight.getTime() - lastActiveUtcMidnight.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return currentStreak;
  } else if (diffDays === 1) {
    return currentStreak + 1;
  } else {
    return 1;
  }
}
