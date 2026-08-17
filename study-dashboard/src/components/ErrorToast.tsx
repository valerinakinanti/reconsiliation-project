import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '@/store/useStore'

export function ErrorToast() {
  const error = useStore((s) => s.error)
  const dismiss = useStore((s) => s.dismissError)

  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-start gap-3 rounded-card border border-status-needs-self-study bg-paper-raised p-4 shadow-lg sm:inset-x-auto sm:right-4"
        >
          <p className="flex-1 text-sm text-ink">{error}</p>
          <button
            type="button"
            onClick={dismiss}
            className="text-sm font-medium text-status-needs-self-study"
            aria-label="Dismiss"
          >
            Dismiss
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
