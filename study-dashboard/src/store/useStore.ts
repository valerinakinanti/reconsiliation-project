import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { v4 as uuid } from 'uuid'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import * as db from '@/lib/db'
import type { Chapter, Course, CourseFormat, Deadline, DeadlineKind, Session, Week } from '@/types'

const PALETTE = ['#3b5f8a', '#a8562c', '#4f7a5c', '#8a4b6b', '#c99a3a', '#5b5f97']

interface StoreState {
  authLoading: boolean
  user: User | null
  dataLoading: boolean
  courses: Course[]
  error: string | null

  init: () => Promise<void>
  loadData: () => Promise<void>
  signInWithMagicLink: (email: string) => Promise<void>
  signInWithPassword: (email: string, password: string) => Promise<void>
  signUpWithPassword: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  dismissError: () => void

  addCourse: (name: string, format: CourseFormat) => Promise<void>
  updateCourse: (id: string, patch: Partial<Pick<Course, 'name' | 'color'>>) => Promise<void>
  removeCourse: (id: string) => Promise<void>

  addWeek: (courseId: string, weekNumber: number, label: string | null) => Promise<void>
  updateWeek: (courseId: string, weekId: string, patch: Partial<Pick<Week, 'weekNumber' | 'label'>>) => Promise<void>
  removeWeek: (courseId: string, weekId: string) => Promise<void>

  addChapter: (courseId: string, weekId: string, title: string) => Promise<void>
  updateChapter: (courseId: string, weekId: string, chapterId: string, patch: Partial<Chapter>) => Promise<void>
  removeChapter: (courseId: string, weekId: string, chapterId: string) => Promise<void>

  addSession: (courseId: string, session?: Partial<Pick<Session, 'date' | 'topic'>>) => Promise<void>
  updateSession: (courseId: string, sessionId: string, patch: Partial<Session>) => Promise<void>
  removeSession: (courseId: string, sessionId: string) => Promise<void>

  addDeadline: (courseId: string, title: string, dueDate: string, kind: DeadlineKind) => Promise<void>
  updateDeadline: (courseId: string, deadlineId: string, patch: Partial<Deadline>) => Promise<void>
  removeDeadline: (courseId: string, deadlineId: string) => Promise<void>

  resetAllData: () => Promise<void>
}

