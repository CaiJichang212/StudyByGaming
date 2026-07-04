import { motion } from 'framer-motion'
import { ArrowLeft, Play, Sparkles } from 'lucide-react'
import type { LearningStats } from '@/types/events'
import { useGameStore } from '@/store/useGameStore'
import { quests } from '@/lib/content'
import { ProgressOverview } from './ProgressOverview'
import { WeakTagList } from './WeakTagList'
import { QuestHistory } from './QuestHistory'
import { ReviewSuggestions } from './ReviewSuggestions'
import { BadgePanel } from './BadgePanel'

type Props = { stats: LearningStats }

export function DashboardScreen({ stats }: Props) {
  const goLanding = useGameStore((s) => s.goLanding)
  const goQuest = useGameStore((s) => s.goQuest)

  const isEmpty = stats.submittedCount === 0 && stats.completedQuestIds.length === 0

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={goLanding}
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-sm transition hover:border-primary/50"
        >
          <ArrowLeft className="h-4 w-4" /> 返回
        </button>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          学习仪表盘
        </h1>
      </header>

      {isEmpty ? (
        <EmptyHero onStart={() => goQuest(quests[0]?.id ?? 'q0_intro')} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="lg:col-span-2">
            <ProgressOverview stats={stats} />
          </div>
          <div className="space-y-4">
            <QuestHistory stats={stats} />
            <ReviewSuggestions
              suggestions={stats.reviewSuggestions}
              onPick={(qid) => goQuest(qid)}
            />
          </div>
          <div className="space-y-4">
            <WeakTagList weakTags={stats.weakTags} />
            <BadgePanel badgeIds={stats.badges} />
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyHero({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-10 text-center"
    >
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="relative">
        <Sparkles className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-4 font-display text-2xl font-bold">开始你的第一关</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          仪表盘会在这里追踪你的 XP、关卡进度、薄弱点和徽章。先去打第一关吧！
        </p>
        <button
          type="button"
          onClick={onStart}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          <Play className="h-4 w-4" /> 进入新手村
        </button>
      </div>
    </motion.div>
  )
}
