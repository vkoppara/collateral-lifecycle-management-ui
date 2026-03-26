import {
  ApprovalDecisionPanel,
  CollateralSummary,
  DocumentsStatus,
  RiskCoverage,
  VerificationStatus,
} from '@/modules/approval'

function ApprovalPage() {
  return (
    <section className="space-y-5">
      <div className="grid gap-4">
        <CollateralSummary />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RiskCoverage />
        <DocumentsStatus />
      </div>

      <div className="grid gap-4">
        <VerificationStatus />
      </div>

      <div className="grid gap-4">
        <ApprovalDecisionPanel readyForApproval={false} />
      </div>
    </section>
  )
}

export default ApprovalPage
