import { motion } from 'framer-motion'
import type { Session } from '@/types'
import { computeSessionStatus } from '@/lib/statusLogic'
import { StatusBadge } from '@/components/StatusBadge'
import { TrackerCheckbox } from '@/components/TrackerCheckbox'
import { ConfidenceScale } from '@/components/ConfidenceScale'
import { EditableText } from '@/components/EditableText'
import { formatDate } from '@/lib/format'
import { useStore } from '@/store/useStore'

export function SessionCard({ courseId, session }: { courseId: string; session: Session }) {
  const updateSession = useStore((s) => s.updateSession)
  const removeSession = useStore((s) => s.removeSession)
  const status = computeSessionStatus(session)

  const patch = (p: Partial<Session>) => updateSession(courseId, session.id, p)

  return (
    <motion.div layout className="rounded-card border border-line bg-paper-raised p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <input
            type="date"
            value={session.date}
            onChange={(e) => patch({ date: e.target.value })}
            className="min-h-9 shrink-0 rounded border border-line-strong bg-paper px-2 font-data text-xs text-ink"
          />
          <EditableText
            value={session.topic}
            onCommit={(v) => patch({ topic: v })}
            placeholder="Session topic"
            className="min-w-0 truncate font-display text-base font-semibold text-ink"
          />
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          <button
            type="button"
            aria-label="Delete session"
            onClick={() => removeSession(courseId, session.id)}
            className="rounded-full p-1.5 text-ink-faint hover:bg-status-needs-self-study-tint hover:text-status-needs-self-study"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path d="M8 2a1 1 0 00-1 1v1H4a1 1 0 000 2h12a1 1 0 100-2h-3V3a1 1 0 00-1-1H8zM5 7l.6 9.6A2 2 0 007.6 18h4.8a2 2 0 002-1.4L15 7H5z" />
            </svg>
          </button>
        </div>
      </div>

      <p className="mb-2 text-xs text-ink-faint">{formatDate(session.date)}</p>

      <TrackerCheckbox label="Attended" checked={session.attended} onChange={(v) => patch({ attended: v })} />

      <div className="mt-2 flex items-center justify-between gap-3 border-t border-line pt-3">
        <span className="text-xs font-medium text-ink-soft">Confidence</span>
        <ConfidenceScale value={session.confidence} onChange={(v) => patch({ confidence: v })} size="sm" />
      </div>

      <div className="mt-3">
        <label className="text-xs font-medium text-ink-soft">
          Notes
          <textarea
            value={session.notes}
            onChange={(e) => patch({ notes: e.target.value })}
            placeholder="Anything worth remembering about this session…"
            rows={2}
            className="mt-1 w-full resize-y rounded-md border border-line-strong bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brand"
          />
        </label>
      </div>
    </motion.div>
  )
}
