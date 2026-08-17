import { motion } from 'framer-motion'
import type { Chapter } from '@/types'
import { computeChapterStatus } from '@/lib/statusLogic'
import { StatusBadge } from '@/components/StatusBadge'
import { TrackerCheckbox } from '@/components/TrackerCheckbox'
import { ConfidenceScale } from '@/components/ConfidenceScale'
import { EditableText } from '@/components/EditableText'
import { useStore } from '@/store/useStore'

export function ChapterCard({ courseId, weekId, chapter }: { courseId: string; weekId: string; chapter: Chapter }) {
  const updateChapter = useStore((s) => s.updateChapter)
  const removeChapter = useStore((s) => s.removeChapter)
  const status = computeChapterStatus(chapter)

  const patch = (p: Partial<Chapter>) => updateChapter(courseId, weekId, chapter.id, p)

  return (
    <motion.div layout className="rounded-card border border-line bg-paper-raised p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <EditableText
          value={chapter.title}
          onCommit={(v) => patch({ title: v })}
          className="font-display text-base font-semibold text-ink"
          placeholder="Chapter title"
        />
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          <button
            type="button"
            aria-label={`Delete ${chapter.title}`}
            onClick={() => removeChapter(courseId, weekId, chapter.id)}
            className="rounded-full p-1.5 text-ink-faint hover:bg-status-needs-self-study-tint hover:text-status-needs-self-study"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path d="M8 2a1 1 0 00-1 1v1H4a1 1 0 000 2h12a1 1 0 100-2h-3V3a1 1 0 00-1-1H8zM5 7l.6 9.6A2 2 0 007.6 18h4.8a2 2 0 002-1.4L15 7H5z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
        <TrackerCheckbox label="Discussion covered" checked={chapter.discussionDone} onChange={(v) => patch({ discussionDone: v })} />
        <TrackerCheckbox
          label="Self-study questions done"
          checked={chapter.selfStudyQuestionsDone}
          onChange={(v) => patch({ selfStudyQuestionsDone: v })}
        />
        <TrackerCheckbox
          label="Full self-study session done"
          checked={chapter.fullSelfStudySessionDone}
          onChange={(v) => patch({ fullSelfStudySessionDone: v })}
        />
        <TrackerCheckbox label="Tested knowledge" checked={chapter.testedKnowledge} onChange={(v) => patch({ testedKnowledge: v })} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
        <span className="text-xs font-medium text-ink-soft">Confidence</span>
        <ConfidenceScale value={chapter.confidence} onChange={(v) => patch({ confidence: v })} size="sm" />
      </div>
    </motion.div>
  )
}
