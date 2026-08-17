import { AnimatePresence, motion } from 'framer-motion'

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  danger = false,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-sm rounded-card border border-line bg-paper-raised p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="confirm-dialog-title" className="font-display text-lg font-semibold text-ink">
              {title}
            </h2>
            <p className="mt-2 text-sm text-ink-soft">{description}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="min-h-11 rounded-md border border-line-strong px-4 text-sm font-medium text-ink-soft hover:bg-paper-sunken"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`min-h-11 rounded-md px-4 text-sm font-medium text-paper-raised ${
                  danger ? 'bg-status-needs-self-study hover:opacity-90' : 'bg-brand hover:opacity-90'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
