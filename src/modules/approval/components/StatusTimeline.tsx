import { Card } from '@/components/ui'
import { cn } from '@/lib/utils'

type TimelineItem = {
  id: string
  title: string
  timestamp: string
  active?: boolean
}

type StatusTimelineProps = {
  items?: TimelineItem[]
}

const defaultItems: TimelineItem[] = [
  { id: 'onboarding-done', title: 'Onboarding done', timestamp: '09:10 AM', active: false },
  { id: 'docs-uploaded', title: 'Docs uploaded', timestamp: '10:45 AM', active: true },
  { id: 'approved', title: 'Approved', timestamp: '11:30 AM', active: false },
]

function StatusTimeline({ items = defaultItems }: StatusTimelineProps) {
  return (
    <Card className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Status Timeline</h3>
      <div className="space-y-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <div key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
              <div className="relative flex w-5 justify-center">
                {!isLast && (
                  <span className="absolute top-4 h-[calc(100%-0.2rem)] w-px bg-slate-200" />
                )}
                <span
                  className={cn(
                    'mt-1 inline-flex h-2.5 w-2.5 rounded-full',
                    item.active ? 'bg-slate-900' : 'bg-slate-300',
                  )}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-500">{item.timestamp}</p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export { StatusTimeline }
