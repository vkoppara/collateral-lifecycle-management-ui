import { cn } from '@/lib/utils'
import type { TriggerOption } from '@/modules/onboarding/types'

type TriggerSelectionProps = {
  options?: TriggerOption[]
  value: string
  onChange: (triggerId: string) => void
  className?: string
}

const defaultOptions: TriggerOption[] = [
  { id: 'new-customer', label: 'New Customer', description: 'Onboard a new legal entity.' },
  { id: 'new-facility', label: 'New Facility', description: 'Create collateral setup for a new line.' },
  { id: 'augmentation', label: 'Augmentation', description: 'Increase coverage on an existing setup.' },
  { id: 'swap', label: 'Swap', description: 'Replace one asset with another.' },
  { id: 'replacement', label: 'Replacement', description: 'Refresh collateral due to expiry or change.' },
]

function TriggerSelection({
  options = defaultOptions,
  value,
  onChange,
  className,
}: TriggerSelectionProps) {
  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {options.map((option) => {
        const isSelected = option.id === value

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              'rounded-2xl border p-4 text-left transition-colors',
              isSelected
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300',
            )}
          >
            <p className="text-sm font-semibold">{option.label}</p>
            <p
              className={cn(
                'mt-1 text-xs',
                isSelected ? 'text-slate-200' : 'text-slate-500',
              )}
            >
              {option.description}
            </p>
          </button>
        )
      })}
    </div>
  )
}

export { TriggerSelection }
