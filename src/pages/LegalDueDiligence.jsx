import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, FileCheck } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import { format } from 'date-fns';

const DEFAULT_CHECKLIST = [
    { item: 'Title deed verification', status: 'pending', remarks: '' },
    { item: 'Encumbrance certificate (13 years)', status: 'pending', remarks: '' },
    { item: 'Revenue records verification', status: 'pending', remarks: '' },
    { item: 'Tax paid receipts', status: 'pending', remarks: '' },
    { item: 'NOC from housing society', status: 'pending', remarks: '' },
    { item: 'CERSAI search report', status: 'pending', remarks: '' },
    { item: 'Chain of ownership verification', status: 'pending', remarks: '' },
    { item: 'Physical verification of property', status: 'pending', remarks: '' },
];

export default function LegalDueDiligence() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [search, setSearch] = useState('');
    const qc = useQueryClient();

    const { data: checks = [], isLoading } = useQuery({
        queryKey: ['legal-checks'],
        queryFn: () => base44.entities.LegalCheck.list('-created_date', 200),
    });
    const { data: collaterals = [] } = useQuery({
        queryKey: ['collaterals'],
        queryFn: () => base44.entities.Collateral.list('-created_date', 200),
    });

    const [form, setForm] = useState({
        collateral_id: '', officer_name: '', officer_email: '',
        title_status: 'pending', encumbrance_status: 'pending', cersai_check: 'pending',
        overall_status: 'pending', remarks: '',
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.LegalCheck.create(data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['legal-checks'] }); setDialogOpen(false); },
    });

    const handleCreate = () => {
        const col = collaterals.find(c => c.id === form.collateral_id);
        createMutation.mutate({
            ...form,
            collateral_ref: col?.collateral_id || '',
            checklist: DEFAULT_CHECKLIST,
            verification_date: new Date().toISOString().split('T')[0],
        });
    };

    const filtered = checks.filter(c => {
        if (!search) return true;
        return [c.collateral_ref, c.officer_name].some(f => (f || '').toLowerCase().includes(search.toLowerCase()));
    });

    return (
        <div>
            <PageHeader title="Legal Due Diligence" description="Title verification & encumbrance checks">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-2" />New Legal Check</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>Initiate Legal Check</DialogTitle></DialogHeader>
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
                                    <Label className="text-xs">Legal Officer</Label>
                                    <Input value={form.officer_name} onChange={e => setForm(p => ({ ...p, officer_name: e.target.value }))} placeholder="Name" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Email</Label>
                                    <Input value={form.officer_email} onChange={e => setForm(p => ({ ...p, officer_email: e.target.value }))} placeholder="Email" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Remarks</Label>
                                <Textarea value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} rows={2} />
                            </div>
                            <Button onClick={handleCreate} className="w-full">Create Legal Check</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </PageHeader>

            <div className="mb-4">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search checks..." className="pl-9 h-9" />
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState icon={FileCheck} title="No legal checks" description="Initiate a legal check for a collateral" />
            ) : (
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="text-xs">Collateral</TableHead>
                                    <TableHead className="text-xs">Officer</TableHead>
                                    <TableHead className="text-xs">Title</TableHead>
                                    <TableHead className="text-xs">Encumbrance</TableHead>
                                    <TableHead className="text-xs">CERSAI</TableHead>
                                    <TableHead className="text-xs">Overall</TableHead>
                                    <TableHead className="text-xs">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(c => (
                                    <TableRow key={c.id}>
                                        <TableCell className="text-xs font-mono">{c.collateral_ref || c.collateral_id}</TableCell>
                                        <TableCell className="text-xs">{c.officer_name || '—'}</TableCell>
                                        <TableCell><StatusBadge status={c.title_status} /></TableCell>
                                        <TableCell><StatusBadge status={c.encumbrance_status} /></TableCell>
                                        <TableCell><StatusBadge status={c.cersai_check} /></TableCell>
                                        <TableCell><StatusBadge status={c.overall_status} /></TableCell>
                                        <TableCell className="text-xs">{c.verification_date ? format(new Date(c.verification_date), 'dd MMM yy') : '—'}</TableCell>
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