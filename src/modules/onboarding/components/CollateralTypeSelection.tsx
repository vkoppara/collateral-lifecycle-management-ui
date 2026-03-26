import { cn } from '@/lib/utils'
import type { CollateralTypeOption } from '@/modules/onboarding/types'

type CollateralTypeSelectionProps = {
  options?: CollateralTypeOption[]
  values: string[]
  onChange: (nextValues: string[]) => void
  className?: string
}

const defaultOptions: CollateralTypeOption[] = [
  { id: 'land-building', label: 'Land/Building' },
  { id: 'vehicle', label: 'Vehicle' },
  { id: 'plant-machinery', label: 'Plant/Machinery' },
  { id: 'securities', label: 'Securities' },
  { id: 'insurance', label: 'Insurance' },
]

function CollateralTypeSelection({
  options = defaultOptions,
  values,
  onChange,
  className,
}: CollateralTypeSelectionProps) {
  const toggleValue = (id: string) => {
    const hasValue = values.includes(id)
    const nextValues = hasValue
      ? values.filter((value) => value !== id)
      : [...values, id]

    onChange(nextValues)
  }

  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {options.map((option) => {
        const isSelected = values.includes(option.id)

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => toggleValue(option.id)}
            className={cn(
              'rounded-xl border px-4 py-3 text-sm font-medium transition-colors',
              isSelected
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export { CollateralTypeSelection }
