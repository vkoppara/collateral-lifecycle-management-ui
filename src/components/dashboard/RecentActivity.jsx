import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import { format } from 'date-fns';

export default function RecentActivity({ auditLogs }) {
    const recent = auditLogs.slice(0, 8);

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {recent.length === 0 && (
                        <p className="text-xs text-muted-foreground py-4 text-center">No recent activity</p>
                    )}
                    {recent.map(log => (
                        <div key={log.id} className="flex items-start gap-3 text-xs">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-[10px] font-bold text-primary">{(log.user_name || 'U')[0]}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">{log.action}</p>
                                <p className="text-muted-foreground truncate">{log.details || log.entity_type}</p>
                                <p className="text-muted-foreground/60 mt-0.5">
                                    {log.created_date ? format(new Date(log.created_date), 'dd MMM, HH:mm') : ''}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}