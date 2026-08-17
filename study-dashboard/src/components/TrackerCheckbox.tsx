import { motion, AnimatePresence } from 'framer-motion'

export function TrackerCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-11 items-center gap-2.5 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-paper-sunken/60"
    >
      <span
        className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
          checked ? 'border-status-safe bg-status-safe' : 'border-line-strong bg-paper-raised'
        }`}
      >
        <AnimatePresence>
          {checked && (
            <motion.svg
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5 text-paper-raised"
              fill="none"
            >
              <path d="M3 8.5L6.2 11.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          )}
        </AnimatePresence>
      </span>
      <span className={`text-sm ${checked ? 'text-ink' : 'text-ink-soft'}`}>{label}</span>
    </button>
  )
}
