export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateShort(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })
}

export function daysUntilLabel(daysUntil: number): string {
  if (daysUntil === 0) return 'Due today'
  if (daysUntil === 1) return 'Due tomorrow'
  if (daysUntil === -1) return '1 day overdue'
  if (daysUntil < 0) return `${Math.abs(daysUntil)} days overdue`
  return `${daysUntil} days left`
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function percent(n: number): string {
  return `${Math.round(n)}%`
}
