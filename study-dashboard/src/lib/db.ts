import { supabase } from '@/lib/supabaseClient'
import type { Chapter, Course, Deadline, Session, Week } from '@/types'

// ============================================================
// Row shapes (snake_case, as stored in Postgres) <-> app types
// ============================================================

interface CourseRow {
  id: string
  name: string
  color: string
  format: Course['format']
  position: number
}

interface WeekRow {
  id: string
  course_id: string
  week_number: number
  label: string | null
  position: number
}

interface ChapterRow {
  id: string
  week_id: string
  title: string
  discussion_done: boolean
  self_study_questions_done: boolean
  full_self_study_session_done: boolean
  tested_knowledge: boolean
  confidence: number
  position: number
}

interface SessionRow {
  id: string
  course_id: string
  date: string
  topic: string
  attended: boolean
  confidence: number
  notes: string
  position: number
}

interface DeadlineRow {
  id: string
  course_id: string
  title: string
  due_date: string
  kind: Deadline['kind']
  notes: string
}

function chapterFromRow(row: ChapterRow): Chapter {
  return {
    id: row.id,
    weekId: row.week_id,
    title: row.title,
    discussionDone: row.discussion_done,
    selfStudyQuestionsDone: row.self_study_questions_done,
    fullSelfStudySessionDone: row.full_self_study_session_done,
    testedKnowledge: row.tested_knowledge,
    confidence: row.confidence as Chapter['confidence'],
    position: row.position,
  }
}

function weekFromRow(row: WeekRow, chapters: Chapter[]): Week {
  return {
    id: row.id,
    courseId: row.course_id,
    weekNumber: row.week_number,
    label: row.label,
    position: row.position,
    chapters,
  }
}

function sessionFromRow(row: SessionRow): Session {
  return {
    id: row.id,
    courseId: row.course_id,
    date: row.date,
    topic: row.topic,
    attended: row.attended,
    confidence: row.confidence as Session['confidence'],
    notes: row.notes,
    position: row.position,
  }
}

function deadlineFromRow(row: DeadlineRow): Deadline {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    dueDate: row.due_date,
    kind: row.kind,
    notes: row.notes,
  }
}

// ============================================================
// Fetch everything for the signed-in user (RLS scopes rows automatically)
// ============================================================

export async function fetchAllCourses(): Promise<Course[]> {
  const [coursesRes, weeksRes, chaptersRes, sessionsRes, deadlinesRes] = await Promise.all([
    supabase.from('courses').select('id, name, color, format, position').order('position'),
    supabase.from('weeks').select('id, course_id, week_number, label, position').order('position'),
    supabase.from('chapters').select('*').order('position'),
    supabase.from('sessions').select('*').order('position'),
    supabase.from('deadlines').select('*').order('due_date'),
  ])

  for (const res of [coursesRes, weeksRes, chaptersRes, sessionsRes, deadlinesRes]) {
    if (res.error) throw res.error
  }

  const chaptersByWeek = new Map<string, Chapter[]>()
  for (const row of (chaptersRes.data ?? []) as ChapterRow[]) {
    const chapter = chapterFromRow(row)
    const list = chaptersByWeek.get(chapter.weekId) ?? []
    list.push(chapter)
    chaptersByWeek.set(chapter.weekId, list)
  }

  const weeksByCourse = new Map<string, Week[]>()
  for (const row of (weeksRes.data ?? []) as WeekRow[]) {
    const week = weekFromRow(row, chaptersByWeek.get(row.id) ?? [])
    const list = weeksByCourse.get(row.course_id) ?? []
    list.push(week)
    weeksByCourse.set(row.course_id, list)
  }

  const sessionsByCourse = new Map<string, Session[]>()
  for (const row of (sessionsRes.data ?? []) as SessionRow[]) {
    const session = sessionFromRow(row)
    const list = sessionsByCourse.get(row.course_id) ?? []
    list.push(session)
    sessionsByCourse.set(row.course_id, list)
  }

  const deadlinesByCourse = new Map<string, Deadline[]>()
  for (const row of (deadlinesRes.data ?? []) as DeadlineRow[]) {
    const deadline = deadlineFromRow(row)
    const list = deadlinesByCourse.get(row.course_id) ?? []
    list.push(deadline)
    deadlinesByCourse.set(row.course_id, list)
  }

  return ((coursesRes.data ?? []) as CourseRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    color: row.color,
    format: row.format,
    position: row.position,
    weeks: weeksByCourse.get(row.id) ?? [],
    sessions: sessionsByCourse.get(row.id) ?? [],
    deadlines: deadlinesByCourse.get(row.id) ?? [],
  }))
}

// ============================================================
// Courses
// ============================================================

export async function insertCourse(course: { id: string; name: string; color: string; format: Course['format']; position: number }, userId: string) {
  const { error } = await supabase.from('courses').insert({
    id: course.id,
    user_id: userId,
    name: course.name,
    color: course.color,
    format: course.format,
    position: course.position,
  })
  if (error) throw error
}

