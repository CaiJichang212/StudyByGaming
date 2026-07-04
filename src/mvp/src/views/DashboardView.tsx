import { useStats } from '@/store/useGameStore'
import { DashboardScreen } from '@/components/dashboard/DashboardScreen'

export function DashboardView() {
  const stats = useStats()
  return <DashboardScreen stats={stats} />
}
