import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertTriangle, Clock, FileWarning, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AlertsPanel({ collaterals }) {
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const expiringSoon = collaterals.filter(c => {
        if (!c.insurance_expiry) return false;
        const exp = new Date(c.insurance_expiry);
        return exp <= thirtyDays && exp >= now;
    });

    const revalDue = collaterals.filter(c => {
        if (!c.next_revaluation_date) return false;
        return new Date(c.next_revaluation_date) <= thirtyDays;
    });

    const fraudFlagged = collaterals.filter(c => c.fraud_flags && c.fraud_flags.length > 0);
    const highRisk = collaterals.filter(c => c.risk_level === 'high' || c.risk_level === 'critical');

    const alerts = [
        { label: 'Insurance Expiring', count: expiringSoon.length, icon: Clock, color: 'text-amber-600' },
        { label: 'Revaluation Due', count: revalDue.length, icon: FileWarning, color: 'text-blue-600' },
        { label: 'Fraud Flags', count: fraudFlagged.length, icon: ShieldAlert, color: 'text-red-600' },
        { label: 'High Risk', count: highRisk.length, icon: AlertTriangle, color: 'text-orange-600' },
    ];

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Alerts</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {alerts.map((a, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <a.icon className={cn("h-4 w-4", a.color)} />
                                <span className="text-xs text-foreground">{a.label}</span>
                            </div>
                            <span className={cn("text-sm font-bold", a.count > 0 ? a.color : 'text-muted-foreground')}>
                                {a.count}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}