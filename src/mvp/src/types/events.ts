import type { ChallengeType } from './content';

export type EventType =
  | 'quest_started'
  | 'challenge_submitted'
  | 'hint_requested'
  | 'quest_completed'
  | 'boss_completed'
  | 'review_started';

export type EventResult = 'correct' | 'wrong' | 'partial';

export type LearningEvent = {
  id: string;
  userId: string;
  sessionId: string;
  eventType: EventType;
  questId?: string;
  challengeId?: string;
  challengeType?: ChallengeType;
  result?: EventResult;
  score?: number;
  maxScore?: number;
  xpDelta?: number;
  tags?: string[];
  selectedAnswer?: unknown;
  correctAnswer?: unknown;
  timeSpentSec?: number;
  createdAt: string;
};

export type WeakTag = {
  tag: string;
  wrongCount: number;
  hintCount: number;
  score: number;
};

export type ReviewSuggestion = { questId: string; reason: string };

export type LearningStats = {
  totalXp: number;
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  completedQuestIds: string[];
  progressRatio: number;
  totalQuests: number;
  submittedCount: number;
  correctCount: number;
  accuracy: number;
  weakTags: WeakTag[];
  reviewSuggestions: ReviewSuggestion[];
  badges: string[];
  questStats: Record<
    string,
    { submitted: number; correct: number; xp: number; completed: boolean }
  >;
};
