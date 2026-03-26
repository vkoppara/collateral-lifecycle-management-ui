import { Fragment, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Card, StatusBadge } from '@/components/ui'
import { approvalCases } from '@/data/approval.mock'
import { cn } from '@/lib/utils'

const formatInr = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))

const statusTone = {
  Submitted: 'pending',
  'Under Review': 'pending',
  Approved: 'success',
  Rejected: 'error',
} as const

const riskTone = {
  Low: 'bg-emerald-50 text-emerald-700',
  Medium: 'bg-amber-50 text-amber-700',
  High: 'bg-rose-50 text-rose-700',
} as const

function ApprovalQueuePage() {
  const navigate = useNavigate()
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Submitted' | 'Review' | 'Approved'>('All')
  const [riskFilter, setRiskFilter] = useState<'All' | 'Low' | 'Medium' | 'High'>('All')
  const [collateralTypeFilter, setCollateralTypeFilter] = useState('All')

  const collateralTypeOptions = useMemo(() => {
    return ['All', ...new Set(approvalCases.map((approvalCase) => approvalCase.collateralType))]
  }, [])

  const filteredCases = useMemo(() => {
    return approvalCases.filter((approvalCase) => {
      const statusMatch =
        statusFilter === 'All'
          ? true
          : statusFilter === 'Review'
            ? approvalCase.status === 'Under Review'
            : approvalCase.status === statusFilter

      const riskMatch =
        riskFilter === 'All' ? true : approvalCase.riskLevel === riskFilter

      const collateralTypeMatch =
        collateralTypeFilter === 'All'
          ? true
          : approvalCase.collateralType === collateralTypeFilter

      const normalizedSearch = searchQuery.trim().toLowerCase()
      const searchMatch =
        normalizedSearch.length === 0
          ? true
          : approvalCase.customerName.toLowerCase().includes(normalizedSearch) ||
            approvalCase.id.toLowerCase().includes(normalizedSearch) ||
            approvalCase.collateralType.toLowerCase().includes(normalizedSearch)

      return statusMatch && riskMatch && collateralTypeMatch && searchMatch
    })
  }, [collateralTypeFilter, riskFilter, searchQuery, statusFilter])

  return (
    <section className="space-y-5">
      <Card className="space-y-5 border-transparent bg-white/90 p-6 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Approval Queue
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Collateral Cases
            </h2>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-right">
            <p className="text-xs text-slate-500">Visible Cases</p>
            <p className="text-lg font-semibold text-slate-900">{filteredCases.length}</p>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl bg-slate-50/80 p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="flex-1 space-y-1">
              <span className="text-xs font-medium text-slate-600">Search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by customer, case ID, or collateral..."
                className="h-10 w-full rounded-lg bg-white px-3 text-sm text-slate-700 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.35)] outline-none placeholder:text-slate-400 focus:shadow-[inset_0_0_0_1px_rgba(71,85,105,0.7)]"
              />
            </label>

            <button
              type="button"
              onClick={() => setShowFilters((value) => !value)}
              className="h-10 rounded-lg bg-white px-4 text-sm font-medium text-slate-700 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.35)] transition-colors hover:bg-slate-100"
            >
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid gap-3 rounded-xl bg-white p-3 md:grid-cols-3">
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Status</span>
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as 'All' | 'Submitted' | 'Review' | 'Approved',
                    )
                  }
                  className="h-10 w-full rounded-lg bg-white px-3 text-sm text-slate-700 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.35)] outline-none focus:shadow-[inset_0_0_0_1px_rgba(71,85,105,0.7)]"
                >
                  <option value="All">All</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Review">Review</option>
                  <option value="Approved">Approved</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Risk Level</span>
                <select
                  value={riskFilter}
                  onChange={(event) =>
                    setRiskFilter(event.target.value as 'All' | 'Low' | 'Medium' | 'High')
                  }
                  className="h-10 w-full rounded-lg bg-white px-3 text-sm text-slate-700 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.35)] outline-none focus:shadow-[inset_0_0_0_1px_rgba(71,85,105,0.7)]"
                >
                  <option value="All">All</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">Collateral Type</span>
                <select
                  value={collateralTypeFilter}
                  onChange={(event) => setCollateralTypeFilter(event.target.value)}
                  className="h-10 w-full rounded-lg bg-white px-3 text-sm text-slate-700 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.35)] outline-none focus:shadow-[inset_0_0_0_1px_rgba(71,85,105,0.7)]"
                >
                  {collateralTypeOptions.map((collateralType) => (
                    <option key={collateralType} value={collateralType}>
                      {collateralType}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>

        <div className="w-full max-w-full overflow-hidden rounded-2xl bg-white shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
          <div className="w-full overflow-hidden">
            <table className="w-full table-fixed">
              <colgroup>
                <col style={{ width: '30%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '8%' }} />
              </colgroup>
              <thead className="bg-slate-50/90">
                <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Collateral Type</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Risk</th>
                  <th className="px-4 py-3 text-right">More</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((approvalCase) => (
                  <Fragment key={approvalCase.id}>
                    <tr
                      onClick={() => navigate(`/approval/${approvalCase.id}`)}
                      className="cursor-pointer border-t border-slate-100 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <p className="truncate font-medium text-slate-900" title={approvalCase.customerName}>
                          {approvalCase.customerName}
                        </p>
                        <p className="truncate text-xs text-slate-500">{approvalCase.id}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="truncate" title={approvalCase.collateralType}>
                          {approvalCase.collateralType}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        <p className="truncate" title={formatInr(approvalCase.collateralValue)}>
                          {formatInr(approvalCase.collateralValue)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={statusTone[approvalCase.status]}>
                          {approvalCase.status}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                            riskTone[approvalCase.riskLevel],
                          )}
                        >
                          {approvalCase.riskLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            setExpandedCaseId((current) =>
                              current === approvalCase.id ? null : approvalCase.id,
                            )
                          }}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
                          aria-label={
                            expandedCaseId === approvalCase.id
                              ? 'Collapse row details'
                              : 'Expand row details'
                          }
                        >
                          {expandedCaseId === approvalCase.id ? '−' : '+'}
                        </button>
                      </td>
                    </tr>

                    {expandedCaseId === approvalCase.id && (
                      <tr className="border-t border-slate-100 bg-slate-50/60">
                        <td className="px-4 py-3" colSpan={6}>
                          <div className="grid gap-3 text-sm sm:grid-cols-3">
                            <div>
                              <p className="text-xs text-slate-500">Loan Amount</p>
                              <p className="font-medium text-slate-800">
                                {formatInr(approvalCase.loanAmount)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Stage</p>
                              <p className="font-medium text-slate-800">{approvalCase.stage}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Created</p>
                              <p className="font-medium text-slate-800">
                                {formatDate(approvalCase.createdAt)}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCases.length === 0 && (
            <div className="p-4 text-sm text-slate-500">
              No approval cases match the selected filters.
            </div>
          )}
        </div>
      </Card>
    </section>
  )
}

export default ApprovalQueuePage
