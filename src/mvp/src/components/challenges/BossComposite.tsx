import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import type { Challenge } from '@/types/content'
import { bossAggregate, type JudgeOutcome } from '@/lib/scoring'
import { getChallenge } from '@/lib/content'
import { cn } from '@/lib/utils'
import SingleChoice from './SingleChoice'
import MultiChoice from './MultiChoice'
import Matching from './Matching'
import Ordering from './Ordering'
import CodeBlank from './CodeBlank'

type Props = {
  challenge: Challenge
  onResult: (outcome: JudgeOutcome) => void
}

function SubChallenge({
  challenge,
  onResult,
}: {
  challenge: Challenge
  onResult: (outcome: JudgeOutcome) => void
}) {
  switch (challenge.type) {
    case 'single_choice':
      return <SingleChoice challenge={challenge} onResult={onResult} />
    case 'multi_choice':
      return <MultiChoice challenge={challenge} onResult={onResult} />
    case 'matching':
      return <Matching challenge={challenge} onResult={onResult} />
    case 'ordering':
      return <Ordering challenge={challenge} onResult={onResult} />
    case 'code_blank':
      return <CodeBlank challenge={challenge} onResult={onResult} />
    default:
      return <p className="text-sm text-destructive">不支持的子题型：{challenge.type}</p>
  }
}

function BossComposite({ challenge, onResult }: Props) {
  const subs = useMemo(() => {
    const ids = challenge.subChallengeIds ?? []
    return ids
      .map((id) => getChallenge(id))
      .filter((c): c is Challenge => Boolean(c))
      .filter((c) => c.type !== 'boss_composite')
  }, [challenge.subChallengeIds])

  const [results, setResults] = useState<Record<number, JudgeOutcome>>({})
  const [cursor, setCursor] = useState(0)
  const [finalized, setFinalized] = useState(false)

  if (subs.length === 0) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 px-4 py-6 text-center">
        <p className="text-sm text-destructive">
          该 Boss 题未配置子题（subChallengeIds 为空），无法挑战。
        </p>
      </div>
    )
  }

  const handleSubResult = (idx: number, outcome: JudgeOutcome) => {
    const next = { ...results, [idx]: outcome }
    setResults(next)
    if (idx < subs.length - 1) {
      setCursor(idx + 1)
    } else {
      const ordered = subs.map((_, i) => next[i]).filter(Boolean) as JudgeOutcome[]
      const agg = bossAggregate(ordered, challenge.passScore ?? 80)
      const bossOutcome: JudgeOutcome = {
        challengeId: challenge.id,
        result: agg.result,
        score: agg.passed ? challenge.xp : agg.totalScore,
        maxScore: challenge.xp,
        xp: agg.passed ? challenge.xp : 0,
        correct: agg.passed,
        detail: Object.fromEntries(subs.map((s, i) => [s.id, next[i]?.selectedAnswer])),
        selectedAnswer: Object.fromEntries(subs.map((s, i) => [s.id, next[i]?.selectedAnswer])),
        correctAnswer: challenge.correctAnswer,
        explanation: challenge.explanation,
      }
      setFinalized(true)
      onResult(bossOutcome)
    }
  }

  const agg = finalized
    ? bossAggregate(subs.map((_, i) => results[i]).filter(Boolean) as JudgeOutcome[], challenge.passScore ?? 80)
    : null

  const answeredCount = Object.keys(results).length

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Trophy className="h-4 w-4 text-primary" />
        <span>Boss 复合题 · 共 {subs.length} 关</span>
        <span className="ml-auto font-mono">
          {Math.min(cursor + (finalized ? 0 : 1), subs.length)} / {subs.length}
        </span>
      </div>

      <div className="flex gap-1.5">
        {subs.map((s, i) => {
          const done = results[i]
          const active = i === cursor && !finalized
          return (
            <div
              key={s.id}
              className={cn(
                'h-1.5 flex-1 rounded-full transition',
                done?.result === 'correct' && 'bg-emerald-500',
                done?.result === 'partial' && 'bg-amber-500',
                done?.result === 'wrong' && 'bg-destructive',
                active && 'bg-primary',
                !done && !active && 'bg-border'
              )}
            />
          )
        })}
      </div>

      {!finalized && (
        <div className="rounded-lg border border-border bg-card/40 p-4">
          <div className="mb-3">
            <span className="text-xs text-primary font-mono">关卡 {cursor + 1}</span>
            <h4 className="text-base font-semibold text-foreground">{subs[cursor].title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{subs[cursor].prompt}</p>
          </div>
          <SubChallenge
            key={subs[cursor].id}
            challenge={subs[cursor]}
            onResult={(o) => handleSubResult(cursor, o)}
          />
        </div>
      )}

      {finalized && agg && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'rounded-lg border px-4 py-5 text-center space-y-3',
            agg.passed
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-destructive bg-destructive/10'
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <Trophy className={cn('h-6 w-6', agg.passed ? 'text-emerald-400' : 'text-destructive')} />
            <span className={cn('text-lg font-bold', agg.passed ? 'text-emerald-400' : 'text-destructive')}>
              {agg.passed ? '挑战通关！' : '挑战失败'}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            完成度 <span className="text-foreground font-mono text-xl">{agg.ratio}</span> / 100
            （通关线 {challenge.passScore ?? 80}）
            <span className="ml-2 text-xs">子题得分 {agg.totalScore}/{agg.maxScore}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            {subs.map((s, i) => (
              <span
                key={s.id}
                className={cn(
                  'rounded px-2 py-1 border',
                  results[i]?.result === 'correct' && 'border-emerald-500/50 text-emerald-300',
                  results[i]?.result === 'partial' && 'border-amber-500/50 text-amber-300',
                  results[i]?.result === 'wrong' && 'border-destructive/50 text-destructive'
                )}
              >
                {s.title}
              </span>
            ))}
          </div>
          {challenge.explanation && (
            <p className="text-sm text-foreground/80 pt-2 border-t border-border">{challenge.explanation}</p>
          )}
        </motion.div>
      )}
    </div>
  )
}

export { BossComposite }
export default BossComposite
