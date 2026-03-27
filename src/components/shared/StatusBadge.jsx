import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusStyles = {
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    under_review: 'bg-blue-50 text-blue-700 border-blue-200',
    legal_check: 'bg-purple-50 text-purple-700 border-purple-200',
    valuation: 'bg-blue-50 text-blue-700 border-blue-200',
    in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
    approved: 'bg-green-50 text-green-700 border-green-200',
    active: 'bg-green-50 text-green-700 border-green-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    clear: 'bg-green-50 text-green-700 border-green-200',
    verified: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    defective: 'bg-red-50 text-red-700 border-red-200',
    disputed: 'bg-red-50 text-red-700 border-red-200',
    encumbered: 'bg-orange-50 text-orange-700 border-orange-200',
    released: 'bg-slate-100 text-slate-700 border-slate-200',
    npa: 'bg-red-50 text-red-700 border-red-200',
    escalated: 'bg-orange-50 text-orange-700 border-orange-200',
    conditional: 'bg-amber-50 text-amber-700 border-amber-200',
    registered_elsewhere: 'bg-red-50 text-red-700 border-red-200',
    low: 'bg-green-50 text-green-700 border-green-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    high: 'bg-orange-50 text-orange-700 border-orange-200',
    critical: 'bg-red-50 text-red-700 border-red-200',
    urgent: 'bg-red-50 text-red-700 border-red-200',
};

export default function StatusBadge({ status, className }) {
    if (!status) return null;
    const label = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return (
        <Badge variant="outline" className={cn('text-xs font-medium border', statusStyles[status] || 'bg-slate-50 text-slate-600', className)}>
            {label}
        </Badge>
    );
}