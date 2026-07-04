import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Map, LayoutDashboard, RotateCcw, Trophy, Award, ChevronRight } from 'lucide-react'
import ChallengeRenderer from '@/components/challenges/ChallengeRenderer'
import { useGameStore } from '@/store/useGameStore'
import { useStats } from '@/store/useGameStore'
import { appendEvent } from '@/lib/events'
import {
  BOSS_BADGE_ID,
  BOSS_PASS_SCORE,
  BOSS_QUEST_ID,
  BOSS_REWARD_XP,
  getBadge,
  getBossSubChallenges,
  getQuest,
} from '@/lib/content'
import { bossAggregate, type BossAggregate, type JudgeOutcome } from '@/lib/scoring'

type Phase = 'intro' | 'battle' | 'result'

export function BossView() {
  const goLanding = useGameStore((s) => s.goLanding)
  const goDashboard = useGameStore((s) => s.goDashboard)
  const bump = useGameStore((s) => s.bump)

  const quest = getQuest(BOSS_QUEST_ID)
  const subChallenges = useMemo(() => getBossSubChallenges(), [])
  const badge = getBadge(BOSS_BADGE_ID)

  const [phase, setPhase] = useState<Phase>('intro')
  const [index, setIndex] = useState(0)
  const [outcomes, setOutcomes] = useState<JudgeOutcome[]>([])
  const [aggregate, setAggregate] = useState<BossAggregate | null>(null)

  const resetBattle = () => {
    setPhase('intro')
    setIndex(0)
    setOutcomes([])
    setAggregate(null)
  }

  const begin = () => {
    resetBattle()
    setPhase('battle')
  }

  const handleResult = (outcome: JudgeOutcome) => {
    const challenge = subChallenges[index]
    appendEvent({
      eventType: 'challenge_submitted',
      questId: BOSS_QUEST_ID,
      challengeId: challenge.id,
      challengeType: challenge.type,
      result: outcome.result,
      score: outcome.score,
      maxScore: outcome.maxScore,
      tags: challenge.tags,
      selectedAnswer: outcome.selectedAnswer,
      correctAnswer: outcome.correctAnswer,
    })

    const nextOutcomes = [...outcomes, outcome]
 setOutcomes(nextOutcomes)
    bump()

    if (nextOutcomes.length >= subChallenges.length) {
      finish(nextOutcomes)
    }
  }

  const finish = (all: JudgeOutcome[]) => {
    const agg = bossAggregate(all, BOSS_PASS_SCORE)
    const xpDelta = agg.passed
      ? BOSS_REWARD_XP
      : Math.round((BOSS_REWARD_XP * agg.totalScore) / 100)
    appendEvent({
      eventType: 'boss_completed',
      questId: BOSS_QUEST_ID,
      score: agg.ratio,
      maxScore: 100,
      result: agg.result,
      xpDelta,
      tags: ['boss', 'add_custom'],
    })
    setAggregate(agg)
    bump()
    setTimeout(() => setPhase('result'), 250)
  }

  const next = () => {
    if (index < subChallenges.length - 1) setIndex((i) => i + 1)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={goLanding}
          className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-sm transition hover:border-primary/50"
        >
          <ArrowLeft className="h-4 w-4" /> 返回
        </button>
        <h1 className="font-display text-xl font-bold sm:text-2xl">Boss 战</h1>
      </header>

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <BossIntro story={quest?.story ?? ''} onBegin={begin} />
          </motion.div>
        )}

        {phase === 'battle' && (
          <motion.div
            key="battle"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <BossProgress current={index + 1} total={subChallenges.length} />
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <ChallengeRenderer
                  challenge={subChallenges[index]}
                  onResult={handleResult}
                />
              </motion.div>
            </AnimatePresence>

            {outcomes.length > index && index < subChallenges.length - 1 && (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  下一题 <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {phase === 'result' && aggregate && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <BossResult
              aggregate={aggregate}
              earnedBadge={aggregate.passed ? badge : undefined}
              onMap={goLanding}
              onDashboard={goDashboard}
              onRetry={resetBattle}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function BossIntro({ story, onBegin }: { story: string; onBegin: () => void }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-destructive/30 bg-card p-8 text-center">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative mx-auto mb-4 grid h-28 w-28 place-items-center rounded-full bg-destructive/15 text-7xl shadow-glow"
      >
        🐲
      </motion.div>
      <h2 className="relative font-display text-3xl font-bold text-destructive text-glow">
        最终考验
      </h2>
      <p className="relative mx-auto mt-3 max-w-md text-sm text-muted-foreground">
        {story}
      </p>
      <div className="relative mx-auto mt-5 flex max-w-md flex-wrap justify-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full border border-border bg-secondary/40 px-3 py-1">5 道子题</span>
        <span className="rounded-full border border-border bg-secondary/40 px-3 py-1">总分 100</span>
        <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-primary">
          ≥ {BOSS_PASS_SCORE} 通关
        </span>
      </div>
      <button
        type="button"
        onClick={onBegin}
        className="relative mt-6 inline-flex items-center gap-2 rounded-lg bg-destructive px-6 py-2.5 font-semibold text-destructive-foreground transition hover:bg-destructive/90"
      >
        应战 🐲
      </button>
    </section>
  )
}

function BossProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="text-sm text-muted-foreground">
        子题 {current} / {total}
      </span>
      <div className="flex flex-1 gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={
              'h-1.5 flex-1 rounded-full ' +
              (i < current ? 'bg-primary' : i === current - 1 ? 'bg-primary/60' : 'bg-muted')
            }
          />
        ))}
      </div>
    </div>
  )
}