export async function updateCourseRow(id: string, patch: Partial<Pick<Course, 'name' | 'color' | 'position'>>) {
  const { error } = await supabase.from('courses').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteCourseRow(id: string) {
  const { error } = await supabase.from('courses').delete().eq('id', id)
  if (error) throw error
}

// ============================================================
// Weeks
// ============================================================

export async function insertWeek(week: { id: string; courseId: string; weekNumber: number; label: string | null; position: number }, userId: string) {
  const { error } = await supabase.from('weeks').insert({
    id: week.id,
    user_id: userId,
    course_id: week.courseId,
    week_number: week.weekNumber,
    label: week.label,
    position: week.position,
  })
  if (error) throw error
}

export async function updateWeekRow(id: string, patch: Partial<{ weekNumber: number; label: string | null; position: number }>) {
  const dbPatch: Record<string, unknown> = {}
  if (patch.weekNumber !== undefined) dbPatch.week_number = patch.weekNumber
  if (patch.label !== undefined) dbPatch.label = patch.label
  if (patch.position !== undefined) dbPatch.position = patch.position
  const { error } = await supabase.from('weeks').update(dbPatch).eq('id', id)
  if (error) throw error
}

export async function deleteWeekRow(id: string) {
  const { error } = await supabase.from('weeks').delete().eq('id', id)
  if (error) throw error
}

// ============================================================
// Chapters
// ============================================================

export async function insertChapter(chapter: Omit<Chapter, never> & { weekId: string }, userId: string) {
  const { error } = await supabase.from('chapters').insert({
    id: chapter.id,
    user_id: userId,
    week_id: chapter.weekId,
    title: chapter.title,
    discussion_done: chapter.discussionDone,
    self_study_questions_done: chapter.selfStudyQuestionsDone,
    full_self_study_session_done: chapter.fullSelfStudySessionDone,
    tested_knowledge: chapter.testedKnowledge,
    confidence: chapter.confidence,
    position: chapter.position,
  })
  if (error) throw error
}

export async function updateChapterRow(id: string, patch: Partial<Chapter>) {
  const dbPatch: Record<string, unknown> = {}
  if (patch.title !== undefined) dbPatch.title = patch.title
  if (patch.discussionDone !== undefined) dbPatch.discussion_done = patch.discussionDone
  if (patch.selfStudyQuestionsDone !== undefined) dbPatch.self_study_questions_done = patch.selfStudyQuestionsDone
  if (patch.fullSelfStudySessionDone !== undefined) dbPatch.full_self_study_session_done = patch.fullSelfStudySessionDone
  if (patch.testedKnowledge !== undefined) dbPatch.tested_knowledge = patch.testedKnowledge
  if (patch.confidence !== undefined) dbPatch.confidence = patch.confidence
  if (patch.position !== undefined) dbPatch.position = patch.position
  const { error } = await supabase.from('chapters').update(dbPatch).eq('id', id)
  if (error) throw error
}

export async function deleteChapterRow(id: string) {
  const { error } = await supabase.from('chapters').delete().eq('id', id)
  if (error) throw error
}

// ============================================================
// Sessions
// ============================================================

export async function insertSession(session: Session, userId: string) {
  const { error } = await supabase.from('sessions').insert({
    id: session.id,
    user_id: userId,
    course_id: session.courseId,
    date: session.date,
    topic: session.topic,
    attended: session.attended,
    confidence: session.confidence,
    notes: session.notes,
    position: session.position,
  })
  if (error) throw error
}

export async function updateSessionRow(id: string, patch: Partial<Session>) {
  const dbPatch: Record<string, unknown> = {}
  if (patch.date !== undefined) dbPatch.date = patch.date
  if (patch.topic !== undefined) dbPatch.topic = patch.topic
  if (patch.attended !== undefined) dbPatch.attended = patch.attended
  if (patch.confidence !== undefined) dbPatch.confidence = patch.confidence
  if (patch.notes !== undefined) dbPatch.notes = patch.notes
  if (patch.position !== undefined) dbPatch.position = patch.position
  const { error } = await supabase.from('sessions').update(dbPatch).eq('id', id)
  if (error) throw error
}

export async function deleteSessionRow(id: string) {
  const { error } = await supabase.from('sessions').delete().eq('id', id)
  if (error) throw error
}

// ============================================================
// Deadlines
// ============================================================

export async function insertDeadline(deadline: Deadline, userId: string) {
  const { error } = await supabase.from('deadlines').insert({
    id: deadline.id,
    user_id: userId,
    course_id: deadline.courseId,
    title: deadline.title,
    due_date: deadline.dueDate,
    kind: deadline.kind,
    notes: deadline.notes,
  })
  if (error) throw error
}

export async function updateDeadlineRow(id: string, patch: Partial<Deadline>) {
  const dbPatch: Record<string, unknown> = {}
  if (patch.title !== undefined) dbPatch.title = patch.title
  if (patch.dueDate !== undefined) dbPatch.due_date = patch.dueDate
  if (patch.kind !== undefined) dbPatch.kind = patch.kind
  if (patch.notes !== undefined) dbPatch.notes = patch.notes
  const { error } = await supabase.from('deadlines').update(dbPatch).eq('id', id)
  if (error) throw error
}

export async function deleteDeadlineRow(id: string) {
  const { error } = await supabase.from('deadlines').delete().eq('id', id)
  if (error) throw error
}

export async function deleteAllUserData(userId: string) {
  const { error } = await supabase.from('courses').delete().eq('user_id', userId)
  if (error) throw error
}
