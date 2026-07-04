import { create } from 'zustand'
import { readEvents, appendEvent, clearEvents } from '@/lib/events'
import { deriveStats } from '@/lib/analytics'

export type View = 'landing' | 'quest' | 'boss' | 'dashboard'

type GameState = {
  view: View
  activeQuestId: string | null
  tick: number
  goLanding: () => void
  goQuest: (questId: string) => void
  goBoss: () => void
  goDashboard: () => void
  setActiveQuest: (questId: string | null) => void
  bump: () => void
  resetProgress: () => void
}

export const useGameStore = create<GameState>((set) => ({
  view: 'landing',
  activeQuestId: null,
  tick: 0,
  goLanding: () => set({ view: 'landing', activeQuestId: null }),
  goQuest: (questId) => {
    const events = readEvents()
    const started = events.some(
      (e) => e.eventType === 'quest_started' && e.questId === questId
    )
    if (!started) {
      appendEvent({ eventType: 'quest_started', questId })
    }
    set({ view: 'quest', activeQuestId: questId })
  },
  goBoss: () => set({ view: 'boss' }),
  goDashboard: () => set({ view: 'dashboard' }),
  setActiveQuest: (questId) => set({ activeQuestId: questId }),
  bump: () => set((s) => ({ tick: s.tick + 1 })),
  resetProgress: () => {
    clearEvents()
    set({ view: 'landing', activeQuestId: null, tick: 0 })
  },
}))

export function useStats() {
  useGameStore((s) => s.tick)
  return deriveStats(readEvents())
}
