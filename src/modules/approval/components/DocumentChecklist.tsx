import { useState } from 'react'

import { Card } from '@/components/ui'

type ChecklistItem = {
  id: string
  label: string
  checked: boolean
}

type DocumentChecklistProps = {
  items?: ChecklistItem[]
}

const defaultItems: ChecklistItem[] = [
  { id: 'legal', label: 'Legal', checked: false },
  { id: 'insurance', label: 'Insurance', checked: false },
  { id: 'valuation', label: 'Valuation', checked: false },
]

function DocumentChecklist({ items = defaultItems }: DocumentChecklistProps) {
  const [checklist, setChecklist] = useState(items)

  const toggleItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    )
  }

  return (
    <Card className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Document Checklist</h3>
      <ul className="space-y-2">
        {checklist.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggleItem(item.id)}
              className="h-4 w-4"
            />
            <span className="text-sm text-slate-700">{item.label}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export { DocumentChecklist }
