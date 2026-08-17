import { motion } from 'framer-motion'

const LABELS = ['Lost', 'Shaky', 'Okay', 'Solid', 'Nailed it']

export function ConfidenceScale({
  value,
  onChange,
  size = 'md',
}: {
  value: 1 | 2 | 3 | 4 | 5
  onChange: (value: 1 | 2 | 3 | 4 | 5) => void
  size?: 'sm' | 'md'
}) {
  const dims = size === 'sm' ? 'h-7 w-7 text-xs' : 'h-9 w-9 text-sm'
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1" role="radiogroup" aria-label="Confidence, 1 to 5">
        {([1, 2, 3, 4, 5] as const).map((n) => {
          const active = n <= value
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={n === value}
              aria-label={`${n} — ${LABELS[n - 1]}`}
              onClick={() => onChange(n)}
              className={`flex ${dims} items-center justify-center rounded-md border font-data transition-colors ${
                active
                  ? 'border-brand bg-brand text-paper-raised'
                  : 'border-line-strong bg-paper-raised text-ink-faint hover:border-brand-soft hover:text-brand-soft'
              }`}
            >
              <motion.span whileTap={{ scale: 0.85 }}>{n}</motion.span>
            </button>
          )
        })}
      </div>
      <span className="hidden text-xs text-ink-soft sm:inline">{LABELS[value - 1]}</span>
    </div>
  )
}
