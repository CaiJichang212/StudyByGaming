import { motion } from 'framer-motion'
import type { KnowledgeCard } from '@/types/content'
import { cn } from '@/lib/utils'

type Props = {
  card: KnowledgeCard
  index: number
}

export default function KnowledgeCard({ card, index }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
      className={cn(
        'relative bg-card border border-border rounded-xl p-5 pl-6',
        'overflow-hidden'
      )}
    >
      <span
        aria-hidden
        className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary to-primary/30"
      />
      <h3 className="font-display text-base font-semibold text-foreground">
        {card.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-[6]">
        {card.body}
      </p>
    </motion.article>
  )
}
