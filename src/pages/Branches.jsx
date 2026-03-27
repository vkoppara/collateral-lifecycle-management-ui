import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Building2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';

export default function Branches() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const qc = useQueryClient();

    const { data: branches = [] } = useQuery({
        queryKey: ['branches'],
        queryFn: () => base44.entities.Branch.list('-created_date', 100),
    });

    const [form, setForm] = useState({ name: '', code: '', city: '', state: '', region: '', manager_email: '' });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.Branch.create(data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['branches'] }); setDialogOpen(false); setForm({ name: '', code: '', city: '', state: '', region: '', manager_email: '' }); },
    });

    return (
        <div>
            <PageHeader title="Branch Management" description="Manage multi-branch hierarchy">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4 mr-2" />Add Branch</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader><DialogTitle>Add Branch</DialogTitle></DialogHeader>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Branch Name</Label>
                                    <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Code</Label>
                                    <Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="e.g. MUM-01" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">City</Label>
                                    <Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">State</Label>
                                    <Input value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Region</Label>
                                    <Input value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Manager Email</Label>
                                    <Input value={form.manager_email} onChange={e => setForm(p => ({ ...p, manager_email: e.target.value }))} />
                                </div>
                            </div>
                            <Button onClick={() => createMutation.mutate(form)} className="w-full">Create Branch</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </PageHeader>

            {branches.length === 0 ? (
                <EmptyState icon={Building2} title="No branches" description="Add your first branch" />
            ) : (
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="text-xs">Code</TableHead>
                                    <TableHead className="text-xs">Name</TableHead>
                                    <TableHead className="text-xs">City</TableHead>
                                    <TableHead className="text-xs">State</TableHead>
                                    <TableHead className="text-xs">Region</TableHead>
                                    <TableHead className="text-xs">Manager</TableHead>
                                    <TableHead className="text-xs">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {branches.map(b => (
                                    <TableRow key={b.id}>
                                        <TableCell className="text-xs font-mono font-medium">{b.code}</TableCell>
                                        <TableCell className="text-xs font-medium">{b.name}</TableCell>
                                        <TableCell className="text-xs">{b.city || '—'}</TableCell>
                                        <TableCell className="text-xs">{b.state || '—'}</TableCell>
                                        <TableCell className="text-xs">{b.region || '—'}</TableCell>
                                        <TableCell className="text-xs">{b.manager_email || '—'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={b.active !== false ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-600'}>
                                                {b.active !== false ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
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