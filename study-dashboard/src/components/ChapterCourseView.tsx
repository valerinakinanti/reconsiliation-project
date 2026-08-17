import type { Course } from '@/types'
import { WeekSection } from '@/components/WeekSection'
import { useStore } from '@/store/useStore'

export function ChapterCourseView({ course }: { course: Course }) {
  const addWeek = useStore((s) => s.addWeek)
  const weeks = [...course.weeks].sort((a, b) => a.weekNumber - b.weekNumber)
  const nextWeekNumber = weeks.length ? Math.max(...weeks.map((w) => w.weekNumber)) + 1 : 1

  return (
    <section>
      <h2 className="mb-2 font-display text-lg font-semibold text-ink">Weeks</h2>
      <div className="flex flex-col gap-3">
        {weeks.map((week, i) => (
          <WeekSection key={week.id} courseId={course.id} week={week} defaultOpen={i === weeks.length - 1} />
        ))}
        {weeks.length === 0 && (
          <p className="rounded-card border border-dashed border-line-strong bg-paper-raised/40 p-6 text-center text-sm text-ink-faint">
            No weeks yet. Add your first week to start tracking chapters.
          </p>
        )}
        <button
          type="button"
          onClick={() => void addWeek(course.id, nextWeekNumber, null)}
          className="min-h-11 rounded-md border border-dashed border-line-strong text-sm font-medium text-ink-soft hover:border-brand hover:text-brand"
        >
          + Add week {nextWeekNumber}
        </button>
      </div>
    </section>
  )
}
