import { motion } from 'framer-motion'
import { X, Lightbulb } from 'lucide-react'
import type { WeakTag } from '@/types/events'

type Props = { weakTags: WeakTag[] }

export function WeakTagList({ weakTags }: Props) {
  if (weakTags.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">薄弱知识点</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          暂无薄弱点，继续加油 🚀
        </p>
      </section>
    )
  }

  const max = Math.max(...weakTags.map((t) => t.score), 1)
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-display text-lg font-semibold">薄弱知识点</h2>
      <p className="mb-3 text-xs text-muted-foreground">按综合分数排序，建议优先复习</p>
      <ul className="space-y-3">
        {weakTags.map((t, i) => (
          <motion.li
            key={t.tag}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-lg border border-border bg-secondary/30 p-3"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{t.tag}</span>
              <span className="ml-auto inline-flex items-center gap-1 text-sm text-destructive">
                <X className="h-4 w-4" /> {t.wrongCount}
              </span>
              <span className="inline-flex items-center gap-1 text-sm text-amber-400">
                <Lightbulb className="h-4 w-4" /> {t.hintCount}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 to-destructive"
                initial={{ width: 0 }}
                animate={{ width: `${(t.score / max) * 100}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
