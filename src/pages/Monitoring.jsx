import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, FileWarning, ShieldAlert, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import { format, differenceInDays } from 'date-fns';

export default function Monitoring() {
    const { data: collaterals = [] } = useQuery({
        queryKey: ['collaterals'],
        queryFn: () => base44.entities.Collateral.list('-created_date', 200),
    });

    const now = new Date();
    const d30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const d60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    const insuranceExpiring = collaterals.filter(c => {
        if (!c.insurance_expiry) return false;
        const exp = new Date(c.insurance_expiry);
        return exp <= d60 && exp >= now;
    }).sort((a, b) => new Date(a.insurance_expiry) - new Date(b.insurance_expiry));

    const revalDue = collaterals.filter(c => {
        if (!c.next_revaluation_date) return false;
        return new Date(c.next_revaluation_date) <= d60;
    }).sort((a, b) => new Date(a.next_revaluation_date) - new Date(b.next_revaluation_date));

    const npaWarning = collaterals.filter(c => c.status === 'npa' || c.risk_level === 'critical');

    const renderMonitorTable = (items, dateField, dateLabel) => {
        if (!items.length) return <EmptyState icon={RefreshCw} title="No items" description="All clear — nothing requires attention" />;
        return (
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="text-xs">ID</TableHead>
                                <TableHead className="text-xs">Borrower</TableHead>
                                <TableHead className="text-xs">Type</TableHead>
                                <TableHead className="text-xs">{dateLabel}</TableHead>
                                <TableHead className="text-xs">Days Left</TableHead>
                                <TableHead className="text-xs">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map(c => {
                                const date = c[dateField] ? new Date(c[dateField]) : null;
                                const daysLeft = date ? differenceInDays(date, now) : null;
                                return (
                                    <TableRow key={c.id}>
                                        <TableCell className="text-xs font-mono">{c.collateral_id}</TableCell>
                                        <TableCell className="text-xs">{c.borrower_name}</TableCell>
                                        <TableCell className="text-xs capitalize">{c.type}</TableCell>
                                        <TableCell className="text-xs">{date ? format(date, 'dd MMM yyyy') : '—'}</TableCell>
                                        <TableCell>
                                            <span className={`text-xs font-bold ${daysLeft !== null && daysLeft <= 30 ? 'text-red-600' : 'text-amber-600'}`}>
                                                {daysLeft !== null ? (daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d`) : '—'}
                                            </span>
                                        </TableCell>
                                        <TableCell><StatusBadge status={c.status} /></TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        );
    };

    return (
        <div>
            <PageHeader title="Monitoring & Revaluation" description="Track expirations, revaluations & NPA alerts" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard title="Insurance Expiring" value={insuranceExpiring.length} subtitle="Within 60 days" icon={Clock} />
                <StatCard title="Revaluation Due" value={revalDue.length} subtitle="Within 60 days" icon={FileWarning} />
                <StatCard title="NPA / Critical" value={npaWarning.length} icon={ShieldAlert} />
            </div>

            <Tabs defaultValue="insurance">
                <TabsList className="mb-4">
                    <TabsTrigger value="insurance">Insurance Expiry ({insuranceExpiring.length})</TabsTrigger>
                    <TabsTrigger value="reval">Revaluation Due ({revalDue.length})</TabsTrigger>
                    <TabsTrigger value="npa">NPA Warning ({npaWarning.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="insurance">{renderMonitorTable(insuranceExpiring, 'insurance_expiry', 'Expiry Date')}</TabsContent>
                <TabsContent value="reval">{renderMonitorTable(revalDue, 'next_revaluation_date', 'Revaluation Date')}</TabsContent>
                <TabsContent value="npa">{renderMonitorTable(npaWarning, 'next_revaluation_date', 'Next Reval')}</TabsContent>
            </Tabs>
        </div>
    );
}