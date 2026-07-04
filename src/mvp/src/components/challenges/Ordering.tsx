import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'
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

function Ordering({
  challenge,
  onResult,
  suppressFeedback,
  onHint,
  onNext,
  showHint,
}: Props & FeedbackControl) {
  const initial = challenge.items ?? []
  const correct = (challenge.correctAnswer as string[]) ?? []
  const [order, setOrder] = useState<string[]>(initial)
  const [outcome, setOutcome] = useState<JudgeOutcome | null>(null)

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir
    if (next < 0 || next >= order.length) return
    setOrder((prev) => {
      const arr = [...prev]
      ;[arr[index], arr[next]] = [arr[next], arr[index]]
      return arr
    })
  }

  const handleSubmit = () => {
    const res = judgeAnswer(challenge, order)
    setOutcome(res)
    onResult(res)
  }

  const reveal = outcome !== null

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">使用上下按钮将条目排成正确顺序（顶部为首）</p>
      <div className="space-y-2">
        {order.map((item, i) => {
          const isCorrect = reveal && correct[i] === item
          const isWrong = reveal && correct[i] !== item
          return (
            <div
              key={item}
              className={cn(
                'flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3',
                reveal && isCorrect && 'border-emerald-500 bg-emerald-500/10',
                reveal && isWrong && 'border-destructive bg-destructive/10'
              )}
            >
              <span className="h-6 w-6 shrink-0 rounded bg-secondary text-xs text-secondary-foreground flex items-center justify-center font-mono">
                {i + 1}
              </span>
              <span className="flex-1 text-sm text-foreground">{item}</span>
              {!reveal && (
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="text-muted-foreground hover:text-primary disabled:opacity-30 transition"
                    aria-label="上移"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === order.length - 1}
                    className="text-muted-foreground hover:text-primary disabled:opacity-30 transition"
                    aria-label="下移"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {!reveal && (
        <button
          type="button"
          onClick={handleSubmit}
          className={cn(
            'bg-primary text-primary-foreground font-medium rounded-lg px-5 py-2.5 transition',
            'hover:brightness-110'
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

export { Ordering }
export default Ordering
