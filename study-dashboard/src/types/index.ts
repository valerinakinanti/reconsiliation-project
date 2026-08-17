export type CourseFormat = 'chapter-based' | 'class-based'

export type DeadlineKind = 'project' | 'soft'

export type ChapterStatus =
  | 'needs-self-study'
  | 'needs-revision'
  | 'test-yourself'
  | 'safe-to-move-on'

export interface Deadline {
  id: string
  courseId: string
  title: string
  dueDate: string // ISO date (yyyy-mm-dd)
  kind: DeadlineKind
  notes: string
}

export interface Chapter {
  id: string
  weekId: string
  title: string
  discussionDone: boolean
  selfStudyQuestionsDone: boolean
  fullSelfStudySessionDone: boolean
  testedKnowledge: boolean
  confidence: 1 | 2 | 3 | 4 | 5
  position: number
}

export interface Week {
  id: string
  courseId: string
  weekNumber: number
  label: string | null
  position: number
  chapters: Chapter[]
}

export interface Session {
  id: string
  courseId: string
  date: string // ISO date
  topic: string
  attended: boolean
  confidence: 1 | 2 | 3 | 4 | 5
  notes: string
  position: number
}

export interface Course {
  id: string
  name: string
  color: string
  format: CourseFormat
  position: number
  deadlines: Deadline[]
  // chapter-based
  weeks: Week[]
  // class-based
  sessions: Session[]
}
