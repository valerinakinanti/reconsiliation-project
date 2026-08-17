import { Link } from 'react-router-dom'
import type { Course } from '@/types'
import { allDeadlinesSorted, deadlineUrgency } from '@/lib/statusLogic'
import { URGENCY_THEME } from '@/lib/statusTheme'
import { daysUntilLabel, formatDateShort } from '@/lib/format'

export function DeadlinesRail({ courses }: { courses: Course[] }) {
  const withCourse = courses.flatMap((c) => c.deadlines.map((d) => ({ ...d, courseName: c.name, courseColor: c.color })))
  const sorted = allDeadlinesSorted(withCourse)

  if (sorted.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-line-strong bg-paper-raised/50 p-5 text-center text-sm text-ink-faint">
        No deadlines yet. Add project or soft deadlines from a course page.
      </div>
    )
  }

  return (
    <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
      {sorted.map((d) => {
        const { urgency, daysUntil } = deadlineUrgency(d.dueDate)
        const theme = URGENCY_THEME[urgency]
        return (
          <Link
            key={d.id}
            to={`/course/${d.courseId}`}
            className={`flex w-56 shrink-0 snap-start flex-col gap-1.5 rounded-card border bg-paper-raised p-3.5 shadow-sm transition-transform hover:-translate-y-0.5 ${theme.border}`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  d.kind === 'project' ? 'bg-ink text-paper-raised' : 'border border-line-strong text-ink-soft'
                }`}
              >
                {d.kind === 'project' ? 'Project' : 'Soft'}
              </span>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.courseColor }} aria-hidden />
            </div>
            <p className="truncate text-sm font-medium text-ink">{d.title}</p>
            <p className="truncate text-xs text-ink-faint">{d.courseName}</p>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="font-data text-ink-soft">{formatDateShort(d.dueDate)}</span>
              <span className={`font-data font-medium ${theme.text}`}>{daysUntilLabel(daysUntil)}</span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
