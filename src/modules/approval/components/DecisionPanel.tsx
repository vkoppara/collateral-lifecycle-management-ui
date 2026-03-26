import { Button, Card } from '@/components/ui'

function DecisionPanel() {
  return (
    <Card className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Decision Panel</h3>
        <p className="text-sm text-slate-600">
          Credit policy checks are mostly complete. One pending document renewal remains.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Recommendation</p>
        <p className="text-sm font-medium text-slate-900">
          Conditional approval subject to insurance renewal within 7 days.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" className="rounded-xl bg-slate-900 text-white hover:bg-slate-800">
          Approve
        </Button>
        <Button type="button" variant="outline" className="rounded-xl">
          Send Back
        </Button>
        <Button type="button" variant="outline" className="rounded-xl">
          Put On Hold
        </Button>
      </div>
    </Card>
  )
}

export { DecisionPanel }
