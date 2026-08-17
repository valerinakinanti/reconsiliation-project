import type { Chapter, ChapterStatus, Course, Session, Week } from '@/types'

/**
 * Worst -> best. Used to roll many statuses up into a single "worst" status
 * for a week/course, and to sort/compare statuses.
 */
export const STATUS_SEVERITY: Record<ChapterStatus, number> = {
  'needs-self-study': 0,
  'needs-revision': 1,
  'test-yourself': 2,
  'safe-to-move-on': 3,
}

export const STATUS_LABEL: Record<ChapterStatus, string> = {
  'needs-self-study': 'Needs self-study',
  'needs-revision': 'Needs revision',
  'test-yourself': 'Test yourself',
  'safe-to-move-on': 'Safe to move on',
}

/** Status for a single chapter, per the four-flag / confidence rule set. */
export function computeChapterStatus(chapter: Pick<Chapter, 'selfStudyQuestionsDone' | 'fullSelfStudySessionDone' | 'confidence' | 'testedKnowledge'>): ChapterStatus {
  const selfStudyDone = chapter.selfStudyQuestionsDone && chapter.fullSelfStudySessionDone
  if (!selfStudyDone) return 'needs-self-study'
  if (chapter.confidence < 3) return 'needs-revision'
  if (!chapter.testedKnowledge) return 'test-yourself'
  return 'safe-to-move-on'
}

/**
 * Status for a class-based session. Sessions have no "tested knowledge"
 * field in the data model (that concept doesn't map to a seminar-style
 * class), so the 4-state ladder collapses to 3: attendance stands in for
 * "self-study", and confidence alone decides revision vs. safe-to-move-on.
 */
export function computeSessionStatus(session: Pick<Session, 'attended' | 'confidence'>): Exclude<ChapterStatus, 'test-yourself'> {
  if (!session.attended) return 'needs-self-study'
  if (session.confidence < 3) return 'needs-revision'
  return 'safe-to-move-on'
}

/** Fraction (0-1) of the four tracked activities completed for a chapter. */
export function chapterCompletionFraction(chapter: Pick<Chapter, 'discussionDone' | 'selfStudyQuestionsDone' | 'fullSelfStudySessionDone' | 'testedKnowledge'>): number {
  const flags = [chapter.discussionDone, chapter.selfStudyQuestionsDone, chapter.fullSelfStudySessionDone, chapter.testedKnowledge]
  return flags.filter(Boolean).length / flags.length
}

export function sessionCompletionFraction(session: Pick<Session, 'attended'>): number {
  return session.attended ? 1 : 0
}

function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

/** Worst status among a set of chapters/sessions; null when there's nothing to grade yet. */
export function worstStatus(statuses: ChapterStatus[]): ChapterStatus | null {
  if (statuses.length === 0) return null
  return statuses.reduce((worst, s) => (STATUS_SEVERITY[s] < STATUS_SEVERITY[worst] ? s : worst))
}

export function weekStatus(week: Pick<Week, 'chapters'>): ChapterStatus | null {
  return worstStatus(week.chapters.map(computeChapterStatus))
}

export function weekCompletionPercent(week: Pick<Week, 'chapters'>): number {
  return average(week.chapters.map(chapterCompletionFraction)) * 100
}

export function weekAverageConfidence(week: Pick<Week, 'chapters'>): number {
  return average(week.chapters.map((c) => c.confidence))
}

/** All per-item statuses for a course, chapter-based or class-based alike. */
export function courseItemStatuses(course: Pick<Course, 'format' | 'weeks' | 'sessions'>): ChapterStatus[] {
  if (course.format === 'chapter-based') {
    return course.weeks.flatMap((w) => w.chapters.map(computeChapterStatus))
  }
  return course.sessions.map(computeSessionStatus)
}

export function courseStatus(course: Pick<Course, 'format' | 'weeks' | 'sessions'>): ChapterStatus | null {
  return worstStatus(courseItemStatuses(course))
}

export function courseCompletionPercent(course: Pick<Course, 'format' | 'weeks' | 'sessions'>): number {
  if (course.format === 'chapter-based') {
    const chapters = course.weeks.flatMap((w) => w.chapters)
    return average(chapters.map(chapterCompletionFraction)) * 100
  }
  return average(course.sessions.map(sessionCompletionFraction)) * 100
}

