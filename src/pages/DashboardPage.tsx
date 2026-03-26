import { Card, StatusBadge } from '@/components/ui'
import { approvalCases } from '@/data/approval.mock'
import { BarSeriesChart, DonutChart } from '@/modules/dashboard/components'
import { useAuthStore } from '@/store/authStore'

const STUCK_DAYS = 3

const formatInrCompact = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)

function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  const totalCollateralValue = approvalCases.reduce(
    (sum, item) => sum + item.collateralValue,
    0,
  )

  const approvedCases = approvalCases.filter((item) => item.status === 'Approved')
  const approvedValue = approvedCases.reduce(
    (sum, item) => sum + item.collateralValue,
    0,
  )

  const activeCases = approvalCases.filter(
    (item) => item.status === 'Submitted' || item.status === 'Under Review',
  )

  const stuckCases = activeCases.filter((item) => {
    const ageDays =
      (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    return ageDays > STUCK_DAYS
  })

  const statusChartData = [
    {
      label: 'Submitted',
      value: approvalCases.filter((item) => item.status === 'Submitted').length,
      tone: 'amber' as const,
    },
    {
      label: 'Under Review',
      value: approvalCases.filter((item) => item.status === 'Under Review').length,
      tone: 'slate' as const,
    },
    {
      label: 'Approved',
      value: approvalCases.filter((item) => item.status === 'Approved').length,
      tone: 'emerald' as const,
    },
    {
      label: 'Rejected',
      value: approvalCases.filter((item) => item.status === 'Rejected').length,
      tone: 'rose' as const,
    },
  ]

  const valueSplitSegments = [
    {
      label: 'Approved Value',
      value: approvedValue,
      color: '#10b981',
    },
    {
      label: 'In-Progress Value',
      value: activeCases.reduce((sum, item) => sum + item.collateralValue, 0),
      color: '#0f172a',
    },
    {
      label: 'Rejected Value',
      value: approvalCases
        .filter((item) => item.status === 'Rejected')
        .reduce((sum, item) => sum + item.collateralValue, 0),
      color: '#fb7185',
    },
  ]

  const approvalRate =
    approvalCases.length > 0 ? (approvedCases.length / approvalCases.length) * 100 : 0

  return (
    <section className="space-y-5">
      <Card className="space-y-2">
        <p className="text-sm font-medium text-slate-500">Business View</p>
        <h2 className="text-2xl font-semibold text-slate-900">
          Hi {user.name || 'there'}, here is today&apos;s approval intelligence.
        </h2>
        <p className="text-sm text-slate-600">
          Track approval throughput, identify stuck cases, and monitor approved value in one view.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-1">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Total Collateral</p>
          <p className="text-3xl font-semibold text-slate-900">{formatInrCompact(totalCollateralValue)}</p>
          <p className="text-xs text-slate-500">Across {approvalCases.length} approval cases</p>
        </Card>

        <Card className="space-y-1">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Approved Value</p>
          <p className="text-3xl font-semibold text-emerald-700">{formatInrCompact(approvedValue)}</p>
          <p className="text-xs text-slate-500">{approvedCases.length} approved cases</p>
        </Card>

        <Card className="space-y-1">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Stuck Cases</p>
          <p className="text-3xl font-semibold text-amber-700">{stuckCases.length}</p>
          <p className="text-xs text-slate-500">Open for more than {STUCK_DAYS} days</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Case Flow by Status</h3>
            <StatusBadge status="pending">Operational View</StatusBadge>
          </div>
          <BarSeriesChart items={statusChartData} />
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Value Distribution</h3>
            <StatusBadge status="success">Portfolio View</StatusBadge>
          </div>
          <DonutChart
            segments={valueSplitSegments}
            centerLabel="Approval Rate"
            centerValue={`${approvalRate.toFixed(0)}%`}
          />
        </Card>
      </div>
    </section>
  )
}

export default DashboardPage
