import { motion } from 'framer-motion'
import { Upload, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PdfUploadStub() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border bg-card/40 p-6 backdrop-blur-sm',
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/60 text-muted-foreground">
          <Upload className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold text-foreground">上传你自己的 PDF</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            未来你将能把任意技术 PDF 转成游戏关卡。当前仅支持预置 Ascend C 文档。
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled
        aria-disabled="true"
        className={cn(
          'group inline-flex shrink-0 cursor-not-allowed items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-2.5',
          'font-display text-sm font-medium text-muted-foreground opacity-70'
        )}
      >
        <Lock className="h-4 w-4" />
        Demo 版仅支持预置文档
      </button>
    </motion.section>
  )
}
