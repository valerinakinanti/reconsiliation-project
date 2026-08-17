import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Course } from '@/types'
import { courseCompletionPercent, courseStatus, deadlineUrgency, nextUpcomingDeadline } from '@/lib/statusLogic'
import { StatusBadge } from '@/components/StatusBadge'
import { ProgressBar } from '@/components/ProgressBar'
import { daysUntilLabel } from '@/lib/format'
import { URGENCY_THEME } from '@/lib/statusTheme'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useStore } from '@/store/useStore'

export function CourseCard({ course }: { course: Course }) {
  const navigate = useNavigate()
  const removeCourse = useStore((s) => s.removeCourse)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const status = courseStatus(course)
  const completion = courseCompletionPercent(course)
  const nextDeadline = nextUpcomingDeadline(course.deadlines)
  const itemCount = course.format === 'chapter-based' ? course.weeks.flatMap((w) => w.chapters).length : course.sessions.length

  return (
    <>
      <div
        role="link"
        tabIndex={0}
        onClick={() => navigate(`/course/${course.id}`)}
        onKeyDown={(e) => e.key === 'Enter' && navigate(`/course/${course.id}`)}
        className="group relative flex cursor-pointer flex-col gap-3 rounded-card border border-line bg-paper-raised p-4 shadow-sm transition-shadow hover:shadow-md"
        style={{ borderTopColor: course.color, borderTopWidth: '3px' }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-semibold text-ink">{course.name}</h3>
            <p className="text-xs uppercase tracking-wide text-ink-faint">
              {course.format === 'chapter-based' ? 'Chapter-based' : 'Class-based'} &middot; {itemCount}{' '}
              {course.format === 'chapter-based' ? 'chapters' : 'sessions'}
            </p>
          </div>
          <button
            type="button"
            aria-label={`Delete ${course.name}`}
            onClick={(e) => {
              e.stopPropagation()
              setConfirmDelete(true)
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-faint opacity-0 transition-opacity hover:bg-status-needs-self-study-tint hover:text-status-needs-self-study group-hover:opacity-100 focus-visible:opacity-100"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path d="M8 2a1 1 0 00-1 1v1H4a1 1 0 000 2h12a1 1 0 100-2h-3V3a1 1 0 00-1-1H8zM5 7l.6 9.6A2 2 0 007.6 18h4.8a2 2 0 002-1.4L15 7H5z" />
            </svg>
          </button>
        </div>

        {status ? <StatusBadge status={status} /> : <span className="text-xs text-ink-faint">No items tracked yet</span>}

        <div>
          <div className="mb-1 flex items-baseline justify-between text-xs">
            <span className="text-ink-soft">Completion</span>
            <span className="font-data font-medium text-ink">{Math.round(completion)}%</span>
          </div>
          <ProgressBar percent={completion} color={course.color} />
        </div>

        <div className="mt-auto border-t border-line pt-2.5 text-xs">
          {nextDeadline ? (
            <div className="flex items-center justify-between">
              <span className="truncate text-ink-soft">{nextDeadline.title}</span>
              <span className={`shrink-0 font-data font-medium ${URGENCY_THEME[deadlineUrgency(nextDeadline.dueDate).urgency].text}`}>
                {daysUntilLabel(deadlineUrgency(nextDeadline.dueDate).daysUntil)}
              </span>
            </div>
          ) : (
            <span className="text-ink-faint">No upcoming deadlines</span>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete ${course.name}?`}
        description="This removes the course and everything in it — weeks, chapters, sessions, deadlines. This can't be undone."
        confirmLabel="Delete course"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false)
          void removeCourse(course.id)
        }}
      />
    </>
  )
}
