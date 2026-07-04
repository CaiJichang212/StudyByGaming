import { ArrowLeft, Target } from 'lucide-react'
import type { Quest } from '@/types/content'
import { useGameStore } from '@/store/useGameStore'
import { cn } from '@/lib/utils'

type Props = {
  quest: Quest
}

export default function QuestHeader({ quest }: Props) {
  const goLanding = useGameStore((s) => s.goLanding)
  const accent = quest.accent ?? 'from-primary/20 to-primary/5'

  return (
    <header className="relative overflow-hidden rounded-2xl border border-border">
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br pointer-events-none',
          accent
        )}
      />
      <div className="relative p-6 sm:p-8">
        <button
          type="button"
          onClick={goLanding}
          className={cn(
            'inline-flex items-center gap-1.5 text-xs text-muted-foreground',
            'hover:text-primary transition mb-4'
          )}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回地图
        </button>

        <div className="flex items-center gap-3">
          <span className="text-4xl drop-shadow-[0_0_12px_hsl(var(--primary)/0.4)]">
            {quest.icon}
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {quest.title}
            </h1>
            <p className="text-sm text-muted-foreground">{quest.subtitle}</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-foreground/80">
          {quest.story}
        </p>

        {quest.learningObjectives.length > 0 && (
          <div className="mt-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">
              学习目标
            </p>
            <ul className="space-y-1.5">
              {quest.learningObjectives.map((obj) => (
                <li
                  key={obj}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  )
}
