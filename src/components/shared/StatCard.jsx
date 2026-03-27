import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, trendUp, className }) {
    return (
        <Card className={cn("p-5 relative overflow-hidden", className)}>
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
                    <p className="text-2xl font-bold text-foreground">{value}</p>
                    {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                    {trend && (
                        <p className={cn("text-xs font-medium", trendUp ? "text-green-600" : "text-red-600")}>
                            {trendUp ? '↑' : '↓'} {trend}
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                )}
            </div>
        </Card>
    );
}