export function courseAverageConfidence(course: Pick<Course, 'format' | 'weeks' | 'sessions'>): number {
  if (course.format === 'chapter-based') {
    const chapters = course.weeks.flatMap((w) => w.chapters)
    return average(chapters.map((c) => c.confidence))
  }
  return average(course.sessions.map((s) => s.confidence))
}

export interface WeeklyTrendPoint {
  weekNumber: number
  avgConfidence: number
  completionPercent: number
}

/**
 * Semester-wide trend across all chapter-based courses: for each distinct
 * week number, average confidence and completion % of every chapter that
 * belongs to a week with that number, across every course.
 */
export function semesterWeeklyTrend(courses: Pick<Course, 'format' | 'weeks'>[]): WeeklyTrendPoint[] {
  const byWeekNumber = new Map<number, { confidence: number[]; completion: number[] }>()

  for (const course of courses) {
    if (course.format !== 'chapter-based') continue
    for (const week of course.weeks) {
      const bucket = byWeekNumber.get(week.weekNumber) ?? { confidence: [], completion: [] }
      for (const chapter of week.chapters) {
        bucket.confidence.push(chapter.confidence)
        bucket.completion.push(chapterCompletionFraction(chapter) * 100)
      }
      byWeekNumber.set(week.weekNumber, bucket)
    }
  }

  return Array.from(byWeekNumber.entries())
    // Weeks with no chapters yet have nothing to report — drop them rather
    // than letting an empty average() drag the trend down to 0.
    .filter(([, bucket]) => bucket.confidence.length > 0)
    .map(([weekNumber, bucket]) => ({
      weekNumber,
      avgConfidence: average(bucket.confidence),
      completionPercent: average(bucket.completion),
    }))
    .sort((a, b) => a.weekNumber - b.weekNumber)
}

export interface DeadlineUrgency {
  urgency: 'overdue' | 'urgent' | 'soon' | 'later'
  daysUntil: number
}

/** Urgency bucket for a deadline, relative to `now` (injectable for tests). */
export function deadlineUrgency(dueDateIso: string, now: Date = new Date()): DeadlineUrgency {
  const due = new Date(`${dueDateIso}T00:00:00`)
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const msPerDay = 1000 * 60 * 60 * 24
  const daysUntil = Math.round((due.getTime() - start.getTime()) / msPerDay)

  if (daysUntil < 0) return { urgency: 'overdue', daysUntil }
  if (daysUntil < 3) return { urgency: 'urgent', daysUntil }
  if (daysUntil < 7) return { urgency: 'soon', daysUntil }
  return { urgency: 'later', daysUntil }
}

/** The soonest not-yet-passed deadline for a course, or null if none. */
export function nextUpcomingDeadline<D extends { dueDate: string }>(deadlines: D[], now: Date = new Date()): D | null {
  const upcoming = deadlines.filter((d) => deadlineUrgency(d.dueDate, now).urgency !== 'overdue')
  if (upcoming.length === 0) return null
  return upcoming.reduce((soonest, d) => (d.dueDate < soonest.dueDate ? d : soonest))
}

/** All deadlines across courses, sorted soonest-first (overdue included, sorted oldest overdue first is not what we want — sort purely by date ascending). */
export function allDeadlinesSorted<D extends { dueDate: string }>(deadlines: D[]): D[] {
  return [...deadlines].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}

/** Every distinct week number that appears in any chapter-based course. */
export function allWeekNumbers(courses: Pick<Course, 'format' | 'weeks'>[]): number[] {
  const set = new Set<number>()
  for (const course of courses) {
    if (course.format !== 'chapter-based') continue
    for (const week of course.weeks) set.add(week.weekNumber)
  }
  return Array.from(set).sort((a, b) => a - b)
}

export interface WeekStats {
  completionPercent: number
  avgConfidence: number
}

/** A single chapter-based course's stats for one specific week number, or null if it has no such week. */
export function courseWeekStats(course: Pick<Course, 'weeks'>, weekNumber: number): WeekStats | null {
  const week = course.weeks.find((w) => w.weekNumber === weekNumber)
  if (!week || week.chapters.length === 0) return null
  return { completionPercent: weekCompletionPercent(week), avgConfidence: weekAverageConfidence(week) }
}
