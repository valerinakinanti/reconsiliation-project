import { useState } from 'react'
import type { Deadline, DeadlineKind } from '@/types'
import { useStore } from '@/store/useStore'
import { deadlineUrgency } from '@/lib/statusLogic'
import { URGENCY_THEME } from '@/lib/statusTheme'
import { daysUntilLabel } from '@/lib/format'
import { EditableText } from '@/components/EditableText'
import { todayIso } from '@/lib/format'

function DeadlineRow({ courseId, deadline }: { courseId: string; deadline: Deadline }) {
  const updateDeadline = useStore((s) => s.updateDeadline)
  const removeDeadline = useStore((s) => s.removeDeadline)
  const { urgency, daysUntil } = deadlineUrgency(deadline.dueDate)
  const theme = URGENCY_THEME[urgency]

  const deleteButton = (extraClass: string) => (
    <button
      type="button"
      aria-label={`Delete ${deadline.title}`}
      onClick={() => removeDeadline(courseId, deadline.id)}
      className={`shrink-0 rounded-full p-1.5 text-ink-faint hover:bg-status-needs-self-study-tint hover:text-status-needs-self-study ${extraClass}`}
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
        <path d="M8 2a1 1 0 00-1 1v1H4a1 1 0 000 2h12a1 1 0 100-2h-3V3a1 1 0 00-1-1H8zM5 7l.6 9.6A2 2 0 007.6 18h4.8a2 2 0 002-1.4L15 7H5z" />
      </svg>
    </button>
  )

  return (
    <div className={`flex flex-col gap-2 rounded-md border-l-4 bg-paper px-3 py-2.5 sm:flex-row sm:items-center sm:gap-2.5 ${theme.border}`}>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => updateDeadline(courseId, deadline.id, { kind: deadline.kind === 'project' ? 'soft' : 'project' })}
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            deadline.kind === 'project' ? 'bg-ink text-paper-raised' : 'border border-line-strong text-ink-soft'
          }`}
          title="Toggle project / soft deadline"
        >
          {deadline.kind === 'project' ? 'Project' : 'Soft'}
        </button>

        <EditableText
          value={deadline.title}
          onCommit={(v) => updateDeadline(courseId, deadline.id, { title: v })}
          className="min-w-0 flex-1 truncate text-sm font-medium text-ink"
        />

        {deleteButton('sm:hidden')}
      </div>

      <div className="flex items-center gap-2.5 sm:ml-auto">
        <input
          type="date"
          value={deadline.dueDate}
          onChange={(e) => updateDeadline(courseId, deadline.id, { dueDate: e.target.value })}
          className="min-h-9 shrink-0 rounded border border-line-strong bg-paper-raised px-2 font-data text-xs text-ink"
        />

        <span className={`shrink-0 font-data text-xs font-medium ${theme.text}`}>{daysUntilLabel(daysUntil)}</span>

        {deleteButton('hidden sm:inline-flex')}
      </div>
    </div>
  )
}

export function CourseDeadlines({ courseId, deadlines }: { courseId: string; deadlines: Deadline[] }) {
  const addDeadline = useStore((s) => s.addDeadline)
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState(todayIso())
  const [kind, setKind] = useState<DeadlineKind>('project')

  const sorted = [...deadlines].sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((d) => (
        <DeadlineRow key={d.id} courseId={courseId} deadline={d} />
      ))}

      {adding ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!title.trim()) return
            void addDeadline(courseId, title.trim(), dueDate, kind)
            setTitle('')
            setAdding(false)
          }}
          className="flex flex-wrap items-center gap-2 rounded-md border border-brand bg-paper px-3 py-2.5"
        >
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Deadline title"
            className="min-h-9 min-w-0 flex-1 rounded border border-line-strong bg-paper-raised px-2 text-sm text-ink outline-none focus:border-brand"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="min-h-9 rounded border border-line-strong bg-paper-raised px-2 font-data text-xs text-ink"
          />
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as DeadlineKind)}
            className="min-h-9 rounded border border-line-strong bg-paper-raised px-2 text-xs text-ink"
          >
            <option value="project">Project</option>
            <option value="soft">Soft</option>
          </select>
          <button type="submit" className="min-h-9 rounded bg-brand px-3 text-xs font-medium text-paper-raised">
            Add
          </button>
          <button type="button" onClick={() => setAdding(false)} className="min-h-9 rounded px-2 text-xs text-ink-soft">
            Cancel
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="min-h-10 self-start rounded-md border border-dashed border-line-strong px-3 text-xs font-medium text-ink-soft hover:border-brand hover:text-brand"
        >
          + Add deadline
        </button>
      )}
    </div>
  )
}
