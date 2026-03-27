import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/shared/PageHeader';
import CollateralTable from '@/components/collaterals/CollateralTable';
import CollateralForm from '@/components/collaterals/CollateralForm';

export default function Collaterals() {
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const qc = useQueryClient();

    const { data: collaterals = [], isLoading } = useQuery({
        queryKey: ['collaterals'],
        queryFn: () => base44.entities.Collateral.list('-created_date', 200),
    });
    const { data: borrowers = [] } = useQuery({
        queryKey: ['borrowers'],
        queryFn: () => base44.entities.Borrower.list('-created_date', 200),
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.Collateral.create(data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['collaterals'] }); setShowForm(false); },
    });

    const filtered = collaterals.filter(c => {
        const matchSearch = !search || [c.borrower_name, c.collateral_id, c.city].some(f => (f || '').toLowerCase().includes(search.toLowerCase()));
        const matchType = typeFilter === 'all' || c.type === typeFilter;
        const matchStatus = statusFilter === 'all' || c.status === statusFilter;
        return matchSearch && matchType && matchStatus;
    });

    if (isLoading) {
        return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
    }

    return (
        <div>
            <PageHeader title="Collateral Registry" description="Manage all collateral assets">
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus className="h-4 w-4 mr-2" />New Collateral
                </Button>
            </PageHeader>

            {showForm && (
                <div className="mb-6">
                    <CollateralForm
                        borrowers={borrowers}
                        onSubmit={(data) => createMutation.mutate(data)}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}

            <div className="flex flex-wrap gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search collaterals..." className="pl-9 h-9" />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="property">Property</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="vehicle">Vehicle</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="legal_check">Legal Check</SelectItem>
                        <SelectItem value="valuation">Valuation</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="npa">NPA</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <CollateralTable collaterals={filtered} />
        </div>
    );
}