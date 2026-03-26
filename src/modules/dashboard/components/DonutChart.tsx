import { cn } from '@/lib/utils'

type DonutChartSegment = {
  label: string
  value: number
  color: string
}

type DonutChartProps = {
  segments: DonutChartSegment[]
  centerLabel: string
  centerValue: string
}

function DonutChart({ segments, centerLabel, centerValue }: DonutChartProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)

  let current = 0
  const gradient = segments
    .map((segment) => {
      const start = total > 0 ? (current / total) * 100 : 0
      current += segment.value
      const end = total > 0 ? (current / total) * 100 : 0
      return `${segment.color} ${start}% ${end}%`
    })
    .join(', ')

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div
        className="relative h-40 w-40 rounded-full"
        style={{ background: `conic-gradient(${gradient})` }}
      >
        <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white">
          <p className="text-[11px] uppercase tracking-[0.08em] text-slate-500">{centerLabel}</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{centerValue}</p>
        </div>
      </div>

      <div className="w-full space-y-2 sm:max-w-[220px]">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-2 text-slate-600">
              <span
                className={cn('inline-flex h-2.5 w-2.5 rounded-full')}
                style={{ backgroundColor: segment.color }}
              />
              {segment.label}
            </span>
            <span className="font-medium text-slate-700">{segment.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export { DonutChart }
