import { Button } from '@/components/ui'
import type { OnboardingDraft } from '@/modules/onboarding/types'

type ReviewSubmitProps = {
  draft: OnboardingDraft
  onSubmit: () => void
}

function ReviewSubmit({ draft, onSubmit }: ReviewSubmitProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Summary
        </p>

        <div className="mt-3 space-y-4 text-sm text-slate-700">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
              Trigger
            </p>
            <p className="mt-1 font-medium text-slate-900">{draft.trigger || '-'}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
              Type
            </p>
            <p className="mt-1 font-medium text-slate-900">
              {draft.collateralTypes.join(', ') || '-'}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
              Details
            </p>
            <div className="mt-1 grid gap-1">
              <p>
                <span className="font-medium text-slate-900">Name:</span>{' '}
                {draft.basicDetails.name || '-'}
              </p>
              <p>
                <span className="font-medium text-slate-900">Owner:</span>{' '}
                {draft.basicDetails.owner || '-'}
              </p>
              <p>
                <span className="font-medium text-slate-900">Value:</span>{' '}
                {draft.basicDetails.value || '-'}
              </p>
              <p>
                <span className="font-medium text-slate-900">Location:</span>{' '}
                {draft.basicDetails.location || '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Button type="button" onClick={onSubmit} className="rounded-xl px-6">
        Submit Onboarding
      </Button>
    </div>
  )
}

export { ReviewSubmit }
