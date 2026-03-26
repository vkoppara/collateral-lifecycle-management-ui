import { Button, Input } from '@/components/ui'
import { Modal } from '@/components/ui/modal'

type CollateralActionType = 'legal' | 'insurance' | 'valuation' | 'inspection'

type CollateralActionModalProps = {
  type: CollateralActionType
  status: string
  open?: boolean
  onClose?: () => void
  onSubmit?: () => void
}

const contentMap: Record<
  CollateralActionType,
  { title: string; description: string; submitLabel: string }
> = {
  legal: {
    title: 'Legal Review Required',
    description:
      'Complete legal verification and attach final signed documents before moving to the next approval stage.',
    submitLabel: 'Submit Legal Update',
  },
  insurance: {
    title: 'Insurance Update Required',
    description:
      'Insurance policy is pending. Add latest policy copy and validate coverage period for this collateral.',
    submitLabel: 'Submit Insurance Update',
  },
  valuation: {
    title: 'Valuation Submission Required',
    description:
      'Submit the latest valuation report and confirm valuation method to proceed with risk assessment.',
    submitLabel: 'Submit Valuation',
  },
  inspection: {
    title: 'Inspection Confirmation Required',
    description:
      'Inspection is pending. Capture verification notes and mark completion to unblock final approval.',
    submitLabel: 'Submit Inspection',
  },
}

const fileInputClassName =
  'block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-200'

function CollateralActionModal({
  type,
  status,
  open = true,
  onClose = () => {},
  onSubmit = () => {},
}: CollateralActionModalProps) {
  const content = contentMap[type]

  const renderTypeFields = () => {
    if (type === 'legal') {
      return (
        <div className="space-y-3">
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Legal Document</span>
            <input type="file" className={fileInputClassName} />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Remarks</span>
            <Input placeholder="Add legal review remarks" />
          </label>
        </div>
      )
    }

    if (type === 'insurance') {
      return (
        <div className="space-y-3">
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Policy Number</span>
            <Input placeholder="Enter policy number" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Insurance Document</span>
            <input type="file" className={fileInputClassName} />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Expiry Date</span>
            <Input type="date" />
          </label>
        </div>
      )
    }

    if (type === 'valuation') {
      return (
        <div className="space-y-3">
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Valuation Amount</span>
            <Input placeholder="Enter valuation amount" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Valuation Report</span>
            <input type="file" className={fileInputClassName} />
          </label>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        <label className="space-y-1">
          <span className="text-xs font-medium text-slate-600">Remarks</span>
          <textarea
            rows={3}
            placeholder="Add inspection remarks"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-slate-600">Upload Images</span>
          <input type="file" multiple className={fileInputClassName} />
        </label>
      </div>
    )
  }

  return (
    <Modal
      title={content.title}
      open={open}
      onClose={onClose}
      footer={
        <Button type="button" onClick={onSubmit}>
          {content.submitLabel}
        </Button>
      }
    >
      <p className="text-sm text-slate-600">Current Status: {status}</p>
      <p className="mt-2 text-sm text-slate-600">{content.description}</p>
      <div className="mt-4">{renderTypeFields()}</div>
    </Modal>
  )
}

export { CollateralActionModal }
export type { CollateralActionType }