function BossResult({
  aggregate,
  earnedBadge,
  onMap,
  onDashboard,
  onRetry,
}: {
  aggregate: BossAggregate
  earnedBadge?: { id: string; name: string; description: string; icon: string }
  onMap: () => void
  onDashboard: () => void
  onRetry: () => void
}) {
  const passed = aggregate.passed
  return (
    <section
      className={
        'relative overflow-hidden rounded-2xl border bg-card p-8 text-center ' +
        (passed ? 'border-primary/40' : 'border-destructive/40')
      }
    >
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        className="relative"
      >
        <div className="font-display text-7xl font-bold text-glow">
          <AnimatedScore value={aggregate.ratio} />
          <span className="text-3xl">/100</span>
        </div>
        <div
          className={
            'mt-2 font-display text-2xl font-bold ' +
            (passed ? 'text-primary' : 'text-destructive')
          }
        >
          {passed ? '🏆 通关！' : '💔 未通关'}
        </div>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          {passed
            ? '你已证明自己掌握了 Add 算子的开发流程，徽章已收入囊中。'
            : `差 ${BOSS_PASS_SCORE - aggregate.ratio} 分通关，再战一次！`}
        </p>
      </motion.div>

      <AnimatePresence>
        {passed && earnedBadge && (
          <motion.div
            key="badge"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 180 }}
            className="relative mx-auto mt-6 max-w-xs rounded-xl border border-accent/50 bg-accent/10 p-5 shadow-glow-lg"
          >
            <motion.div
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              className="mx-auto mb-2 grid h-16 w-16 place-items-center rounded-full bg-accent/20 text-4xl"
            >
              {earnedBadge.icon}
            </motion.div>
            <div className="flex items-center justify-center gap-1 text-accent">
              <Trophy className="h-4 w-4" />
              <span className="font-display font-semibold">{earnedBadge.name}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{earnedBadge.description}</p>
            <div className="pointer-events-none absolute inset-0 -z-0 rounded-xl bg-accent/5 blur-xl" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative mt-6 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onMap}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-2 text-sm transition hover:border-primary/50"
        >
          <Map className="h-4 w-4" /> 回地图
        </button>
        <button
          type="button"
          onClick={onDashboard}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-2 text-sm transition hover:border-primary/50"
        >
          <LayoutDashboard className="h-4 w-4" /> 去仪表盘
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          <RotateCcw className="h-4 w-4" /> 再战一次
        </button>
      </div>
    </section>
  )
}

function AnimatedScore({ value }: { value: number }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 12 }}
      >
        {value}
      </motion.span>
    </motion.span>
  )
}

export function BossBadgePreview() {
  const stats = useStats()
  const earned = stats.badges.includes(BOSS_BADGE_ID)
  return (
    <Award className={'h-4 w-4 ' + (earned ? 'text-accent' : 'text-muted-foreground')} />
  )
}
