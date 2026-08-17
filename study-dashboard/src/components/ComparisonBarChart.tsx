import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export interface ComparisonDatum {
  name: string
  Previous: number | null
  Current: number | null
}

function ComparisonTooltip({
  active,
  payload,
  label,
  suffix,
}: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
  suffix: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-line bg-paper-raised px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-ink">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-data">
          {p.name}: {p.value.toFixed(1)}
          {suffix}
        </p>
      ))}
    </div>
  )
}

export function ComparisonBarChart({
  data,
  domainMax,
  suffix,
  height = 260,
}: {
  data: ComparisonDatum[]
  domainMax: number
  suffix: string
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 5" stroke="var(--color-line)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: 'var(--color-ink-soft)' }}
          axisLine={{ stroke: 'var(--color-line-strong)' }}
          tickLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={50}
        />
        <YAxis
          domain={[0, domainMax]}
          tick={{ fontSize: 12, fill: 'var(--color-ink-soft)' }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip content={<ComparisonTooltip suffix={suffix} />} cursor={{ fill: 'var(--color-paper-sunken)' }} />
        <Bar dataKey="Previous" fill="var(--color-line-strong)" radius={[3, 3, 0, 0]} maxBarSize={22} />
        <Bar dataKey="Current" fill="var(--color-brand)" radius={[3, 3, 0, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  )
}
