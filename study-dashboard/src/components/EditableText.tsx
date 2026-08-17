import { useEffect, useRef, useState } from 'react'

export function EditableText({
  value,
  onCommit,
  className = '',
  inputClassName = '',
  placeholder,
  as: As = 'span',
}: {
  value: string
  onCommit: (value: string) => void
  className?: string
  inputClassName?: string
  placeholder?: string
  as?: 'span' | 'h1' | 'h2' | 'h3'
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => setDraft(value), [value])
  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  function commit() {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) onCommit(trimmed)
    else setDraft(value)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') {
            setDraft(value)
            setEditing(false)
          }
        }}
        placeholder={placeholder}
        className={`min-h-9 rounded border border-brand bg-paper-raised px-2 py-0.5 outline-none ${inputClassName || className}`}
      />
    )
  }

  return (
    <As
      onClick={() => setEditing(true)}
      className={`cursor-text rounded px-2 py-0.5 -mx-2 hover:bg-paper-sunken/70 ${className}`}
      title="Click to edit"
    >
      {value || <span className="text-ink-faint">{placeholder}</span>}
    </As>
  )
}
