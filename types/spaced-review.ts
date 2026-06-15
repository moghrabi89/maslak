export interface ReviewQueueItem {
  conceptId: string;
  conceptName: string;
  category: string;
  lessonId: string;
  lessonTitle: string;
  strength: number;
  mistakeCount: number;
  nextReviewAt: string;
  lastReviewedAt: string | null;
  isDue: boolean;
}

export interface ReviewCenterData {
  stats: {
    total: number;
    dueCount: number;
    reviewedToday: number;
    strongCount: number;
    attentionCount: number;
    xp: number;
    gems: number;
  };
  dueItems: ReviewQueueItem[];
  upcomingItems: ReviewQueueItem[];
}

export interface ActiveReviewQuestion {
  conceptId: string;
  conceptName: string;
  category: string;
  questionPrompt: string;
  options: string[];
  difficulty: "easy" | "medium" | "hard";
  type: string;
  token: string;
}

export interface ReviewAnswerResult {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  nextStrength: number;
  nextReviewAt: string;
  xpGained: number;
  gemsGained: number;
  improved: boolean;
  needsAttention: boolean;
  awardedBadges?: Array<{
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    xpRequirement: number;
  }>;
}
