import type { Course } from '@/types'
import { SessionCard } from '@/components/SessionCard'
import { useStore } from '@/store/useStore'
import { todayIso } from '@/lib/format'

export function ClassCourseView({ course }: { course: Course }) {
  const addSession = useStore((s) => s.addSession)
  const sessions = [...course.sessions].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <section>
      <h2 className="mb-2 font-display text-lg font-semibold text-ink">Sessions</h2>
      <div className="flex flex-col gap-3">
        {sessions.map((session) => (
          <SessionCard key={session.id} courseId={course.id} session={session} />
        ))}
        {sessions.length === 0 && (
          <p className="rounded-card border border-dashed border-line-strong bg-paper-raised/40 p-6 text-center text-sm text-ink-faint">
            No sessions yet. Add your first session below.
          </p>
        )}
        <button
          type="button"
          onClick={() => void addSession(course.id, { date: todayIso(), topic: `Session ${sessions.length + 1}` })}
          className="min-h-11 rounded-md border border-dashed border-line-strong text-sm font-medium text-ink-soft hover:border-brand hover:text-brand"
        >
          + Add session
        </button>
      </div>
    </section>
  )
}
