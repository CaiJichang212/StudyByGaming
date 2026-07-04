import { motion } from 'framer-motion'
import { Zap, Trophy } from 'lucide-react'
import { useStats, useGameStore } from '@/store/useGameStore'
import { cn } from '@/lib/utils'
import HeroSection from '@/components/landing/HeroSection'
import PdfUploadStub from '@/components/landing/PdfUploadStub'
import GameMap from '@/components/map/GameMap'

export default function LandingView() {
  const { totalXp, level, xpIntoLevel, xpForNextLevel, progressRatio, completedQuestIds } = useStats()
  const goQuest = useGameStore((s) => s.goQuest)
  const goDashboard = useGameStore((s) => s.goDashboard)
  const goBoss = useGameStore((s) => s.goBoss)
  const goToMap = () => {
    document.getElementById('quest-map')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const levelPct = Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100))
  const R = 30
  const C = 2 * Math.PI * R

  return (
    <div className="w-full">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-end gap-2 px-6 pt-5">
        <button
          type="button"
          onClick={goDashboard}
          className="rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur transition hover:border-primary/50 hover:text-primary"
        >
          学习仪表盘
        </button>
        <button
          type="button"
          onClick={goBoss}
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs text-destructive backdrop-blur transition hover:bg-destructive/20"
        >
          🐲 Boss 战
        </button>
      </nav>
      <HeroSection onEnter={goToMap} />

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto -mt-8 w-full max-w-5xl px-6"
      >
        <div className="flex flex-col items-stretch gap-4 rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-md sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0">
              <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
                <circle cx="36" cy="36" r={R} fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                <circle
                  cx="36"
                  cy="36"
                  r={R}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C - (C * Math.min(100, progressRatio * 100)) / 100}
                  className="drop-shadow-[0_0_6px_hsl(var(--primary)/0.7)]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-base font-bold leading-none text-foreground">
                  {Math.round(progressRatio * 100)}%
                </span>
                <span className="font-mono text-[9px] text-muted-foreground">通关</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary/80">
                进度概览
              </span>
              <span className="font-display text-lg font-semibold text-foreground">
                已完成 {completedQuestIds.length} / 共 6 关
              </span>
            </div>
          </div>

          <div className="hidden h-12 w-px bg-border sm:block" />

          <div className="flex flex-1 flex-col gap-1.5">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Zap className="h-3.5 w-3.5 text-primary" />
                总 XP <span className="font-semibold text-foreground">{totalXp}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Trophy className="h-3.5 w-3.5 text-accent" />
                Lv <span className="font-semibold text-foreground">{level}</span>
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-cyan-300 shadow-glow"
                initial={{ width: 0 }}
                animate={{ width: `${levelPct}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">
              本级 {xpIntoLevel} / {xpForNextLevel} XP
            </span>
          </div>
        </div>
      </motion.section>

      <div id="quest-map">
        <GameMap onPick={goQuest} />
      </div>

      <div className="mx-auto w-full max-w-5xl px-6 pb-20">
        <PdfUploadStub />
      </div>
    </div>
  )
}
