import { useState } from 'react'

import { Button, Card } from '@/components/ui'
import { cn } from '@/lib/utils'

type ApprovalDecisionPanelProps = {
  readyForApproval?: boolean
}

function ApprovalDecisionPanel({
  readyForApproval = false,
}: ApprovalDecisionPanelProps) {
  const [remarks, setRemarks] = useState('')
  const [submittedDecision, setSubmittedDecision] = useState<
    'approved' | 'rejected' | null
  >(null)
  const statusLabel = readyForApproval ? 'Ready for Approval' : 'Pending'
  const isSubmitted = submittedDecision !== null

  const handleApprove = () => {
    setSubmittedDecision('approved')
  }

  const handleReject = () => {
    setSubmittedDecision('rejected')
  }

  return (
    <Card className="space-y-5 border-slate-300 bg-gradient-to-b from-white to-slate-50/80 p-6 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Approval Decision
          </p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">
            Final Collateral Decision
          </h3>
        </div>
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold',
            readyForApproval
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-amber-200 bg-amber-50 text-amber-700',
          )}
        >
          Overall Status: {statusLabel}
        </span>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700" htmlFor="approval-remarks">
          Remarks (Optional)
        </label>
        <textarea
          id="approval-remarks"
          value={remarks}
          onChange={(event) => setRemarks(event.target.value)}
          disabled={isSubmitted}
          rows={3}
          className={cn(
            'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400',
            isSubmitted &&
              'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500',
          )}
          placeholder="Add context for approver or rejection reason"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={handleApprove}
          disabled={!readyForApproval || isSubmitted}
          className="rounded-xl bg-slate-900 text-white hover:bg-slate-800"
        >
          Approve Collateral
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleReject}
          disabled={isSubmitted}
          className="rounded-xl border-slate-300"
        >
          Reject Collateral
        </Button>
      </div>

      {submittedDecision && (
        <div
          className={cn(
            'rounded-xl border px-3 py-2 text-sm font-medium',
            submittedDecision === 'approved'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700',
          )}
        >
          {submittedDecision === 'approved'
            ? 'Approval submitted successfully.'
            : 'Rejection submitted successfully.'}
        </div>
      )}
    </Card>
  )
}

export { ApprovalDecisionPanel }
