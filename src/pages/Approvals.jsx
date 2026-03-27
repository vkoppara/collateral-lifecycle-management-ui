import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertTriangle, CheckSquare } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import StatCard from '@/components/shared/StatCard';
import { format } from 'date-fns';

export default function Approvals() {
    const [selected, setSelected] = useState(null);
    const [remarks, setRemarks] = useState('');
    const qc = useQueryClient();

    const { data: approvals = [] } = useQuery({
        queryKey: ['approvals'],
        queryFn: () => base44.entities.ApprovalRequest.list('-created_date', 200),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ApprovalRequest.update(id, data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['approvals'] }); setSelected(null); setRemarks(''); },
    });

    const handleAction = (status) => {
        updateMutation.mutate({
            id: selected.id,
            data: { status, remarks, decided_date: new Date().toISOString().split('T')[0] },
        });
    };

    const pending = approvals.filter(a => a.status === 'pending');
    const approved = approvals.filter(a => a.status === 'approved');
    const rejected = approvals.filter(a => a.status === 'rejected');

    const renderTable = (items) => {
        if (!items.length) return <EmptyState icon={CheckSquare} title="No items" />;
        return (
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="text-xs">Collateral</TableHead>
                                <TableHead className="text-xs">Type</TableHead>
                                <TableHead className="text-xs">Level</TableHead>
                                <TableHead className="text-xs">Priority</TableHead>
                                <TableHead className="text-xs">Status</TableHead>
                                <TableHead className="text-xs">Requested By</TableHead>
                                <TableHead className="text-xs">Date</TableHead>
                                <TableHead className="text-xs w-24"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map(a => (
                                <TableRow key={a.id}>
                                    <TableCell className="text-xs font-mono">{a.collateral_ref || a.collateral_id}</TableCell>
                                    <TableCell className="text-xs capitalize">{(a.request_type || '').replace(/_/g, ' ')}</TableCell>
                                    <TableCell className="text-xs">L{a.level || 1}</TableCell>
                                    <TableCell><StatusBadge status={a.priority} /></TableCell>
                                    <TableCell><StatusBadge status={a.status} /></TableCell>
                                    <TableCell className="text-xs">{a.requested_by || '—'}</TableCell>
                                    <TableCell className="text-xs">{a.created_date ? format(new Date(a.created_date), 'dd MMM yy') : '—'}</TableCell>
                                    <TableCell>
                                        {a.status === 'pending' && (
                                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSelected(a)}>
                                                Review
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        );
    };

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard title="Pending" value={pending.length} icon={AlertTriangle} />
                <StatCard title="Approved" value={approved.length} icon={CheckCircle} />
                <StatCard title="Rejected" value={rejected.length} icon={XCircle} />
            </div>

            <Tabs defaultValue="pending">
                <TabsList className="mb-4">
                    <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
                    <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
                    <TabsTrigger value="all">All ({approvals.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="pending">{renderTable(pending)}</TabsContent>
                <TabsContent value="approved">{renderTable(approved)}</TabsContent>
                <TabsContent value="rejected">{renderTable(rejected)}</TabsContent>
                <TabsContent value="all">{renderTable(approvals)}</TabsContent>
            </Tabs>

            <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Review Approval Request</DialogTitle></DialogHeader>
                    {selected && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div><p className="text-xs text-muted-foreground">Collateral</p><p className="font-medium">{selected.collateral_ref}</p></div>
                                <div><p className="text-xs text-muted-foreground">Type</p><p className="font-medium capitalize">{(selected.request_type || '').replace(/_/g, ' ')}</p></div>
                                <div><p className="text-xs text-muted-foreground">Loan Amount</p><p className="font-medium">{selected.loan_amount ? `₹${Number(selected.loan_amount).toLocaleString('en-IN')}` : '—'}</p></div>
                                <div><p className="text-xs text-muted-foreground">LTV</p><p className="font-medium">{selected.ltv_ratio ? `${selected.ltv_ratio}%` : '—'}</p></div>
                            </div>
                            <Textarea placeholder="Remarks..." value={remarks} onChange={e => setRemarks(e.target.value)} rows={3} />
                            <div className="flex gap-2">
                                <Button className="flex-1" onClick={() => handleAction('approved')}>
                                    <CheckCircle className="h-4 w-4 mr-2" />Approve
                                </Button>
                                <Button variant="destructive" className="flex-1" onClick={() => handleAction('rejected')}>
                                    <XCircle className="h-4 w-4 mr-2" />Reject
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
