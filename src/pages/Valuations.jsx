import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Scale } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import { format } from 'date-fns';

const formatINR = (v) => v ? `₹${Number(v).toLocaleString('en-IN')}` : '—';

export default function Valuations() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [search, setSearch] = useState('');
    const qc = useQueryClient();

    const { data: valuations = [] } = useQuery({
        queryKey: ['valuations'],
        queryFn: () => base44.entities.Valuation.list('-created_date', 200),
    });
    const { data: collaterals = [] } = useQuery({
        queryKey: ['collaterals'],
        queryFn: () => base44.entities.Collateral.list('-created_date', 200),
    });

    const [form, setForm] = useState({
        collateral_id: '', valuer_name: '', valuer_email: '',
        valuation_type: 'initial', market_value: '', distress_value: '', remarks: '',
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.Valuation.create(data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['valuations'] }); setDialogOpen(false); },
    });

    const handleCreate = () => {
        const col = collaterals.find(c => c.id === form.collateral_id);
        createMutation.mutate({
            ...form,
            market_value: parseFloat(form.market_value) || 0,
            distress_value: parseFloat(form.distress_value) || 0,
            collateral_ref: col?.collateral_id || '',
            valuation_date: new Date().toISOString().split('T')[0],
            status: 'pending',
        });
    };

    const filtered = valuations.filter(v => {
        if (!search) return true;
        return [v.collateral_ref, v.valuer_name].some(f => (f || '').toLowerCase().includes(search.toLowerCase()));
    });

    return (
        <div>
            <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search valuations..." className="pl-9 h-9" />
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="sm:ml-auto"><Plus className="h-4 w-4 mr-2" />New Valuation</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>Assign Valuation</DialogTitle></DialogHeader>
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Collateral</Label>
                                <Select value={form.collateral_id} onValueChange={v => setForm(p => ({ ...p, collateral_id: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select collateral" /></SelectTrigger>
                                    <SelectContent>
                                        {collaterals.map(c => <SelectItem key={c.id} value={c.id}>{c.collateral_id} — {c.borrower_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Valuer Name</Label>
                                    <Input value={form.valuer_name} onChange={e => setForm(p => ({ ...p, valuer_name: e.target.value }))} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Type</Label>
                                    <Select value={form.valuation_type} onValueChange={v => setForm(p => ({ ...p, valuation_type: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="initial">Initial</SelectItem>
                                            <SelectItem value="revaluation">Revaluation</SelectItem>
                                            <SelectItem value="avm">AVM</SelectItem>
                                            <SelectItem value="market_comparison">Market Comparison</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Market Value (₹)</Label>
                                    <Input type="number" value={form.market_value} onChange={e => setForm(p => ({ ...p, market_value: e.target.value }))} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Distress Value (₹)</Label>
                                    <Input type="number" value={form.distress_value} onChange={e => setForm(p => ({ ...p, distress_value: e.target.value }))} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Remarks</Label>
                                <Textarea value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} rows={2} />
                            </div>
                            <Button onClick={handleCreate} className="w-full">Submit Valuation</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {filtered.length === 0 ? (
                <EmptyState icon={Scale} title="No valuations" description="Assign a valuation to a collateral" />
            ) : (
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="text-xs">Collateral</TableHead>
                                    <TableHead className="text-xs">Valuer</TableHead>
                                    <TableHead className="text-xs">Type</TableHead>
                                    <TableHead className="text-xs">Market Value</TableHead>
                                    <TableHead className="text-xs">Distress Value</TableHead>
                                    <TableHead className="text-xs">Status</TableHead>
                                    <TableHead className="text-xs">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(v => (
                                    <TableRow key={v.id}>
                                        <TableCell className="text-xs font-mono">{v.collateral_ref || v.collateral_id}</TableCell>
                                        <TableCell className="text-xs">{v.valuer_name || '—'}</TableCell>
                                        <TableCell className="text-xs capitalize">{(v.valuation_type || '').replace(/_/g, ' ')}</TableCell>
                                        <TableCell className="text-xs font-medium">{formatINR(v.market_value)}</TableCell>
                                        <TableCell className="text-xs">{formatINR(v.distress_value)}</TableCell>
                                        <TableCell><StatusBadge status={v.status} /></TableCell>
                                        <TableCell className="text-xs">{v.valuation_date ? format(new Date(v.valuation_date), 'dd MMM yy') : '—'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            )}
        </div>
    );
}
