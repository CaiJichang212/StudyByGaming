import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Challenge } from '@/types/content'
import { judgeAnswer, type JudgeOutcome } from '@/lib/scoring'
import { cn } from '@/lib/utils'
import FeedbackPanel from './FeedbackPanel'

type Props = {
  challenge: Challenge
  onResult: (outcome: JudgeOutcome) => void
}
type FeedbackControl = {
  suppressFeedback?: boolean
  onHint?: () => void
  onNext?: () => void
  showHint?: boolean
}

function Matching({
  challenge,
  onResult,
  suppressFeedback,
  onHint,
  onNext,
  showHint,
}: Props & FeedbackControl) {
  const pairs = challenge.pairs ?? []
  const lefts = pairs.map((p) => p.left)
  const rights = pairs.map((p) => p.right)
  const correctMap = challenge.correctAnswer as Record<string, string>

  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [outcome, setOutcome] = useState<JudgeOutcome | null>(null)

  const detail: Record<string, boolean> = {}
  if (outcome) {
    for (const l of lefts) {
      detail[l] = (mapping[l] ?? '').trim() === String(correctMap[l] ?? '').trim()
    }
  }

  const setPair = (left: string, right: string) => {
    setMapping((prev) => ({ ...prev, [left]: right }))
  }

  const handleSubmit = () => {
    if (lefts.some((l) => !mapping[l])) return
    const res = judgeAnswer(challenge, mapping)
    setOutcome(res)
    onResult(res)
  }

  const reveal = outcome !== null
  const allFilled = lefts.every((l) => mapping[l])

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">为左侧每项选择对应的右侧项</p>
      <div className="space-y-2">
        {lefts.map((left) => {
          const isCorrect = reveal && detail[left]
          const isWrong = reveal && !detail[left]
          return (
            <div
              key={left}
              className={cn(
                'flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3',
                reveal && isCorrect && 'border-emerald-500 bg-emerald-500/10',
                reveal && isWrong && 'border-destructive bg-destructive/10'
              )}
            >
              <span className="flex-1 text-sm text-foreground">{left}</span>
              <select
                value={mapping[left] ?? ''}
                disabled={reveal}
                onChange={(e) => setPair(left, e.target.value)}
                className={cn(
                  'flex-1 bg-background/60 border border-border rounded px-2 py-1.5 text-sm text-foreground',
                  'focus:outline-none focus:border-primary focus:shadow-glow transition disabled:opacity-70'
                )}
              >
                <option value="">— 选择 —</option>
                {rights.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          )
        })}
      </div>

      {!reveal && (
        <button
          type="button"
          disabled={!allFilled}
          onClick={handleSubmit}
          className={cn(
            'bg-primary text-primary-foreground font-medium rounded-lg px-5 py-2.5 transition',
            'hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed'
          )}
        >
          提交答案
        </button>
      )}

      {reveal && outcome && !suppressFeedback && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <FeedbackPanel
            outcome={outcome}
            challenge={challenge}
            onHint={onHint}
            onNext={onNext}
            showHint={showHint}
          />
        </motion.div>
      )}
    </div>
  )
}

export { Matching }
export default Matching
