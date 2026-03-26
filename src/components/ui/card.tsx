import * as React from 'react'

import { cn } from '@/lib/utils'

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_6px_24px_rgba(15,23,42,0.06)] transition-shadow duration-200 hover:shadow-[0_12px_30px_rgba(15,23,42,0.1)]',
        className,
      )}
      {...props}
    />
  )
}

export { Card }