export const useStore = create<StoreState>()(immer((set, get) => {
  /**
   * Applies a synchronous, immer-style mutation to `courses` immediately
   * (optimistic UI), then fires the async Supabase write. On failure the
   * mutation is rolled back and the error surfaced via `state.error`.
   */
  async function optimistic(mutate: (courses: Course[]) => void, persist: () => Promise<void>) {
    const snapshot = get().courses
    set((state) => {
      mutate(state.courses)
    })
    try {
      await persist()
    } catch (err) {
      set((state) => {
        state.courses = snapshot
        state.error = err instanceof Error ? err.message : 'Something went wrong saving that change.'
      })
    }
  }

  return {
    authLoading: true,
    user: null,
    dataLoading: false,
    courses: [],
    error: null,

    init: async () => {
      const { data } = await supabase.auth.getSession()
      set((state) => {
        state.user = data.session?.user ?? null
        state.authLoading = false
      })
      if (data.session?.user) await get().loadData()

      supabase.auth.onAuthStateChange((_event, session) => {
        const wasSignedIn = Boolean(get().user)
        set((state) => {
          state.user = session?.user ?? null
        })
        if (session?.user && !wasSignedIn) {
          void get().loadData()
        } else if (!session?.user) {
          set((state) => {
            state.courses = []
          })
        }
      })
    },

    loadData: async () => {
      set((state) => {
        state.dataLoading = true
      })
      try {
        const courses = await db.fetchAllCourses()
        set((state) => {
          state.courses = courses
          state.dataLoading = false
        })
      } catch (err) {
        set((state) => {
          state.dataLoading = false
          state.error = err instanceof Error ? err.message : 'Failed to load your data.'
        })
      }
    },

    signInWithMagicLink: async (email) => {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })
      if (error) throw error
    },

    signInWithPassword: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    },

    signUpWithPassword: async (email, password) => {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
    },

    signOut: async () => {
      await supabase.auth.signOut()
    },

    dismissError: () => set((state) => { state.error = null }),

    addCourse: async (name, format) => {
      const user = get().user
      if (!user) return
      const id = uuid()
      const color = PALETTE[get().courses.length % PALETTE.length]
      const position = get().courses.length
      const course: Course = { id, name, color, format, position, weeks: [], sessions: [], deadlines: [] }
      await optimistic(
        (courses) => { courses.push(course) },
        () => db.insertCourse({ id, name, color, format, position }, user.id),
      )
    },

    updateCourse: async (id, patch) => {
      await optimistic(
        (courses) => {
          const course = courses.find((c) => c.id === id)
          if (course) Object.assign(course, patch)
        },
        () => db.updateCourseRow(id, patch),
      )
    },

    removeCourse: async (id) => {
      await optimistic(
        (courses) => {
          const idx = courses.findIndex((c) => c.id === id)
          if (idx !== -1) courses.splice(idx, 1)
        },
        () => db.deleteCourseRow(id),
      )
    },

    addWeek: async (courseId, weekNumber, label) => {
      const user = get().user
      const course = get().courses.find((c) => c.id === courseId)
      if (!user || !course) return
      const id = uuid()
      const position = course.weeks.length
      const week: Week = { id, courseId, weekNumber, label, position, chapters: [] }
      await optimistic(
        (courses) => {
          courses.find((c) => c.id === courseId)?.weeks.push(week)
        },
        () => db.insertWeek({ id, courseId, weekNumber, label, position }, user.id),
      )
    },

    updateWeek: async (courseId, weekId, patch) => {
      await optimistic(
        (courses) => {
          const week = courses.find((c) => c.id === courseId)?.weeks.find((w) => w.id === weekId)
          if (week) Object.assign(week, patch)
        },
        () => db.updateWeekRow(weekId, patch),
      )
    },

    removeWeek: async (courseId, weekId) => {
      await optimistic(
        (courses) => {
          const course = courses.find((c) => c.id === courseId)
          if (!course) return
          const idx = course.weeks.findIndex((w) => w.id === weekId)
          if (idx !== -1) course.weeks.splice(idx, 1)
        },
        () => db.deleteWeekRow(weekId),
      )
    },

    addChapter: async (courseId, weekId, title) => {
      const user = get().user
      const week = get().courses.find((c) => c.id === courseId)?.weeks.find((w) => w.id === weekId)
      if (!user || !week) return
      const chapter: Chapter = {
        id: uuid(),
        weekId,
        title,
        discussionDone: false,
        selfStudyQuestionsDone: false,
        fullSelfStudySessionDone: false,
        testedKnowledge: false,
        confidence: 1,
        position: week.chapters.length,
      }
      await optimistic(
        (courses) => {
          courses.find((c) => c.id === courseId)?.weeks.find((w) => w.id === weekId)?.chapters.push(chapter)
        },
        () => db.insertChapter(chapter, user.id),
      )
    },

    updateChapter: async (courseId, weekId, chapterId, patch) => {
      await optimistic(
        (courses) => {
          const chapter = courses
            .find((c) => c.id === courseId)
            ?.weeks.find((w) => w.id === weekId)
            ?.chapters.find((ch) => ch.id === chapterId)
          if (chapter) Object.assign(chapter, patch)
        },
        () => db.updateChapterRow(chapterId, patch),
      )
    },

    removeChapter: async (courseId, weekId, chapterId) => {
      await optimistic(
        (courses) => {
          const week = courses.find((c) => c.id === courseId)?.weeks.find((w) => w.id === weekId)
          if (!week) return
          const idx = week.chapters.findIndex((ch) => ch.id === chapterId)
          if (idx !== -1) week.chapters.splice(idx, 1)
        },
        () => db.deleteChapterRow(chapterId),
      )
    },

    addSession: async (courseId, partial) => {
      const user = get().user
      const course = get().courses.find((c) => c.id === courseId)
      if (!user || !course) return
      const session: Session = {
        id: uuid(),
        courseId,
        date: partial?.date ?? new Date().toISOString().slice(0, 10),
        topic: partial?.topic ?? '',
        attended: false,
        confidence: 1,
        notes: '',
        position: course.sessions.length,
      }
      await optimistic(
        (courses) => {
          courses.find((c) => c.id === courseId)?.sessions.push(session)
        },
        () => db.insertSession(session, user.id),
      )
    },

    updateSession: async (courseId, sessionId, patch) => {
      await optimistic(
        (courses) => {
          const session = courses.find((c) => c.id === courseId)?.sessions.find((s) => s.id === sessionId)
          if (session) Object.assign(session, patch)
        },
        () => db.updateSessionRow(sessionId, patch),
      )
    },

    removeSession: async (courseId, sessionId) => {
      await optimistic(
        (courses) => {
          const course = courses.find((c) => c.id === courseId)
          if (!course) return
          const idx = course.sessions.findIndex((s) => s.id === sessionId)
          if (idx !== -1) course.sessions.splice(idx, 1)
        },
        () => db.deleteSessionRow(sessionId),
      )
    },

    addDeadline: async (courseId, title, dueDate, kind) => {
      const user = get().user
      if (!user || !get().courses.find((c) => c.id === courseId)) return
      const deadline: Deadline = { id: uuid(), courseId, title, dueDate, kind, notes: '' }
      await optimistic(
        (courses) => {
          courses.find((c) => c.id === courseId)?.deadlines.push(deadline)
        },
        () => db.insertDeadline(deadline, user.id),
      )
    },

    updateDeadline: async (courseId, deadlineId, patch) => {
      await optimistic(
        (courses) => {
          const deadline = courses.find((c) => c.id === courseId)?.deadlines.find((d) => d.id === deadlineId)
          if (deadline) Object.assign(deadline, patch)
        },
        () => db.updateDeadlineRow(deadlineId, patch),
      )
    },

    removeDeadline: async (courseId, deadlineId) => {
      await optimistic(
        (courses) => {
          const course = courses.find((c) => c.id === courseId)
          if (!course) return
          const idx = course.deadlines.findIndex((d) => d.id === deadlineId)
          if (idx !== -1) course.deadlines.splice(idx, 1)
        },
        () => db.deleteDeadlineRow(deadlineId),
      )
    },

    resetAllData: async () => {
      const user = get().user
      if (!user) return
      const snapshot = get().courses
      set((state) => {
        state.courses = []
      })
      try {
        await db.deleteAllUserData(user.id)
      } catch (err) {
        set((state) => {
          state.courses = snapshot
          state.error = err instanceof Error ? err.message : 'Failed to reset data.'
        })
      }
    },
  }
}))
