import { useEffect, useState } from 'react'
import { Clock3 } from 'lucide-react'
import { Card, StatusBadge } from '@/components/ui'
import {
  CollateralActionModal,
  type CollateralActionType,
} from '@/modules/approval/components/CollateralActionModal'

export type VerificationStatusRow = {
  label: string
  status: 'Verified' | 'Pending' | 'Missing'
  tone: 'success' | 'pending' | 'error'
  updatedAt: string
}

const verificationRows: VerificationStatusRow[] = [
  {
    label: 'Valuation',
    status: 'Verified',
    tone: 'success' as const,
    updatedAt: '12 Mar 2026',
  },
  {
    label: 'Legal',
    status: 'Pending',
    tone: 'pending' as const,
    updatedAt: '11 Mar 2026',
  },
  {
    label: 'Insurance',
    status: 'Missing',
    tone: 'error' as const,
    updatedAt: '09 Mar 2026',
  },
  {
    label: 'Inspection',
    status: 'Verified',
    tone: 'success' as const,
    updatedAt: '12 Mar 2026',
  },
]

type VerificationStatusProps = {
  rows?: VerificationStatusRow[]
  onRowsChange?: (rows: VerificationStatusRow[]) => void
}

function VerificationStatus({ rows = verificationRows, onRowsChange }: VerificationStatusProps) {
  const [localRows, setLocalRows] = useState<VerificationStatusRow[]>(rows)
  const [selectedPendingRow, setSelectedPendingRow] =
    useState<VerificationStatusRow | null>(null)

  useEffect(() => {
    setLocalRows(rows)
  }, [rows])

  const resolveType = (label: string): CollateralActionType => {
    const normalizedLabel = label.toLowerCase()

    if (normalizedLabel.includes('legal')) {
      return 'legal'
    }

    if (normalizedLabel.includes('insurance')) {
      return 'insurance'
    }

    if (normalizedLabel.includes('valuation')) {
      return 'valuation'
    }

    return 'inspection'
  }

  const handleSubmit = () => {
    if (!selectedPendingRow) {
      return
    }

    const selectedLabel = selectedPendingRow.label

    setLocalRows((currentRows) => {
      const nextRows = currentRows.map((row) =>
        row.label === selectedLabel
          ? { ...row, status: 'Verified' as const, tone: 'success' as const }
          : row,
      )

      onRowsChange?.(nextRows)

      return nextRows
    })

    setSelectedPendingRow(null)
  }

  return (
    <>
      <Card className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Verification Status</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {localRows.map((row) => {
            const isPending = row.status === 'Pending'

            return (
              <div
                key={row.label}
                onClick={() => {
                  if (isPending) {
                    setSelectedPendingRow(row)
                  }
                }}
                className={
                  isPending
                    ? 'space-y-2 rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-3 transition-colors hover:cursor-pointer hover:bg-amber-50'
                    : 'space-y-2 rounded-xl border border-slate-200 bg-white px-3 py-3'
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-800">{row.label}</p>
                    {isPending && <Clock3 size={14} className="text-amber-600" />}
                  </div>
                  <StatusBadge status={row.tone}>{row.status}</StatusBadge>
                </div>
                <p className="text-xs text-slate-500">Last updated: {row.updatedAt}</p>
              </div>
            )
          })}
        </div>
      </Card>

      {selectedPendingRow && (
        <CollateralActionModal
          type={resolveType(selectedPendingRow.label)}
          status={selectedPendingRow.status}
          open={Boolean(selectedPendingRow)}
          onClose={() => setSelectedPendingRow(null)}
          onSubmit={handleSubmit}
        />
      )}
    </>
  )
}

export { VerificationStatus }
