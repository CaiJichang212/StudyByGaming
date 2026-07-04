import { useEffect, useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import { Zap } from 'lucide-react'
import type { LearningStats } from '@/types/events'

type Props = { stats: LearningStats }

const SIZE = 160
const STROKE = 12
const R = (SIZE - STROKE) / 2
const C = 2 * Math.PI * R

export function ProgressOverview({ stats }: Props) {
  const ratio = Math.max(0, Math.min(1, stats.progressRatio))
  const offset = C * (1 - ratio)

  const xp = useAnimatedNumber(stats.totalXp)
  const level = useAnimatedNumber(stats.level)

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} className="-rotate-90">
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={STROKE}
            />
            <motion.circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl font-bold text-glow text-primary">
              {Math.round(ratio * 100)}%
            </span>
            <span className="text-xs text-muted-foreground">关卡进度</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <motion.span
              key={xp}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-4xl font-bold"
            >
              {xp.toLocaleString()}
            </motion.span>
            <span className="text-muted-foreground">总 XP</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">
              Lv. <span className="font-semibold text-primary">{level}</span>
            </span>
            <div className="flex-1">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>距下一级</span>
                <span>
                  {stats.xpIntoLevel} / {stats.xpForNextLevel}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(stats.xpIntoLevel / stats.xpForNextLevel) * 100}%`,
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <Stat label="关卡" value={`${stats.completedQuestIds.length}/${stats.totalQuests}`} />
            <Stat label="答题" value={stats.submittedCount} />
            <Stat label="正确率" value={`${Math.round(stats.accuracy * 100)}%`} />
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 px-2 py-2">
      <div className="font-display text-lg font-semibold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

function useAnimatedNumber(target: number) {
  const mv = useMotionValue(target)
  const [val, setVal] = useState(target)
  useEffect(() => {
    const controls = animate(mv, target, {
      duration: 0.8,
      ease: 'easeOut',
      onUpdate: (v) => setVal(Math.round(v)),
    })
    return () => controls.stop()
  }, [target, mv])
  return val
}
