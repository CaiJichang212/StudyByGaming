import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Challenge, CodeBlank as Blank } from '@/types/content'
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

const PLACEHOLDER_RE = /_{3}(\d+)_{3}/g

function CodeBlank({
  challenge,
  onResult,
  suppressFeedback,
  onHint,
  onNext,
  showHint,
}: Props & FeedbackControl) {
  const blanks: Blank[] = challenge.blanks ?? []
  const template = challenge.codeTemplate ?? ''
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [outcome, setOutcome] = useState<JudgeOutcome | null>(null)

  const setAnswer = (id: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [id]: val }))
  }

  const handleSubmit = () => {
    if (blanks.length === 0) return
    const res = judgeAnswer(challenge, answers)
    setOutcome(res)
    onResult(res)
  }

  const reveal = outcome !== null
  const detail: Record<string, boolean> = {}
  if (outcome) {
    for (const b of blanks) {
      detail[b.id] = (answers[b.id] ?? '').trim() === b.answer.trim()
    }
  }

  const segments: Array<{ type: 'text'; value: string } | { type: 'blank'; id: string }> = []
  let lastIndex = 0
  const re = new RegExp(PLACEHOLDER_RE)
  let match: RegExpExecArray | null
  while ((match = re.exec(template)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: template.slice(lastIndex, match.index) })
    }
    segments.push({ type: 'blank', id: match[1] })
    lastIndex = re.lastIndex
  }
  if (lastIndex < template.length) {
    segments.push({ type: 'text', value: template.slice(lastIndex) })
  }

  const allFilled = blanks.every((b) => (answers[b.id] ?? '').trim().length > 0)

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">在 <code className="font-mono text-primary">___n___</code> 占位处填入正确代码</p>
      <pre className="font-mono text-sm bg-background/60 border border-border rounded p-3 whitespace-pre-wrap leading-relaxed text-foreground">
        <code>
          {segments.map((seg, i) => {
            if (seg.type === 'text') return <span key={i}>{seg.value}</span>
            const blank = blanks.find((b) => b.id === seg.id)
            const ok = detail[seg.id]
            return (
              <input
                key={i}
                value={answers[seg.id] ?? ''}
                disabled={reveal}
                placeholder={blank?.placeholder ?? `空${seg.id}`}
                onChange={(e) => setAnswer(seg.id, e.target.value)}
                className={cn(
                  'inline-block mx-1 px-2 py-0.5 rounded bg-secondary/60 border text-foreground',
                  'focus:outline-none focus:border-primary focus:shadow-glow transition disabled:opacity-80',
                  'w-32 align-middle font-mono',
                  !reveal && 'border-border',
                  reveal && ok && 'border-emerald-500 bg-emerald-500/10',
                  reveal && !ok && 'border-destructive bg-destructive/10'
                )}
              />
            )
          })}
        </code>
      </pre>

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

export { CodeBlank }
export default CodeBlank
