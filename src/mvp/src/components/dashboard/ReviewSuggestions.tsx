import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import type { ReviewSuggestion } from '@/types/events'
import { getQuest } from '@/lib/content'

type Props = {
  suggestions: ReviewSuggestion[]
  onPick: (questId: string) => void
}

export function ReviewSuggestions({ suggestions, onPick }: Props) {
  if (suggestions.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">推荐复习</h2>
        <p className="mt-3 text-sm text-muted-foreground">暂无推荐，保持当前节奏！</p>
      </section>
    )
  }
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-display text-lg font-semibold">推荐复习</h2>
      <ul className="mt-3 space-y-2">
        {suggestions.map((s, i) => {
          const q = getQuest(s.questId)
          return (
            <motion.li
              key={s.questId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-background text-lg">
                {q?.icon ?? '🔁'}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{q?.title ?? s.questId}</div>
                <div className="truncate text-xs text-muted-foreground">{s.reason}</div>
              </div>
              <button
                type="button"
                onClick={() => onPick(s.questId)}
                className="inline-flex items-center gap-1 rounded-lg border border-primary/50 bg-primary/10 px-3 py-1.5 text-sm text-primary transition hover:bg-primary/20"
              >
                <RefreshCw className="h-4 w-4" /> 去复习
              </button>
            </motion.li>
          )
        })}
      </ul>
    </section>
  )
}
