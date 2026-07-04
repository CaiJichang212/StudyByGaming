import { motion } from 'framer-motion'
import { Check, Lock } from 'lucide-react'
import type { Quest } from '@/types/content'
import { cn } from '@/lib/utils'

export type QuestNodeStatus = 'locked' | 'available' | 'completed'

type QuestNodeProps = {
  quest: Quest
  status: QuestNodeStatus
  index: number
  onClick?: () => void
}

export default function QuestNode({ quest, status, index, onClick }: QuestNodeProps) {
  const interactive = status !== 'locked'
  const isBoss = Boolean(quest.isBoss)

  return (
    <motion.button
      type="button"
      onClick={interactive ? onClick : undefined}
      disabled={!interactive}
      aria-label={`关卡 ${quest.order + 1}：${quest.title} —— ${
        status === 'locked' ? '未解锁' : status === 'completed' ? '已完成' : '可进入'
      }`}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: index * 0.06 }}
      whileHover={interactive ? { scale: 1.05 } : undefined}
      whileTap={interactive ? { scale: 0.97 } : undefined}
      className={cn(
        'group flex w-28 shrink-0 cursor-default flex-col items-center gap-3 text-center outline-none sm:w-32',
        interactive && 'cursor-pointer'
      )}
    >
      <span className="relative flex items-center justify-center">
        <span
          className={cn(
            'relative flex items-center justify-center rounded-2xl border transition-all duration-300',
            isBoss ? 'h-20 w-20' : 'h-16 w-16',
            status === 'completed' &&
              'border-emerald-400/60 bg-emerald-500/15 text-emerald-300 shadow-[0_0_24px_-4px_hsl(152_76%_60%/0.6)]',
            status === 'available' &&
              (isBoss
                ? 'border-accent/60 bg-accent/10 text-accent shadow-[0_0_24px_-4px_hsl(var(--accent)/0.6)]'
                : 'border-primary/60 bg-primary/10 text-primary shadow-glow'),
            status === 'locked' && 'border-border bg-muted/40 text-muted-foreground/60'
          )}
        >
          {status === 'available' && (
            <motion.span
              aria-hidden
              className={cn(
                'absolute inset-0 rounded-2xl border',
                isBoss ? 'border-accent/40' : 'border-primary/40'
              )}
              animate={{ scale: [1, 1.25], opacity: [0.7, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            />
          )}

          {status === 'locked' ? (
            <Lock className={cn(isBoss ? 'h-7 w-7' : 'h-5 w-5')} />
          ) : status === 'completed' ? (
            <Check className={cn(isBoss ? 'h-8 w-8' : 'h-6 w-6')} strokeWidth={3} />
          ) : (
            <span className={cn('leading-none', isBoss ? 'text-4xl' : 'text-3xl')}>{quest.icon}</span>
          )}
        </span>

        <span
          className={cn(
            'absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border font-mono text-[11px] font-semibold',
            status === 'locked'
              ? 'border-border bg-muted text-muted-foreground/70'
              : status === 'completed'
                ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-200'
                : 'border-primary/50 bg-primary/20 text-primary'
          )}
        >
          {quest.order + 1}
        </span>
      </span>

      <span className="flex flex-col gap-0.5">
        <span
          className={cn(
            'font-display text-sm font-semibold leading-tight',
            status === 'locked' ? 'text-muted-foreground/70' : 'text-foreground'
          )}
 >
          {quest.title}
        </span>
        <span
          className={cn(
            'text-xs leading-tight',
            status === 'locked' ? 'text-muted-foreground/50' : 'text-muted-foreground'
          )}
        >
          {quest.subtitle}
        </span>
        {interactive && (
          <span
            className={cn(
              'mt-0.5 font-mono text-[10px]',
              status === 'completed' ? 'text-emerald-400/80' : isBoss ? 'text-accent/80' : 'text-primary/80'
            )}
          >
            +{quest.rewardXp} XP
          </span>
        )}
      </span>
    </motion.button>
  )
}
