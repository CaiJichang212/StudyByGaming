import { motion } from 'framer-motion'
import { Award, Lock } from 'lucide-react'
import { badges } from '@/lib/content'
import { cn } from '@/lib/utils'

type Props = { badgeIds: string[] }

export function BadgePanel({ badgeIds }: Props) {
  const earned = new Set(badgeIds)
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Award className="h-5 w-5 text-accent" />
        <h2 className="font-display text-lg font-semibold">成就徽章</h2>
        <span className="ml-auto text-xs text-muted-foreground">
          {earned.size} / {badges.length}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {badges.map((b, i) => {
          const has = earned.has(b.id)
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                'relative overflow-hidden rounded-lg border p-4',
                has
                  ? 'border-accent/50 bg-accent/10 shadow-glow'
                  : 'border-border bg-secondary/20 opacity-70'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'grid h-12 w-12 shrink-0 place-items-center rounded-lg text-2xl',
                    has ? 'bg-accent/20' : 'bg-muted blur-[1px]'
                  )}
                >
                  {has ? b.icon : <Lock className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div className="min-w-0">
                  <div
                    className={cn(
                      'font-display font-semibold',
                      has ? 'text-accent-foreground' : 'text-muted-foreground blur-[0.5px]'
                    )}
                  >
                    {b.name}
                  </div>
                  <p
                    className={cn(
                      'mt-1 text-xs',
                      has ? 'text-muted-foreground' : 'text-muted-foreground/70 blur-[0.5px]'
                    )}
                  >
                    {b.description}
                  </p>
                </div>
              </div>
              {has && (
                <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-accent/20 blur-2xl" />
              )}
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
