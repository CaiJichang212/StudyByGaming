import QuestScreen from '@/components/quest/QuestScreen'
import { getQuest } from '@/lib/content'

type Props = { questId: string }

export default function QuestView({ questId }: Props) {
  const quest = getQuest(questId)
  if (!quest) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
        找不到关卡：{questId}
      </div>
    )
  }
  return <QuestScreen quest={quest} />
}
