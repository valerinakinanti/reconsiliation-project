import { motion } from 'framer-motion'

export function ProgressBar({ percent, color }: { percent: number; color?: string }) {
  const clamped = Math.max(0, Math.min(100, percent))
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-paper-sunken">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color ?? 'var(--color-brand)' }}
        initial={false}
        animate={{ width: `${clamped}%` }}
        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      />
    </div>
  )
}
