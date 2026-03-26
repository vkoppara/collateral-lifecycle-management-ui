import { Card } from '@/components/ui'
import { cn } from '@/lib/utils'

type ApprovalWorkflowProps = {
  currentStep?: number
}

const steps = ['Submitted', 'Review', 'Approved']

function ApprovalWorkflow({ currentStep = 1 }: ApprovalWorkflowProps) {
  return (
    <Card className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Approval Workflow</h3>
      <div className="space-y-0">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isLast = index === steps.length - 1

          return (
            <div key={step} className="relative flex gap-3 pb-5 last:pb-0">
              <div className="relative flex w-5 justify-center">
                {!isLast && (
                  <span className="absolute top-5 h-[calc(100%-0.25rem)] w-px bg-slate-200" />
                )}
                <span
                  className={cn(
                    'mt-1 inline-flex h-2.5 w-2.5 rounded-full',
                    isCompleted && 'bg-emerald-500',
                    isCurrent && 'bg-slate-900',
                    !isCompleted && !isCurrent && 'bg-slate-300',
                  )}
                />
              </div>

              <div className="flex-1">
                <p
                  className={cn(
                    'text-sm font-medium',
                    isCompleted && 'text-emerald-700',
                    isCurrent && 'text-slate-900',
                    !isCompleted && !isCurrent && 'text-slate-500',
                  )}
                >
                  {step}
                </p>
                <p className="text-xs text-slate-500">
                  {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export { ApprovalWorkflow }
