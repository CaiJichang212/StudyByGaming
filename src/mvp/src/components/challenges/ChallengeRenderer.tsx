import type { Challenge } from '@/types/content'
import type { JudgeOutcome } from '@/lib/scoring'
import { cn } from '@/lib/utils'
import SingleChoice from './SingleChoice'
import MultiChoice from './MultiChoice'
import Matching from './Matching'
import Ordering from './Ordering'
import CodeBlank from './CodeBlank'
import BossComposite from './BossComposite'

export type ChallengeRendererProps = {
  challenge: Challenge
  onResult: (outcome: JudgeOutcome) => void
  className?: string
  suppressFeedback?: boolean
  onHint?: () => void
  onNext?: () => void
  showHint?: boolean
}

const TYPE_LABEL: Record<Challenge['type'], string> = {
  single_choice: '单选',
  multi_choice: '多选',
  matching: '连线匹配',
  ordering: '排序',
  code_blank: '代码填空',
  boss_composite: 'Boss 复合',
}

function Body({
  challenge,
  onResult,
  suppressFeedback,
  onHint,
  onNext,
  showHint,
}: ChallengeRendererProps) {
  const feedbackControl = { suppressFeedback, onHint, onNext, showHint }
  switch (challenge.type) {
    case 'single_choice':
      return <SingleChoice challenge={challenge} onResult={onResult} {...feedbackControl} />
    case 'multi_choice':
      return <MultiChoice challenge={challenge} onResult={onResult} {...feedbackControl} />
    case 'matching':
      return <Matching challenge={challenge} onResult={onResult} {...feedbackControl} />
    case 'ordering':
      return <Ordering challenge={challenge} onResult={onResult} {...feedbackControl} />
    case 'code_blank':
      return <CodeBlank challenge={challenge} onResult={onResult} {...feedbackControl} />
    case 'boss_composite':
      return <BossComposite challenge={challenge} onResult={onResult} />
    default:
      return <p className="text-sm text-destructive">未知题型</p>
  }
}

export default function ChallengeRenderer({
  challenge,
  onResult,
  className,
  suppressFeedback,
  onHint,
  onNext,
  showHint,
}: ChallengeRendererProps) {
  return (
    <div className={cn('animate-fade-up space-y-4', className)}>
      <header className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono uppercase tracking-wide text-primary bg-primary/10 border border-primary/30 rounded px-2 py-0.5">
            {TYPE_LABEL[challenge.type]}
          </span>
          <span className="text-xs font-mono text-primary">+{challenge.xp} XP</span>
          {challenge.tags.map((t) => (
            <span
              key={t}
              className="text-xs text-muted-foreground bg-secondary/60 border border-border rounded px-2 py-0.5"
            >
              #{t}
            </span>
          ))}
        </div>
        <h3 className="text-lg font-semibold text-foreground">{challenge.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{challenge.prompt}</p>
      </header>

      <div className="pt-1">
        <Body
          challenge={challenge}
          onResult={onResult}
          suppressFeedback={suppressFeedback}
          onHint={onHint}
          onNext={onNext}
          showHint={showHint}
        />
      </div>
    </div>
  )
}
