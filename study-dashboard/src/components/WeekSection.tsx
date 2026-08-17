import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Week } from '@/types'
import { weekCompletionPercent, weekStatus } from '@/lib/statusLogic'
import { StatusBadge } from '@/components/StatusBadge'
import { ChapterCard } from '@/components/ChapterCard'
import { EditableText } from '@/components/EditableText'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useStore } from '@/store/useStore'

export function WeekSection({ courseId, week, defaultOpen = false }: { courseId: string; week: Week; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const addChapter = useStore((s) => s.addChapter)
  const updateWeek = useStore((s) => s.updateWeek)
  const removeWeek = useStore((s) => s.removeWeek)

  const status = weekStatus(week)
  const completion = weekCompletionPercent(week)

  return (
    <div className="overflow-hidden rounded-card border border-line bg-paper-raised shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-14 w-full flex-wrap items-center gap-2.5 px-4 py-3 text-left"
      >
        <motion.svg
          animate={{ rotate: open ? 90 : 0 }}
          viewBox="0 0 20 20"
          className="h-4 w-4 shrink-0 text-ink-faint"
          fill="currentColor"
        >
          <path d="M7 5l6 5-6 5V5z" />
        </motion.svg>
        <span className="shrink-0 font-data text-xs font-semibold text-ink-faint">W{week.weekNumber}</span>
        <span
          onClick={(e) => e.stopPropagation()}
          className="min-w-0 flex-1"
        >
          <EditableText
            value={week.label ?? ''}
            onCommit={(v) => updateWeek(courseId, week.id, { label: v })}
            placeholder={`Week ${week.weekNumber}`}
            className="truncate font-display text-sm font-semibold text-ink sm:text-base"
          />
        </span>
        {status && <StatusBadge status={status} />}
        <span className="ml-auto shrink-0 font-data text-xs text-ink-soft">{Math.round(completion)}%</span>
        <button
          type="button"
          aria-label={`Delete week ${week.weekNumber}`}
          onClick={(e) => {
            e.stopPropagation()
            setConfirmDelete(true)
          }}
          className="shrink-0 rounded-full p-1.5 text-ink-faint hover:bg-status-needs-self-study-tint hover:text-status-needs-self-study"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
            <path d="M8 2a1 1 0 00-1 1v1H4a1 1 0 000 2h12a1 1 0 100-2h-3V3a1 1 0 00-1-1H8zM5 7l.6 9.6A2 2 0 007.6 18h4.8a2 2 0 002-1.4L15 7H5z" />
          </svg>
        </button>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 border-t border-line p-4">
              {week.chapters.map((chapter) => (
                <ChapterCard key={chapter.id} courseId={courseId} weekId={week.id} chapter={chapter} />
              ))}
              <button
                type="button"
                onClick={() => void addChapter(courseId, week.id, `Chapter ${week.chapters.length + 1}`)}
                className="min-h-11 rounded-md border border-dashed border-line-strong text-xs font-medium text-ink-soft hover:border-brand hover:text-brand"
              >
                + Add chapter
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete week ${week.weekNumber}?`}
        description="This removes the week and every chapter in it. This can't be undone."
        confirmLabel="Delete week"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false)
          void removeWeek(courseId, week.id)
        }}
      />
    </div>
  )
}
