import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FileText, Scale, ShieldCheck } from 'lucide-react'

import { Button, Card } from '@/components/ui'
import { approvalCases } from '@/data/approval.mock'
import {
  ApprovalDecisionPanel,
  CollateralSummary,
  type DocumentStatusRow,
  DocumentsStatus,
  RiskCoverage,
  type VerificationStatusRow,
  VerificationStatus,
} from '@/modules/approval'

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

function ApprovalDetailPage() {
  const { id } = useParams<{ id: string }>()

  const approvalCase = approvalCases.find((item) => item.id === id)

  const baseDocumentRows = useMemo<DocumentStatusRow[]>(() => {
    if (!approvalCase) {
      return []
    }

    const readyByStage =
      approvalCase.status === 'Under Review' && approvalCase.stage === 'Final Approval'

    return [
      {
        label: 'Legal Verification',
        statusLabel:
          approvalCase.stage === 'Legal' || readyByStage || approvalCase.status === 'Approved'
            ? 'Verified'
            : approvalCase.status === 'Rejected'
              ? 'Missing'
              : 'Pending',
        statusTone:
          approvalCase.stage === 'Legal' || readyByStage || approvalCase.status === 'Approved'
            ? 'success'
            : approvalCase.status === 'Rejected'
              ? 'error'
              : 'pending',
        icon: Scale,
      },
      {
        label: 'Insurance',
        statusLabel:
          readyByStage || approvalCase.status === 'Approved'
            ? 'Verified'
            : approvalCase.riskLevel === 'High'
              ? 'Missing'
              : 'Pending',
        statusTone:
          readyByStage || approvalCase.status === 'Approved'
            ? 'success'
            : approvalCase.riskLevel === 'High'
              ? 'error'
              : 'pending',
        icon: ShieldCheck,
      },
      {
        label: 'Valuation Report',
        statusLabel:
          approvalCase.stage === 'Valuation' || readyByStage || approvalCase.status === 'Approved'
            ? 'Verified'
            : approvalCase.status === 'Rejected'
              ? 'Missing'
              : 'Pending',
        statusTone:
          approvalCase.stage === 'Valuation' || readyByStage || approvalCase.status === 'Approved'
            ? 'success'
            : approvalCase.status === 'Rejected'
              ? 'error'
              : 'pending',
        icon: FileText,
      },
    ]
  }, [approvalCase])

  const baseVerificationRows = useMemo<VerificationStatusRow[]>(() => {
    if (!approvalCase) {
      return []
    }

    const readyByStage =
      approvalCase.status === 'Under Review' && approvalCase.stage === 'Final Approval'

    return [
      {
        label: 'Valuation',
        status:
          approvalCase.stage === 'Valuation' || readyByStage || approvalCase.status === 'Approved'
            ? 'Verified'
            : approvalCase.status === 'Rejected'
              ? 'Missing'
              : 'Pending',
        tone:
          approvalCase.stage === 'Valuation' || readyByStage || approvalCase.status === 'Approved'
            ? 'success'
            : approvalCase.status === 'Rejected'
              ? 'error'
              : 'pending',
        updatedAt: approvalCase ? formatDate(approvalCase.createdAt) : '-',
      },
      {
        label: 'Legal',
        status:
          approvalCase.stage === 'Legal' || readyByStage || approvalCase.status === 'Approved'
            ? 'Verified'
            : approvalCase.status === 'Rejected'
              ? 'Missing'
              : 'Pending',
        tone:
          approvalCase.stage === 'Legal' || readyByStage || approvalCase.status === 'Approved'
            ? 'success'
            : approvalCase.status === 'Rejected'
              ? 'error'
              : 'pending',
        updatedAt: approvalCase ? formatDate(approvalCase.createdAt) : '-',
      },
      {
        label: 'Insurance',
        status:
          readyByStage || approvalCase.status === 'Approved'
            ? 'Verified'
            : approvalCase.riskLevel === 'High'
              ? 'Missing'
              : 'Pending',
        tone:
          readyByStage || approvalCase.status === 'Approved'
            ? 'success'
            : approvalCase.riskLevel === 'High'
              ? 'error'
              : 'pending',
        updatedAt: approvalCase ? formatDate(approvalCase.createdAt) : '-',
      },
      {
        label: 'Inspection',
        status:
          approvalCase.stage === 'Final Approval' || approvalCase.status === 'Approved'
            ? 'Verified'
            : approvalCase.status === 'Rejected'
              ? 'Missing'
              : 'Pending',
        tone:
          approvalCase.stage === 'Final Approval' || approvalCase.status === 'Approved'
            ? 'success'
            : approvalCase.status === 'Rejected'
              ? 'error'
              : 'pending',
        updatedAt: approvalCase ? formatDate(approvalCase.createdAt) : '-',
      },
    ]
  }, [approvalCase])

  const [documentRows, setDocumentRows] = useState<DocumentStatusRow[]>(baseDocumentRows)
  const [verificationRows, setVerificationRows] =
    useState<VerificationStatusRow[]>(baseVerificationRows)

  useEffect(() => {
    setDocumentRows(baseDocumentRows)
    setVerificationRows(baseVerificationRows)
  }, [baseDocumentRows, baseVerificationRows])

  if (!approvalCase) {
    return (
      <Card className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Case not found</h2>
        <p className="text-sm text-slate-600">
          We could not find an approval case for id: {id}
        </p>
        <Link to="/approval" className="inline-flex">
          <Button type="button" variant="outline" className="rounded-xl">
            Back to Queue
          </Button>
        </Link>
      </Card>
    )
  }

  const hasPendingDocuments = documentRows.some((row) => row.statusLabel === 'Pending')
  const hasPendingVerification = verificationRows.some((row) => row.status === 'Pending')
  const readyForApproval =
    !hasPendingDocuments && !hasPendingVerification && approvalCase.status !== 'Rejected'

  return (
    <section className="space-y-5">
      <div className="grid gap-4">
        <CollateralSummary
          collateralType={approvalCase.collateralType}
          valueInr={formatInr(approvalCase.collateralValue)}
          owner={approvalCase.customerName}
          linkedLoanAccount={approvalCase.id}
          exposureAmount={formatInr(approvalCase.loanAmount)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RiskCoverage
          loanAmount={approvalCase.loanAmount}
          collateralValue={approvalCase.collateralValue}
        />
        <DocumentsStatus rows={documentRows} onRowsChange={setDocumentRows} />
      </div>

      <div className="grid gap-4">
        <VerificationStatus rows={verificationRows} onRowsChange={setVerificationRows} />
      </div>

      <div className="grid gap-4">
        <ApprovalDecisionPanel readyForApproval={readyForApproval} />
      </div>
    </section>
  )
}

export default ApprovalDetailPage
