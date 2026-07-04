import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
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

function MultiChoice({
  challenge,
  onResult,
  suppressFeedback,
  onHint,
  onNext,
  showHint,
}: Props & FeedbackControl) {
  const options = challenge.options ?? []
  const correctSet = new Set((challenge.correctAnswer as string[]) ?? [])
  const [picked, setPicked] = useState<string[]>([])
  const [outcome, setOutcome] = useState<JudgeOutcome | null>(null)

  const toggle = (opt: string) => {
    setPicked((prev) =>
      prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]
    )
  }

  const handleSubmit = () => {
    if (picked.length === 0) return
    const res = judgeAnswer(challenge, picked)
    setOutcome(res)
    onResult(res)
  }

  const reveal = outcome !== null

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">多选题：选择所有正确项</p>
      <div className="space-y-2">
        {options.map((opt) => {
          const isSel = picked.includes(opt)
          const isCorrect = correctSet.has(opt)
          return (
            <button
              key={opt}
              type="button"
              disabled={reveal}
              onClick={() => toggle(opt)}
              className={cn(
                'w-full text-left bg-card hover:bg-secondary/60 border border-border rounded-lg px-4 py-3 transition',
                'flex items-center justify-between gap-3',
                isSel && !reveal && 'border-primary bg-primary/10 shadow-glow',
                reveal && isCorrect && 'border-emerald-500 bg-emerald-500/10',
                reveal && isSel && !isCorrect && 'border-destructive bg-destructive/10'
              )}
            >
              <span className="text-sm text-foreground">{opt}</span>
              <span
                className={cn(
                  'h-5 w-5 rounded border border-border flex items-center justify-center shrink-0',
                  isSel && !reveal && 'bg-primary border-primary'
                )}
              >
                {reveal && isCorrect && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                {reveal && isSel && !isCorrect && <X className="h-3.5 w-3.5 text-destructive" />}
                {isSel && !reveal && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
              </span>
            </button>
          )
        })}
      </div>

      {!reveal && (
        <button
          type="button"
          disabled={picked.length === 0}
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

export { MultiChoice }
export default MultiChoice
