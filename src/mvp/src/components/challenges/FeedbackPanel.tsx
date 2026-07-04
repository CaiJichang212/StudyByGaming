import { Lightbulb, ArrowRight } from 'lucide-react'
import type { Challenge } from '@/types/content'
import type { JudgeOutcome } from '@/lib/scoring'
import { cn } from '@/lib/utils'

type Props = {
  outcome: JudgeOutcome
  challenge: Challenge
  onHint?: () => void
  onNext?: () => void
  showHint?: boolean
}

const RESULT_META: Record<
  JudgeOutcome['result'],
  { label: string; color: string; ring: string }
> = {
  correct: {
    label: '回答正确',
    color: 'text-emerald-400',
    ring: 'border-emerald-500/50 bg-emerald-500/5',
  },
  partial: {
    label: '部分正确',
    color: 'text-amber-400',
    ring: 'border-amber-500/50 bg-amber-500/5',
  },
  wrong: {
    label: '回答错误',
    color: 'text-destructive',
    ring: 'border-destructive/50 bg-destructive/5',
  },
}

export default function FeedbackPanel({
  outcome,
  challenge,
  onHint,
  onNext,
  showHint,
}: Props) {
  const meta = RESULT_META[outcome.result]
  const canHint = Boolean(onHint && challenge.hint)
  const canNext = Boolean(onNext)

  return (
    <div className={cn('mt-5 rounded-xl border p-4 space-y-3', meta.ring)}>
      <div className="flex items-center justify-between gap-3">
        <span className={cn('font-display text-lg', meta.color)}>
          {meta.label}
        </span>
        <span className="text-xs text-muted-foreground font-mono">
          +{outcome.xp} XP · {outcome.score}/{outcome.maxScore}
        </span>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {challenge.explanation}
      </p>

      {showHint && challenge.hint && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
          <p className="text-xs text-foreground/90">
            <span className="text-primary font-semibold">提示：</span>
            {challenge.hint}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        {canHint && !showHint && (
          <button
            type="button"
            onClick={onHint}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5',
              'text-xs text-muted-foreground hover:text-primary hover:border-primary/50 transition'
            )}
          >
            <Lightbulb className="h-3.5 w-3.5" />
            求提示
          </button>
        )}
        {canNext && (
          <button
            type="button"
            onClick={onNext}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 ml-auto',
              'text-xs font-medium text-primary-foreground hover:brightness-110 transition'
            )}
          >
            下一题
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
