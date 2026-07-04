export type ChallengeType =
  | 'single_choice'
  | 'multi_choice'
  | 'matching'
  | 'ordering'
  | 'code_blank'
  | 'boss_composite';

export type SourceRef = {
  doc: string;
  chapter: string;
  page: number;
};

export type MatchingPair = { left: string; right: string };

export type CodeBlank = { id: string; answer: string; placeholder?: string };

export type Challenge = {
  id: string;
  type: ChallengeType;
  title: string;
  prompt: string;
  options?: string[];
  correctAnswer: unknown;
  pairs?: MatchingPair[];
  items?: string[];
  blanks?: CodeBlank[];
  codeTemplate?: string;
  subChallengeIds?: string[];
  passScore?: number;
  explanation: string;
  hint?: string;
  tags: string[];
  xp: number;
  sourceRefs?: SourceRef[];
};

export type KnowledgeCard = { title: string; body: string };

export type Quest = {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  story: string;
  icon: string;
  learningObjectives: string[];
  cards: KnowledgeCard[];
  challengeIds: string[];
  unlockAfter: string[];
  rewardXp: number;
  badgeId: string | null;
  isBoss?: boolean;
  accent?: string;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export type ContentPack = {
  packId: string;
  title: string;
  sourceDoc: string;
  sourceVersion: string;
  totalPages: number;
  theme: 'npu-fantasy';
  estimatedMinutes: number;
};

export type SourceChunk = {
  chunkId: string;
  docId: string;
  chapter: string;
  pageStart: number;
  pageEnd: number;
  text: string;
  tags: string[];
};
