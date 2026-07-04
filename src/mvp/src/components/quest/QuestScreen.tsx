import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Map as MapIcon, LayoutDashboard } from 'lucide-react'
import type { Quest } from '@/types/content'
import type { JudgeOutcome } from '@/lib/scoring'
import { getQuestChallenges, getBadge } from '@/lib/content'
import { appendEvent } from '@/lib/events'
import { useGameStore } from '@/store/useGameStore'
import { cn } from '@/lib/utils'
import QuestHeader from './QuestHeader'
import KnowledgeCard from './KnowledgeCard'
import ChallengeRenderer from '@/components/challenges/ChallengeRenderer'
import FeedbackPanel from '@/components/challenges/FeedbackPanel'

type Props = { quest: Quest }

type ChallengeOutcome = {
  outcome: JudgeOutcome
  timeSpentSec: number
}

export default function QuestScreen({ quest }: Props) {
  const challenges = useMemo(() => getQuestChallenges(quest), [quest])
  const bump = useGameStore((s) => s.bump)
  const goLanding = useGameStore((s) => s.goLanding)
  const goDashboard = useGameStore((s) => s.goDashboard)

  const [currentIdx, setCurrentIdx] = useState(0)
  const [results, setResults] = useState<Record<string, ChallengeOutcome>>({})
  const [showHint, setShowHint] = useState(false)
  const [completed, setCompleted] = useState(false)
  const startedAtRef = useRef<number>(Date.now())

  const current = challenges[currentIdx]

  useEffect(() => {
    startedAtRef.current = Date.now()
    setShowHint(false)
  }, [currentIdx, current?.id])

  if (challenges.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <QuestHeader quest={quest} />
        <div className="mt-8 rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          本关为 Boss 关，没有普通题目。请从地图进入 Boss 挑战。
        </div>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={goLanding}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:brightness-110 transition"
          >
            <MapIcon className="h-4 w-4" />
            返回地图
          </button>
        </div>
      </div>
    )
  }

  if (completed) {
    return (
      <CompletionScreen
        quest={quest}
        results={results}
        goLanding={goLanding}
        goDashboard={goDashboard}
      />
    )
  }

  const handleResult = (outcome: JudgeOutcome) => {
    if (!current) return
    const timeSpentSec = Math.max(
      0,
      Math.round((Date.now() - startedAtRef.current) / 1000)
    )
    appendEvent({
      eventType: 'challenge_submitted',
      questId: quest.id,
      challengeId: current.id,
      challengeType: current.type,
      result: outcome.result,
      score: outcome.score,
      maxScore: outcome.maxScore,
      xpDelta: outcome.xp,
      tags: current.tags,
      selectedAnswer: outcome.detail ?? null,
      correctAnswer: current.correctAnswer,
      timeSpentSec,
    })
    setResults((prev) => ({
      ...prev,
      [current.id]: { outcome, timeSpentSec },
    }))
    bump()
  }

  const handleHint = () => {
    if (!current) return
    appendEvent({
      eventType: 'hint_requested',
      questId: quest.id,
      challengeId: current.id,
      challengeType: current.type,
      tags: current.tags,
    })
    setShowHint(true)
    bump()
  }

  const handleNext = () => {
    if (!current) return
    if (currentIdx < challenges.length - 1) {
      setCurrentIdx((i) => i + 1)
      return
    }
    const totalScore = Object.values(results).reduce(
      (sum, r) => sum + r.outcome.score / Math.max(r.outcome.maxScore, 1),
      0
    )
    const ratio = challenges.length
      ? Math.round((totalScore / challenges.length) * 100)
      : 0
    appendEvent({
      eventType: 'quest_completed',
      questId: quest.id,
      score: ratio,
      maxScore: 100,
    })
    bump()
    setCompleted(true)
  }

  const currentResult = current ? results[current.id] : undefined
  const submitted = Boolean(currentResult)

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <QuestHeader quest={quest} />

      <div className="mt-6 space-y-4">
        {quest.cards.map((card, i) => (
          <KnowledgeCard key={card.title} card={card} index={i} />
        ))}
      </div>

      <div className="my-8 h-px bg-border" />

      <div className="flex items-center justify-center gap-2">
        {challenges.map((c, i) => (
          <span
            key={c.id}
            className={cn(
              'h-2 rounded-full transition-all',
              i === currentIdx
                ? 'w-6 bg-primary'
                : i < currentIdx
                ? 'w-2 bg-primary/50'
                : 'w-2 bg-border'
            )}
          />
        ))}
      </div>

      <p className="mt-2 text-center text-xs text-muted-foreground">
        第 {currentIdx + 1} / {challenges.length} 题
      </p>

      <div className="mt-5 rounded-2xl border border-border bg-card/60 p-5 sm:p-6">
        <ChallengeRenderer
          key={current.id}
          challenge={current}
          onResult={handleResult}
          suppressFeedback
          onHint={handleHint}
          onNext={handleNext}
          showHint={showHint}
        />

        {submitted && currentResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FeedbackPanel
              outcome={currentResult.outcome}
              challenge={current}
              onHint={handleHint}
              onNext={handleNext}
              showHint={showHint}
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}

function CompletionScreen({
  quest,
  results,
  goLanding,
  goDashboard,
}: {
  quest: Quest
  results: Record<string, ChallengeOutcome>
  goLanding: () => void
  goDashboard: () => void
}) {
  const badge = getBadge(quest.badgeId)
  const earnedXp = Object.values(results).reduce(
    (sum, r) => sum + r.outcome.xp,
    0
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-accent/20 border border-primary/40"
      >
        <Trophy className="h-12 w-12 text-primary text-glow" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-6 font-display text-3xl font-bold text-foreground"
      >
        通关！
      </motion.h2>
      <p className="mt-2 text-sm text-muted-foreground">
        你已完成「{quest.title}」
      </p>

      <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2">
        <span className="text-xs text-muted-foreground">获得</span>
        <span className="font-display text-lg font-semibold text-primary">
          +{earnedXp} XP
        </span>
      </div>

      {badge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mx-auto mt-6 max-w-xs rounded-xl border border-accent/40 bg-accent/5 p-4"
        >
          <div className="text-3xl">{badge.icon}</div>
          <div className="mt-1 font-display text-base font-semibold text-foreground">
            {badge.name}
          </div>
          <div className="text-xs text-muted-foreground">{badge.description}</div>
        </motion.div>
      )}

      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={goLanding}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:border-primary/50 transition"
        >
          <MapIcon className="h-4 w-4" />
          返回地图
        </button>
        <button
          type="button"
          onClick={goDashboard}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:brightness-110 transition"
        >
          <LayoutDashboard className="h-4 w-4" />
          查看仪表盘
        </button>
      </div>
    </div>
  )
}
