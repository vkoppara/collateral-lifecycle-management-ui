import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import { Shield, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const formatINR = (v) => {
    if (!v) return '—';
    return `₹${Number(v).toLocaleString('en-IN')}`;
};

export default function CollateralTable({ collaterals, compact }) {
    if (!collaterals.length) {
        return <EmptyState icon={Shield} title="No collaterals found" description="Register your first collateral to get started." />;
    }

    return (
        <Card className="overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="text-xs">ID</TableHead>
                            <TableHead className="text-xs">Borrower</TableHead>
                            <TableHead className="text-xs">Type</TableHead>
                            {!compact && <TableHead className="text-xs">Location</TableHead>}
                            <TableHead className="text-xs">Market Value</TableHead>
                            <TableHead className="text-xs">LTV</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                            <TableHead className="text-xs">Risk</TableHead>
                            <TableHead className="text-xs w-10"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {collaterals.map(c => (
                            <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                                <TableCell className="text-xs font-mono">{c.collateral_id || '—'}</TableCell>
                                <TableCell className="text-xs font-medium">{c.borrower_name}</TableCell>
                                <TableCell className="text-xs capitalize">{c.type}{c.sub_type ? ` · ${c.sub_type}` : ''}</TableCell>
                                {!compact && <TableCell className="text-xs text-muted-foreground">{[c.city, c.state].filter(Boolean).join(', ') || '—'}</TableCell>}
                                <TableCell className="text-xs font-medium">{formatINR(c.market_value)}</TableCell>
                                <TableCell className="text-xs">{c.ltv_ratio ? `${c.ltv_ratio}%` : '—'}</TableCell>
                                <TableCell><StatusBadge status={c.status} /></TableCell>
                                <TableCell><StatusBadge status={c.risk_level} /></TableCell>
                                <TableCell>
                                    <Link to={`/collaterals/${c.id}`}>
                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                            <Eye className="h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
}
