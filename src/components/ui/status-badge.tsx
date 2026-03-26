import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide',
  {
    variants: {
      status: {
        success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        pending: 'border-amber-200 bg-amber-50 text-amber-700',
        error: 'border-rose-200 bg-rose-50 text-rose-700',
      },
    },
    defaultVariants: {
      status: 'pending',
    },
  },
)

type StatusBadgeProps = ComponentProps<'span'> &
  VariantProps<typeof statusBadgeVariants>

function StatusBadge({ className, status, ...props }: StatusBadgeProps) {
  return (
    <span
      data-slot="status-badge"
      className={cn(statusBadgeVariants({ status }), className)}
      {...props}
    />
  )
}

export { StatusBadge }
