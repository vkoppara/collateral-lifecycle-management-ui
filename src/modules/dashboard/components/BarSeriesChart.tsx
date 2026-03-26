import { cn } from '@/lib/utils'

type BarSeriesItem = {
  label: string
  value: number
  tone?: 'slate' | 'emerald' | 'amber' | 'rose'
}

type BarSeriesChartProps = {
  items: BarSeriesItem[]
}

const toneClassMap = {
  slate: 'bg-slate-800',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
} as const

function BarSeriesChart({ items }: BarSeriesChartProps) {
  const maxValue = Math.max(...items.map((item) => item.value), 1)

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const percent = Math.max(6, (item.value / maxValue) * 100)

        return (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">{item.label}</span>
              <span className="text-slate-500">{item.value}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className={cn(
                  'h-2 rounded-full transition-all',
                  toneClassMap[item.tone ?? 'slate'],
                )}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { BarSeriesChart }
