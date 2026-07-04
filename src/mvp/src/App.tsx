import { useGameStore } from '@/store/useGameStore'
import LandingView from '@/views/LandingView'
import { DashboardView } from '@/views/DashboardView'
import { BossView } from '@/views/BossView'
import QuestView from '@/views/QuestView'

export default function App() {
  const view = useGameStore((s) => s.view)
  const activeQuestId = useGameStore((s) => s.activeQuestId)

  if (view === 'dashboard') return <DashboardView />
  if (view === 'boss') return <BossView />
  if (view === 'quest' && activeQuestId) return <QuestView questId={activeQuestId} />
  return <LandingView />
}
