import { motion } from 'framer-motion'
import { quests } from '@/lib/content'
import { questStatus } from '@/lib/unlock'
import { useStats } from '@/store/useGameStore'
import { cn } from '@/lib/utils'
import QuestNode from './QuestNode'

type GameMapProps = {
  onPick: (questId: string) => void
}

export default function GameMap({ onPick }: GameMapProps) {
  const { completedQuestIds } = useStats()
  const nodes = quests.map((q) => ({
    quest: q,
    status: questStatus(q, completedQuestIds),
    done: completedQuestIds.includes(q.id),
  }))
  const total = nodes.length || 1
  const doneCount = nodes.filter((n) => n.done).length
  const progressPct = Math.round((doneCount / total) * 100)

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <header className="mb-10 flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary/80">
          Quest Map · 新手村地图
        </span>
        <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          选择你的下一关
        </h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          沿青色光路前进。已通关的节点变亮发绿；Boss 关以紫红色标记，难度更高、奖励更丰厚。
        </p>
      </header>

      <div className="relative overflow-x-auto pb-4">
        <motion.ol
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="relative flex flex-col items-stretch gap-12 py-6 sm:flex-row sm:items-start sm:gap-0 sm:px-4"
        >
          <Connector progressPct={progressPct} />
          {nodes.map(({ quest, status }, i) => (
            <li
              key={quest.id}
              className="relative z-10 flex items-center justify-center sm:pr-12 sm:last:pr-0"
            >
              <QuestNode quest={quest} status={status} index={i} onClick={() => onPick(quest.id)} />
            </li>
          ))}
        </motion.ol>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] text-muted-foreground">
        <Legend className="bg-primary" label="可进入" />
        <Legend className="bg-emerald-400" label="已完成" />
        <Legend className="bg-muted-foreground/50" label="未解锁" />
        <Legend className="bg-accent" label="Boss" />
      </div>
    </section>
  )
}

function Connector({ progressPct }: { progressPct: number }) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <span className="absolute left-8 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent sm:left-0 sm:top-1/2 sm:h-px sm:w-full sm:translate-x-0 sm:bg-gradient-to-r sm:from-primary/15 sm:via-primary/35 sm:to-accent/30" />
      <span
        className="absolute left-8 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-emerald-400/70 via-primary/50 to-transparent sm:left-0 sm:top-1/2 sm:h-px sm:w-full sm:translate-x-0 sm:bg-gradient-to-r sm:from-emerald-400/70 sm:via-primary/60 sm:to-primary/40"
        style={{ clipPath: `inset(0 ${100 - progressPct}% 0 0)` }}
      />
    </span>
  )
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('h-2 w-2 rounded-full', className)} />
      {label}
    </span>
  )
}
