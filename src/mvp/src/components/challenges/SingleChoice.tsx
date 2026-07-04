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

export default function SingleChoice({
  challenge,
  onResult,
  suppressFeedback,
  onHint,
  onNext,
  showHint,
}: Props & FeedbackControl) {
  const options = challenge.options ?? []
  const correct = challenge.correctAnswer as string
  const [selected, setSelected] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<JudgeOutcome | null>(null)

  const handleSubmit = () => {
    if (selected === null) return
    const res = judgeAnswer(challenge, selected)
    setOutcome(res)
    onResult(res)
  }

  const reveal = outcome !== null

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {options.map((opt) => {
          const isSel = selected === opt
          const isCorrect = opt === correct
          return (
            <button
              key={opt}
              type="button"
              disabled={reveal}
              onClick={() => setSelected(opt)}
              className={cn(
                'w-full text-left bg-card hover:bg-secondary/60 border border-border rounded-lg px-4 py-3 transition',
                'flex items-center justify-between gap-3',
                isSel && !reveal && 'border-primary bg-primary/10 shadow-glow',
                reveal && isCorrect && 'border-emerald-500 bg-emerald-500/10',
                reveal && isSel && !isCorrect && 'border-destructive bg-destructive/10'
              )}
            >
              <span className="text-sm text-foreground">{opt}</span>
              {reveal && isCorrect && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
              {reveal && isSel && !isCorrect && <X className="h-4 w-4 text-destructive shrink-0" />}
            </button>
          )
        })}
      </div>

      {!reveal && (
        <button
          type="button"
          disabled={selected === null}
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
