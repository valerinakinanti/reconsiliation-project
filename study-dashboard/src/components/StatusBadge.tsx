import { motion } from 'framer-motion'
import type { ChapterStatus } from '@/types'
import { STATUS_THEME } from '@/lib/statusTheme'

export function StatusBadge({ status, className = '' }: { status: ChapterStatus; className?: string }) {
  const theme = STATUS_THEME[status]
  return (
    <motion.span
      layout
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${theme.bg} ${theme.text} ${theme.border} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} aria-hidden />
      {theme.label}
    </motion.span>
  )
}
