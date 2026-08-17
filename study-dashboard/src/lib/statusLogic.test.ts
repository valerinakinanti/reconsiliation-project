import { describe, expect, it } from 'vitest'
import {
  chapterCompletionFraction,
  computeChapterStatus,
  computeSessionStatus,
  courseCompletionPercent,
  courseStatus,
  deadlineUrgency,
  semesterWeeklyTrend,
  weekStatus,
  worstStatus,
} from './statusLogic'
import type { Chapter, Course, Session, Week } from '@/types'

function makeChapter(overrides: Partial<Chapter> = {}): Chapter {
  return {
    id: 'c1',
    weekId: 'w1',
    title: 'Chapter',
    discussionDone: false,
    selfStudyQuestionsDone: false,
    fullSelfStudySessionDone: false,
    testedKnowledge: false,
    confidence: 1,
    position: 0,
    ...overrides,
  }
}

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 's1',
    courseId: 'course1',
    date: '2026-08-17',
    topic: 'Session',
    attended: false,
    confidence: 1,
    notes: '',
    position: 0,
    ...overrides,
  }
}

describe('computeChapterStatus', () => {
  it('is needs-self-study when self-study questions are not done', () => {
    const s = computeChapterStatus(makeChapter({ selfStudyQuestionsDone: false, fullSelfStudySessionDone: true }))
    expect(s).toBe('needs-self-study')
  })

  it('is needs-self-study when full self-study session is not done', () => {
    const s = computeChapterStatus(makeChapter({ selfStudyQuestionsDone: true, fullSelfStudySessionDone: false }))
    expect(s).toBe('needs-self-study')
  })

  it('is needs-revision when self-study done but confidence < 3', () => {
    const s = computeChapterStatus(
      makeChapter({ selfStudyQuestionsDone: true, fullSelfStudySessionDone: true, confidence: 2 }),
    )
    expect(s).toBe('needs-revision')
  })

  it('is test-yourself when confident but not tested', () => {
    const s = computeChapterStatus(
      makeChapter({
        selfStudyQuestionsDone: true,
        fullSelfStudySessionDone: true,
        confidence: 3,
        testedKnowledge: false,
      }),
    )
    expect(s).toBe('test-yourself')
  })

  it('is safe-to-move-on when everything is done and confident', () => {
    const s = computeChapterStatus(
      makeChapter({
        selfStudyQuestionsDone: true,
        fullSelfStudySessionDone: true,
        confidence: 5,
        testedKnowledge: true,
      }),
    )
    expect(s).toBe('safe-to-move-on')
  })
})

describe('computeSessionStatus', () => {
  it('is needs-self-study when not attended', () => {
    expect(computeSessionStatus(makeSession({ attended: false }))).toBe('needs-self-study')
  })

  it('is needs-revision when attended but low confidence', () => {
    expect(computeSessionStatus(makeSession({ attended: true, confidence: 2 }))).toBe('needs-revision')
  })

  it('is safe-to-move-on when attended and confident', () => {
    expect(computeSessionStatus(makeSession({ attended: true, confidence: 4 }))).toBe('safe-to-move-on')
  })
})

describe('chapterCompletionFraction', () => {
  it('averages the four tracked flags', () => {
    const f = chapterCompletionFraction(
      makeChapter({ discussionDone: true, selfStudyQuestionsDone: true, fullSelfStudySessionDone: false, testedKnowledge: false }),
    )
    expect(f).toBeCloseTo(0.5)
  })
})

describe('worstStatus', () => {
  it('returns null for an empty list', () => {
    expect(worstStatus([])).toBeNull()
  })

  it('picks the least-safe status', () => {
    expect(worstStatus(['safe-to-move-on', 'needs-revision', 'test-yourself'])).toBe('needs-revision')
    expect(worstStatus(['safe-to-move-on', 'needs-self-study'])).toBe('needs-self-study')
  })
})

describe('weekStatus / courseStatus rollups', () => {
  it('week status is the worst among its chapters', () => {
    const week: Week = {
      id: 'w1',
      courseId: 'course1',
      weekNumber: 1,
      label: null,
      position: 0,
      chapters: [
        makeChapter({ id: 'a', selfStudyQuestionsDone: true, fullSelfStudySessionDone: true, confidence: 5, testedKnowledge: true }),
        makeChapter({ id: 'b', selfStudyQuestionsDone: false }),
      ],
    }
    expect(weekStatus(week)).toBe('needs-self-study')
  })

  it('course status handles class-based courses via sessions', () => {
    const course: Course = {
      id: 'course1',
      name: 'Seminar',
      color: '#000',
      format: 'class-based',
      position: 0,
      deadlines: [],
      weeks: [],
      sessions: [makeSession({ attended: true, confidence: 4 }), makeSession({ attended: false })],
    }
    expect(courseStatus(course)).toBe('needs-self-study')
    expect(courseCompletionPercent(course)).toBeCloseTo(50)
  })
})

describe('semesterWeeklyTrend', () => {
  it('groups chapters by week number across courses', () => {
    const courseA: Course = {
      id: 'a',
      name: 'A',
      color: '#000',
      format: 'chapter-based',
      position: 0,
      deadlines: [],
      sessions: [],
      weeks: [
        {
          id: 'w1',
          courseId: 'a',
          weekNumber: 1,
          label: null,
          position: 0,
          chapters: [makeChapter({ confidence: 4, selfStudyQuestionsDone: true, fullSelfStudySessionDone: true, testedKnowledge: true })],
        },
      ],
    }
    const courseB: Course = {
      ...courseA,
      id: 'b',
      name: 'B',
      weeks: [
        {
          id: 'w2',
          courseId: 'b',
          weekNumber: 1,
          label: null,
          position: 0,
          chapters: [makeChapter({ confidence: 2 })],
        },
      ],
    }
    const trend = semesterWeeklyTrend([courseA, courseB])
    expect(trend).toHaveLength(1)
    expect(trend[0].weekNumber).toBe(1)
    expect(trend[0].avgConfidence).toBeCloseTo(3)
  })

  it('drops weeks that have no chapters yet instead of reporting them as 0', () => {
    const courseA: Course = {
      id: 'a',
      name: 'A',
      color: '#000',
      format: 'chapter-based',
      position: 0,
      deadlines: [],
      sessions: [],
      weeks: [
        {
          id: 'w1',
          courseId: 'a',
          weekNumber: 1,
          label: null,
          position: 0,
          chapters: [makeChapter({ confidence: 4, selfStudyQuestionsDone: true, fullSelfStudySessionDone: true, testedKnowledge: true })],
        },
        { id: 'w2', courseId: 'a', weekNumber: 2, label: null, position: 1, chapters: [] },
      ],
    }
    const trend = semesterWeeklyTrend([courseA])
    expect(trend).toHaveLength(1)
    expect(trend.map((t) => t.weekNumber)).toEqual([1])
  })
})

describe('deadlineUrgency', () => {
  const now = new Date('2026-08-17T09:00:00')

  it('flags overdue deadlines', () => {
    expect(deadlineUrgency('2026-08-16', now).urgency).toBe('overdue')
  })

  it('flags urgent deadlines under 3 days', () => {
    expect(deadlineUrgency('2026-08-18', now).urgency).toBe('urgent')
  })

  it('flags soon deadlines under 7 days', () => {
    expect(deadlineUrgency('2026-08-22', now).urgency).toBe('soon')
  })

  it('flags later deadlines', () => {
    expect(deadlineUrgency('2026-09-01', now).urgency).toBe('later')
  })
})
