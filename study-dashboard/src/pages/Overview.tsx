import { useStore } from '@/store/useStore'
import { CourseCard } from '@/components/CourseCard'
import { NewCourseCard } from '@/components/NewCourseCard'
import { DeadlinesRail } from '@/components/DeadlinesRail'
import { WeeklyTrendChart } from '@/components/WeeklyTrendChart'
import { semesterWeeklyTrend } from '@/lib/statusLogic'

export function Overview() {
  const courses = useStore((s) => s.courses)
  const dataLoading = useStore((s) => s.dataLoading)
  const trend = semesterWeeklyTrend(courses)

  return (
    <div className="flex flex-col gap-8">
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h1 className="font-display text-2xl font-semibold text-ink">This semester</h1>
          {dataLoading && <span className="text-xs text-ink-faint">Syncing…</span>}
        </div>
        {courses.length === 0 && !dataLoading ? (
          <div className="rounded-card border border-dashed border-line-strong bg-paper-raised/40 p-8 text-center">
            <p className="font-display text-lg text-ink">No modules yet</p>
            <p className="mt-1 text-sm text-ink-soft">Add your first module below to start tracking.</p>
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
          <NewCourseCard />
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Deadlines</h2>
        <DeadlinesRail courses={courses} />
      </section>

      <section>
        <h2 className="mb-1 font-display text-lg font-semibold text-ink">Semester trend</h2>
        <p className="mb-3 text-sm text-ink-soft">Average confidence and completion across all chapter-based modules, week by week.</p>
        <div className="rounded-card border border-line bg-paper-raised p-4 shadow-sm">
          <WeeklyTrendChart data={trend} />
        </div>
      </section>
    </div>
  )
}
