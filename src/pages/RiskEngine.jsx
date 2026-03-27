import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, ShieldAlert, TrendingUp, BarChart3 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

export default function RiskEngine() {
    const { data: collaterals = [] } = useQuery({
        queryKey: ['collaterals'],
        queryFn: () => base44.entities.Collateral.list('-created_date', 200),
    });

    const riskCounts = { low: 0, medium: 0, high: 0, critical: 0 };
    collaterals.forEach(c => { if (c.risk_level) riskCounts[c.risk_level]++; });

    const avgLTV = collaterals.length ? (collaterals.reduce((s, c) => s + (c.ltv_ratio || 0), 0) / collaterals.length).toFixed(1) : 0;
    const highLTV = collaterals.filter(c => (c.ltv_ratio || 0) > 75).length;
    const fraudFlagged = collaterals.filter(c => c.fraud_flags && c.fraud_flags.length > 0);

    const riskData = [
        { level: 'Low', count: riskCounts.low, fill: 'hsl(160, 60%, 45%)' },
        { level: 'Medium', count: riskCounts.medium, fill: 'hsl(38, 92%, 50%)' },
        { level: 'High', count: riskCounts.high, fill: 'hsl(25, 95%, 53%)' },
        { level: 'Critical', count: riskCounts.critical, fill: 'hsl(0, 84%, 60%)' },
    ];

    const highRiskCollaterals = collaterals
        .filter(c => c.risk_level === 'high' || c.risk_level === 'critical' || (c.ltv_ratio || 0) > 75)
        .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0));

    return (
        <div>
            <PageHeader title="Risk Engine" description="LTV analysis, risk scoring & fraud detection" />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <StatCard title="Avg LTV Ratio" value={`${avgLTV}%`} icon={TrendingUp} />
                <StatCard title="High LTV (>75%)" value={highLTV} subtitle="Require monitoring" icon={AlertTriangle} />
                <StatCard title="Fraud Flags" value={fraudFlagged.length} subtitle="Collaterals flagged" icon={ShieldAlert} />
                <StatCard title="High/Critical Risk" value={riskCounts.high + riskCounts.critical} icon={BarChart3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Risk Distribution</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={riskData} barSize={40}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                                <XAxis dataKey="level" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {riskData.map((entry, i) => (
                                        <rect key={i} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {fraudFlagged.length > 0 && (
                    <Card className="border-red-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                                <ShieldAlert className="h-4 w-4" /> Fraud Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {fraudFlagged.slice(0, 5).map(c => (
                                    <div key={c.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-xs font-medium text-red-800">{c.collateral_id} — {c.borrower_name}</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {c.fraud_flags.map((f, i) => (
                                                <span key={i} className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{f}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Card className="overflow-hidden">
                <CardHeader className="pb-2"><CardTitle className="text-sm">High Risk Collaterals</CardTitle></CardHeader>
                {highRiskCollaterals.length === 0 ? (
                    <CardContent><EmptyState icon={AlertTriangle} title="No high risk items" description="All collaterals within acceptable risk parameters" /></CardContent>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="text-xs">ID</TableHead>
                                    <TableHead className="text-xs">Borrower</TableHead>
                                    <TableHead className="text-xs">Type</TableHead>
                                    <TableHead className="text-xs">LTV</TableHead>
                                    <TableHead className="text-xs">Risk Score</TableHead>
                                    <TableHead className="text-xs">Risk Level</TableHead>
                                    <TableHead className="text-xs">Flags</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {highRiskCollaterals.map(c => (
                                    <TableRow key={c.id}>
                                        <TableCell className="text-xs font-mono">{c.collateral_id}</TableCell>
                                        <TableCell className="text-xs">{c.borrower_name}</TableCell>
                                        <TableCell className="text-xs capitalize">{c.type}</TableCell>
                                        <TableCell className="text-xs font-bold">{c.ltv_ratio ? `${c.ltv_ratio}%` : '—'}</TableCell>
                                        <TableCell className="text-xs font-medium">{c.risk_score || '—'}</TableCell>
                                        <TableCell><StatusBadge status={c.risk_level} /></TableCell>
                                        <TableCell className="text-xs">{c.fraud_flags?.length || 0}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </Card>
        </div>
    );
}