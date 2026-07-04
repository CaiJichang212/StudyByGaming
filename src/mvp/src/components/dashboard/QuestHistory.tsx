import { motion } from 'framer-motion'
import { Check, Circle, Lock } from 'lucide-react'
import type { LearningStats } from '@/types/events'
import { quests } from '@/lib/content'
import { cn } from '@/lib/utils'

type Props = { stats: LearningStats }

export function QuestHistory({ stats }: Props) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-display text-lg font-semibold">关卡历程</h2>
      <ul className="mt-3 space-y-2">
        {quests.map((q, i) => {
          const s = stats.questStats[q.id]
          const completed = s?.completed ?? false
          const submitted = s?.submitted ?? 0
          const correct = s?.correct ?? 0
          const xp = s?.xp ?? 0
          const accuracy = submitted > 0 ? Math.round((correct / submitted) * 100) : null
          return (
            <motion.li
              key={q.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                'flex items-center gap-3 rounded-lg border border-border p-3 transition',
                completed ? 'bg-primary/5' : 'bg-secondary/30'
              )}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-background text-lg">
                {q.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{q.title}</span>
                  {q.isBoss && (
                    <span className="rounded bg-destructive/20 px-1.5 text-xs text-destructive">
                      BOSS
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {submitted > 0
                    ? `正确率 ${accuracy}% · ${correct}/${submitted}`
                    : '尚未作答'}
                </div>
              </div>
              <div className="text-right">
                {xp > 0 && <div className="text-sm text-primary">+{xp} XP</div>}
              </div>
              <span className="ml-1">
                {completed ? (
                  <Check className="h-5 w-5 text-primary" />
                ) : submitted > 0 ? (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground/50" />
                )}
              </span>
            </motion.li>
          )
        })}
      </ul>
    </section>
  )
}
