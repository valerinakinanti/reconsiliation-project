import type { ChapterStatus } from '@/types'

export interface StatusTheme {
  label: string
  dot: string
  text: string
  bg: string
  border: string
}

export const STATUS_THEME: Record<ChapterStatus, StatusTheme> = {
  'needs-self-study': {
    label: 'Needs self-study',
    dot: 'bg-status-needs-self-study',
    text: 'text-status-needs-self-study',
    bg: 'bg-status-needs-self-study-tint',
    border: 'border-status-needs-self-study',
  },
  'needs-revision': {
    label: 'Needs revision',
    dot: 'bg-status-needs-revision',
    text: 'text-status-needs-revision',
    bg: 'bg-status-needs-revision-tint',
    border: 'border-status-needs-revision',
  },
  'test-yourself': {
    label: 'Test yourself',
    dot: 'bg-status-test-yourself',
    text: 'text-status-test-yourself',
    bg: 'bg-status-test-yourself-tint',
    border: 'border-status-test-yourself',
  },
  'safe-to-move-on': {
    label: 'Safe to move on',
    dot: 'bg-status-safe',
    text: 'text-status-safe',
    bg: 'bg-status-safe-tint',
    border: 'border-status-safe',
  },
}

export type Urgency = 'overdue' | 'urgent' | 'soon' | 'later'

export const URGENCY_THEME: Record<Urgency, { label: string; text: string; bg: string; border: string }> = {
  overdue: { label: 'Overdue', text: 'text-urgency-overdue', bg: 'bg-urgency-overdue/10', border: 'border-urgency-overdue' },
  urgent: { label: 'Due soon', text: 'text-urgency-urgent', bg: 'bg-urgency-urgent/10', border: 'border-urgency-urgent' },
  soon: { label: 'This week', text: 'text-urgency-soon', bg: 'bg-urgency-soon/10', border: 'border-urgency-soon' },
  later: { label: 'Upcoming', text: 'text-urgency-later', bg: 'bg-urgency-later/10', border: 'border-urgency-later' },
}
