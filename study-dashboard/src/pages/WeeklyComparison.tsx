import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { allWeekNumbers, courseWeekStats, semesterWeeklyTrend } from '@/lib/statusLogic'
import { ComparisonBarChart, type ComparisonDatum } from '@/components/ComparisonBarChart'

function DeltaTag({ delta, suffix }: { delta: number | null; suffix: string }) {
  if (delta === null) return <span className="font-data text-xs text-ink-faint">—</span>
  const rounded = Math.round(delta * 10) / 10
  if (Math.abs(rounded) < 0.05) return <span className="font-data text-xs text-ink-faint">±0{suffix}</span>
  const up = rounded > 0
  return (
    <span className={`inline-flex items-center gap-0.5 font-data text-xs font-medium ${up ? 'text-status-safe' : 'text-status-needs-self-study'}`}>
      {up ? '▲' : '▼'} {Math.abs(rounded)}
      {suffix}
    </span>
  )
}

export function WeeklyComparison() {
  const courses = useStore((s) => s.courses)
  const chapterCourses = courses.filter((c) => c.format === 'chapter-based')
  const weekNumbers = allWeekNumbers(courses)
  const trend = semesterWeeklyTrend(courses)
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)

  // Default to the latest week that actually has tracked chapters, not just
  // the highest week number (which might be a freshly-added, still-empty week).
  const latestWeekWithData = trend.length ? trend[trend.length - 1].weekNumber : (weekNumbers[weekNumbers.length - 1] ?? null)
  const currentWeek = selectedWeek ?? latestWeekWithData
  const previousWeek = currentWeek !== null ? currentWeek - 1 : null

  if (weekNumbers.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-line-strong bg-paper-raised/40 p-8 text-center">
        <p className="font-display text-lg text-ink">Nothing to compare yet</p>
        <p className="mt-1 text-sm text-ink-soft">Add weeks and chapters to a chapter-based module first.</p>
      </div>
    )
  }

  const semesterCurrent = trend.find((t) => t.weekNumber === currentWeek)
  const semesterPrevious = previousWeek !== null ? trend.find((t) => t.weekNumber === previousWeek) : undefined

  const completionData: ComparisonDatum[] = [
    { name: 'Semester avg', Previous: semesterPrevious?.completionPercent ?? null, Current: semesterCurrent?.completionPercent ?? null },
    ...chapterCourses.map((course) => {
      const cur = courseWeekStats(course, currentWeek!)
      const prev = previousWeek !== null ? courseWeekStats(course, previousWeek) : null
      return { name: course.name, Previous: prev?.completionPercent ?? null, Current: cur?.completionPercent ?? null }
    }),
  ]

  const confidenceData: ComparisonDatum[] = [
    { name: 'Semester avg', Previous: semesterPrevious?.avgConfidence ?? null, Current: semesterCurrent?.avgConfidence ?? null },
    ...chapterCourses.map((course) => {
      const cur = courseWeekStats(course, currentWeek!)
      const prev = previousWeek !== null ? courseWeekStats(course, previousWeek) : null
      return { name: course.name, Previous: prev?.avgConfidence ?? null, Current: cur?.avgConfidence ?? null }
    }),
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Week over week</h1>
          <p className="text-sm text-ink-soft">
            Comparing week {currentWeek}
            {previousWeek !== null ? ` against week ${previousWeek}` : ' (no prior week to compare)'}.
          </p>
        </div>
        <label className="text-xs font-medium text-ink-soft">
          Week
          <select
            value={currentWeek ?? ''}
            onChange={(e) => setSelectedWeek(Number(e.target.value))}
            className="ml-2 min-h-10 rounded-md border border-line-strong bg-paper-raised px-2 text-sm text-ink"
          >
            {weekNumbers.map((w) => (
              <option key={w} value={w}>
                Week {w}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-card border border-line bg-paper-raised p-4 shadow-sm">
          <h2 className="mb-1 font-display text-base font-semibold text-ink">Completion %</h2>
          <p className="mb-3 text-xs text-ink-soft">Grey = previous week, navy = selected week.</p>
          <ComparisonBarChart data={completionData} domainMax={100} suffix="%" />
        </div>
        <div className="rounded-card border border-line bg-paper-raised p-4 shadow-sm">
          <h2 className="mb-1 font-display text-base font-semibold text-ink">Avg. confidence</h2>
          <p className="mb-3 text-xs text-ink-soft">Grey = previous week, navy = selected week.</p>
          <ComparisonBarChart data={confidenceData} domainMax={5} suffix="" />
        </div>
      </div>

      <div className="rounded-card border border-line bg-paper-raised shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3 font-medium">Module</th>
              <th className="px-4 py-3 font-medium">Completion change</th>
              <th className="px-4 py-3 font-medium">Confidence change</th>
            </tr>
          </thead>
          <tbody>
            {completionData.map((row, i) => {
              const confRow = confidenceData[i]
              const completionDelta = row.Previous !== null && row.Current !== null ? row.Current - row.Previous : null
              const confidenceDelta = confRow.Previous !== null && confRow.Current !== null ? confRow.Current - confRow.Previous : null
              return (
                <tr key={row.name} className={`border-b border-line last:border-0 ${i === 0 ? 'bg-paper-sunken/40 font-medium' : ''}`}>
                  <td className="px-4 py-2.5 text-ink">{row.name}</td>
                  <td className="px-4 py-2.5">
                    <DeltaTag delta={completionDelta} suffix="%" />
                  </td>
                  <td className="px-4 py-2.5">
                    <DeltaTag delta={confidenceDelta} suffix="" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
