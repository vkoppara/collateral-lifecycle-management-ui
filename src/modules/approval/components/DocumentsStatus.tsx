import { useEffect, useState } from 'react'
import { Clock3, FileText, Scale, ShieldCheck } from 'lucide-react'

import { Card, StatusBadge } from '@/components/ui'
import {
  CollateralActionModal,
  type CollateralActionType,
} from '@/modules/approval/components/CollateralActionModal'

export type DocumentStatusRow = {
  label: string
  statusLabel: 'Verified' | 'Pending' | 'Missing'
  statusTone: 'success' | 'pending' | 'error'
  icon: typeof Scale
}

const documentRows: DocumentStatusRow[] = [
  {
    label: 'Legal Verification',
    statusLabel: 'Verified',
    statusTone: 'success' as const,
    icon: Scale,
  },
  {
    label: 'Insurance',
    statusLabel: 'Pending',
    statusTone: 'pending' as const,
    icon: ShieldCheck,
  },
  {
    label: 'Valuation Report',
    statusLabel: 'Missing',
    statusTone: 'error' as const,
    icon: FileText,
  },
]

type DocumentsStatusProps = {
  rows?: DocumentStatusRow[]
  onRowsChange?: (rows: DocumentStatusRow[]) => void
}

function DocumentsStatus({ rows = documentRows, onRowsChange }: DocumentsStatusProps) {
  const [localRows, setLocalRows] = useState<DocumentStatusRow[]>(rows)
  const [selectedPendingRow, setSelectedPendingRow] =
    useState<DocumentStatusRow | null>(null)

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
          ? {
              ...row,
              statusLabel: 'Verified' as const,
              statusTone: 'success' as const,
            }
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
        <h3 className="text-lg font-semibold text-slate-900">Documents Status</h3>
        <div className="space-y-2">
          {localRows.map((row) => {
            const isPending = row.statusLabel === 'Pending'

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
                    ? 'flex cursor-pointer items-center justify-between rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 transition-colors hover:bg-amber-50'
                    : 'flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2'
                }
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <row.icon size={16} />
                  </span>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900">{row.label}</p>
                    {isPending && <Clock3 size={14} className="text-amber-600" />}
                  </div>
                </div>
                <StatusBadge status={row.statusTone}>{row.statusLabel}</StatusBadge>
              </div>
            )
          })}
        </div>
      </Card>

      {selectedPendingRow && (
        <CollateralActionModal
          type={resolveType(selectedPendingRow.label)}
          status={selectedPendingRow.statusLabel}
          open={Boolean(selectedPendingRow)}
          onClose={() => setSelectedPendingRow(null)}
          onSubmit={handleSubmit}
        />
      )}
    </>
  )
}

export { DocumentsStatus }
