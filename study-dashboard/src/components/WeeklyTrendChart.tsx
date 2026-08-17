import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { WeeklyTrendPoint } from '@/lib/statusLogic'

function TrendTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string | number }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-line bg-paper-raised px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-ink">Week {label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-data">
          {p.name}: {p.name === 'Confidence' ? p.value.toFixed(1) : `${Math.round(p.value)}%`}
        </p>
      ))}
    </div>
  )
}

export function WeeklyTrendChart({ data }: { data: WeeklyTrendPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-card border border-dashed border-line-strong text-sm text-ink-faint">
        Add weeks and chapters to see your trend here.
      </div>
    )
  }

  const chartData = data.map((d) => ({ week: d.weekNumber, Confidence: Number(d.avgConfidence.toFixed(2)), Completion: Number(d.completionPercent.toFixed(1)) }))

  return (
    <div>
      <div className="mb-2 flex items-center gap-4 text-xs text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-full bg-brand" /> Avg. confidence
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-full bg-status-safe" style={{ backgroundImage: 'repeating-linear-gradient(90deg, var(--color-status-safe) 0 4px, transparent 4px 7px)' }} />{' '}
          Completion %
        </span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 5" stroke="var(--color-line)" />
        <XAxis
          dataKey="week"
          tickFormatter={(w) => `W${w}`}
          tick={{ fontSize: 12, fill: 'var(--color-ink-soft)' }}
          axisLine={{ stroke: 'var(--color-line-strong)' }}
          tickLine={false}
        />
        <YAxis
          yAxisId="confidence"
          domain={[0, 5]}
          tick={{ fontSize: 12, fill: 'var(--color-ink-soft)' }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <YAxis
          yAxisId="completion"
          orientation="right"
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: 'var(--color-ink-soft)' }}
          axisLine={false}
          tickLine={false}
          width={36}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<TrendTooltip />} />
        <Line
          yAxisId="confidence"
          type="monotone"
          dataKey="Confidence"
          stroke="var(--color-brand)"
          strokeWidth={2.5}
          dot={{ r: 3, fill: 'var(--color-brand)' }}
          activeDot={{ r: 5 }}
        />
        <Line
          yAxisId="completion"
          type="monotone"
          dataKey="Completion"
          stroke="var(--color-status-safe)"
          strokeWidth={2.5}
          strokeDasharray="5 3"
          dot={{ r: 3, fill: 'var(--color-status-safe)' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
