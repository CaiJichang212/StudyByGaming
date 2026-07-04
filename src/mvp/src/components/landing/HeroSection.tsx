import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { contentPack } from '@/lib/content'
import { cn } from '@/lib/utils'

type HeroSectionProps = {
  onEnter?: () => void
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
}

export default function HeroSection({ onEnter }: HeroSectionProps) {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(var(--primary)/0.18),transparent_70%)]" />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-[12%] top-[26%] h-2 w-2 rounded-full bg-primary/70 blur-[1px]"
        animate={{ y: [0, -18, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-[16%] top-[34%] h-1.5 w-1.5 rounded-full bg-accent/70 blur-[1px]"
        animate={{ y: [0, 14, 0], opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-[28%] top-[18%] h-1 w-1 rounded-full bg-primary/60"
        animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto flex min-h-[88svh] w-full max-w-3xl flex-col items-start justify-center px-6 py-24"
      >
        <motion.span
          variants={item}
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-xs tracking-wide text-primary/90"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-glow" />
          CANN 社区版 8.5.0 · Ascend C
        </motion.span>

        <motion.h1
          variants={item}
          className="mt-6 font-display text-6xl font-bold leading-[1.02] tracking-tight text-glow sm:text-7xl"
        >
          Study by Gaming
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-4 max-w-xl font-display text-xl text-foreground/90 sm:text-2xl"
        >
          把 2517 页技术文档变成 5 分钟一关的学习游戏
        </motion.p>

        <motion.p variants={item} className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
          {contentPack.title} · 预计 {contentPack.estimatedMinutes} 分钟。从「这是什么」到「跑通
          HelloWorld」，再到「写一个 Add 算子」，循序渐进，每一关只学一件事。
        </motion.p>

        <motion.div variants={item} className="mt-9 flex items-center gap-4">
          <button
            type="button"
            onClick={onEnter}
            className={cn(
              'group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-display text-base font-semibold text-primary-foreground',
              'shadow-glow transition-all hover:scale-[1.03] hover:shadow-glow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          >
            进入新手村
            <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </button>
          <span className="font-mono text-xs text-muted-foreground">
            {contentPack.totalPages.toLocaleString()} 页 · {contentPack.sourceVersion}
          </span>
        </motion.div>
      </motion.div>
    </section>
  )
}
