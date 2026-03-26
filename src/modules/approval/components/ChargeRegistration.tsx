import { useState } from 'react'

import { Button, Card } from '@/components/ui'
import { cn } from '@/lib/utils'

type RegistrationStatus = 'not-started' | 'in-progress' | 'done'

type ChargeRegistrationProps = {
  chargeId?: string
  initialStatus?: RegistrationStatus
  onRegister?: () => void
}

const statusLabelMap: Record<RegistrationStatus, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  done: 'Done',
}

const statusClassMap: Record<RegistrationStatus, string> = {
  'not-started': 'border-slate-200 bg-slate-100 text-slate-700',
  'in-progress': 'border-amber-200 bg-amber-50 text-amber-700',
  done: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

const nextStatusMap: Record<RegistrationStatus, RegistrationStatus> = {
  'not-started': 'in-progress',
  'in-progress': 'done',
  done: 'not-started',
}

function ChargeRegistration({
  chargeId = 'CHG-20419',
  initialStatus = 'not-started',
  onRegister,
}: ChargeRegistrationProps) {
  const [status, setStatus] = useState<RegistrationStatus>(initialStatus)

  const handleAction = () => {
    setStatus((current) => nextStatusMap[current])
    onRegister?.()
  }

  const actionLabel =
    status === 'not-started'
      ? 'Start Registration'
      : status === 'in-progress'
        ? 'Mark as Done'
        : 'Reset Status'

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Charge Registration</h3>
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
            statusClassMap[status],
          )}
        >
          {statusLabelMap[status]}
        </span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Charge ID</p>
        <p className="text-sm font-medium text-slate-900">{chargeId}</p>
      </div>

      <Button type="button" onClick={handleAction} className="rounded-xl">
        {actionLabel}
      </Button>
    </Card>
  )
}

export { ChargeRegistration }
