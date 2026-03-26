import { Card } from '@/components/ui'
import { cn } from '@/lib/utils'

type RiskCoverageProps = {
  loanAmount?: number
  collateralValue?: number
}

const formatInr = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

function RiskCoverage({
  loanAmount = 51000000,
  collateralValue = 84500000,
}: RiskCoverageProps) {
  const ltv = collateralValue > 0 ? (loanAmount / collateralValue) * 100 : 0
  const normalizedLtv = Math.max(0, Math.min(100, ltv))

  const level = ltv <= 60 ? 'safe' : ltv <= 80 ? 'medium' : 'risky'

  const tone =
    level === 'safe'
      ? {
          bar: 'bg-emerald-500',
          text: 'text-emerald-700',
          badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
          label: 'Safe',
        }
      : level === 'medium'
        ? {
            bar: 'bg-amber-500',
            text: 'text-amber-700',
            badge: 'border-amber-200 bg-amber-50 text-amber-700',
            label: 'Medium',
          }
        : {
            bar: 'bg-rose-500',
            text: 'text-rose-700',
            badge: 'border-rose-200 bg-rose-50 text-rose-700',
            label: 'Risky',
          }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Risk & Coverage</h3>
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
            tone.badge,
          )}
        >
          Coverage Status: {tone.label}
        </span>
      </div>

      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 px-3 py-2">
            <p className="text-xs text-slate-500">Loan Amount</p>
            <p className="text-sm font-medium text-slate-900">{formatInr(loanAmount)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 px-3 py-2">
            <p className="text-xs text-slate-500">Collateral Value</p>
            <p className="text-sm font-medium text-slate-900">
              {formatInr(collateralValue)}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">LTV Ratio</span>
            <span className={cn('font-semibold', tone.text)}>{ltv.toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div
              className={cn('h-2 rounded-full transition-all', tone.bar)}
              style={{ width: `${normalizedLtv}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">LTV = Loan Amount / Collateral Value</p>
        </div>
      </div>
    </Card>
  )
}

export { RiskCoverage }
