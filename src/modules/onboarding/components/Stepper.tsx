import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

type StepperProps = {
  steps?: string[]
  currentStep: number
  onStepChange?: (stepIndex: number) => void
  className?: string
}

const defaultSteps = ['Trigger', 'Type', 'Details', 'Review']

function Stepper({
  steps = defaultSteps,
  currentStep,
  onStepChange,
  className,
}: StepperProps) {
  return (
    <div
      className={cn(
        'grid gap-2 sm:grid-cols-2 lg:grid-cols-4',
        className,
      )}
    >
      {steps.map((step, index) => {
        const isActive = index === currentStep
        const isCompleted = index < currentStep

        return (
          <button
            key={step}
            type="button"
            onClick={() => onStepChange?.(index)}
            className={cn(
              'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
              isActive && 'border-slate-900 bg-slate-900 text-white',
              isCompleted && 'border-emerald-200 bg-emerald-50 text-emerald-700',
              !isActive && !isCompleted &&
                'border-slate-200 bg-white text-slate-500 hover:border-slate-300',
            )}
          >
            <span
              className={cn(
                'inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-semibold',
                isActive && 'border-white/70 text-white',
                isCompleted && 'border-emerald-300 bg-emerald-100 text-emerald-700',
                !isActive && !isCompleted && 'border-slate-300 text-slate-500',
              )}
            >
              {isCompleted ? <Check size={12} /> : index + 1}
            </span>

            <div>
              <p className="text-xs font-medium">Step {index + 1}</p>
              <p className="text-sm font-semibold">{step}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export { Stepper }
