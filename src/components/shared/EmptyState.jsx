import React from 'react';
import { InboxIcon } from 'lucide-react';

export default function EmptyState({ icon: Icon = InboxIcon, title, description }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Icon className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">{title || 'No data yet'}</h3>
            {description && <p className="text-xs text-muted-foreground mt-1 max-w-sm">{description}</p>}
        </div>
    );
}