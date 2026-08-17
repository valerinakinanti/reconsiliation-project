import { Link, Navigate, useParams } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { courseCompletionPercent, courseStatus } from '@/lib/statusLogic'
import { StatusBadge } from '@/components/StatusBadge'
import { ProgressBar } from '@/components/ProgressBar'
import { EditableText } from '@/components/EditableText'
import { CourseDeadlines } from '@/components/CourseDeadlines'
import { ChapterCourseView } from '@/components/ChapterCourseView'
import { ClassCourseView } from '@/components/ClassCourseView'

export function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>()
  const course = useStore((s) => s.courses.find((c) => c.id === courseId))
  const dataLoading = useStore((s) => s.dataLoading)
  const updateCourse = useStore((s) => s.updateCourse)

  if (!course) {
    if (dataLoading) return null
    return <Navigate to="/" replace />
  }

  const status = courseStatus(course)
  const completion = courseCompletionPercent(course)

  return (
    <div className="flex flex-col gap-6">
      <Link to="/" className="flex w-fit items-center gap-1 text-sm text-ink-soft hover:text-ink">
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
          <path d="M12.7 15.3a1 1 0 01-1.4 0l-5-5a1 1 0 010-1.4l5-5a1 1 0 111.4 1.4L8.42 9.6l4.3 4.3a1 1 0 010 1.4z" />
        </svg>
        Overview
      </Link>

      <div className="rounded-card border border-line bg-paper-raised p-5 shadow-sm" style={{ borderTopColor: course.color, borderTopWidth: '4px' }}>
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-line-strong" title="Change color">
            <input
              type="color"
              value={course.color}
              onChange={(e) => updateCourse(course.id, { color: e.target.value })}
              className="absolute -left-1 -top-1 h-11 w-11 cursor-pointer"
            />
          </label>
          <EditableText
            value={course.name}
            onCommit={(v) => updateCourse(course.id, { name: v })}
            className="font-display text-2xl font-semibold text-ink"
            as="h1"
          />
          <span className="rounded-full border border-line-strong px-2 py-0.5 text-xs uppercase tracking-wide text-ink-faint">
            {course.format === 'chapter-based' ? 'Chapter-based' : 'Class-based'}
          </span>
          {status && <StatusBadge status={status} className="ml-auto" />}
        </div>

        <div className="mt-4">
          <div className="mb-1 flex items-baseline justify-between text-xs">
            <span className="text-ink-soft">Overall completion</span>
            <span className="font-data font-medium text-ink">{Math.round(completion)}%</span>
          </div>
          <ProgressBar percent={completion} color={course.color} />
        </div>
      </div>

      <section>
        <h2 className="mb-2 font-display text-lg font-semibold text-ink">Deadlines</h2>
        <CourseDeadlines courseId={course.id} deadlines={course.deadlines} />
      </section>

      {course.format === 'chapter-based' ? <ChapterCourseView course={course} /> : <ClassCourseView course={course} />}
    </div>
  )
}
