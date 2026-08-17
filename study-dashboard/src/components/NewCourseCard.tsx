import { useState } from 'react'
import type { CourseFormat } from '@/types'
import { useStore } from '@/store/useStore'

export function NewCourseCard() {
  const addCourse = useStore((s) => s.addCourse)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [format, setFormat] = useState<CourseFormat>('chapter-based')

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-line-strong bg-paper-raised/40 text-ink-faint transition-colors hover:border-brand hover:text-brand"
      >
        <svg viewBox="0 0 20 20" className="h-6 w-6" fill="currentColor">
          <path d="M10 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z" />
        </svg>
        <span className="text-sm font-medium">Add a module</span>
      </button>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!name.trim()) return
        void addCourse(name.trim(), format)
        setName('')
        setFormat('chapter-based')
        setOpen(false)
      }}
      className="flex flex-col gap-3 rounded-card border border-brand bg-paper-raised p-4 shadow-sm"
    >
      <label className="text-xs font-medium text-ink-soft">
        Module name
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Audit & Assurance"
          className="mt-1 min-h-11 w-full rounded-md border border-line-strong bg-paper px-3 text-sm text-ink outline-none focus:border-brand"
        />
      </label>
      <div className="text-xs font-medium text-ink-soft">
        Format
        <div className="mt-1 flex rounded-md border border-line-strong p-1 text-xs">
          <button
            type="button"
            onClick={() => setFormat('chapter-based')}
            className={`min-h-9 flex-1 rounded ${format === 'chapter-based' ? 'bg-brand text-paper-raised' : 'text-ink-soft'}`}
          >
            Chapter-based
          </button>
          <button
            type="button"
            onClick={() => setFormat('class-based')}
            className={`min-h-9 flex-1 rounded ${format === 'class-based' ? 'bg-brand text-paper-raised' : 'text-ink-soft'}`}
          >
            Class-based
          </button>
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="min-h-10 flex-1 rounded-md bg-brand text-sm font-medium text-paper-raised hover:opacity-90">
          Add
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="min-h-10 rounded-md border border-line-strong px-3 text-sm text-ink-soft hover:bg-paper-sunken"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
