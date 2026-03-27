import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, Archive, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import StatCard from '@/components/shared/StatCard';
import { format } from 'date-fns';

export default function DocumentVault() {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const { data: collaterals = [] } = useQuery({
        queryKey: ['collaterals'],
        queryFn: () => base44.entities.Collateral.list('-created_date', 200),
    });

    const allDocs = collaterals.flatMap(c =>
        (c.documents || []).map(d => ({
            ...d,
            collateral_id: c.collateral_id,
            borrower: c.borrower_name,
            collateral_type: c.type,
        }))
    );

    const filtered = allDocs.filter(d => {
        const matchSearch = !search || [d.name, d.collateral_id, d.borrower].some(f => (f || '').toLowerCase().includes(search.toLowerCase()));
        const matchType = typeFilter === 'all' || d.type === typeFilter;
        return matchSearch && matchType;
    });

    const docTypes = [...new Set(allDocs.map(d => d.type).filter(Boolean))];

    return (
        <div>
            <PageHeader title="Document Vault" description="Digital document storage & retrieval" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard title="Total Documents" value={allDocs.length} icon={FileText} />
                <StatCard title="Collaterals with Docs" value={collaterals.filter(c => c.documents?.length > 0).length} icon={Archive} />
                <StatCard title="Document Types" value={docTypes.length} icon={FileText} />
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="pl-9 h-9" />
                </div>
                {docTypes.length > 0 && (
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-48 h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {docTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {filtered.length === 0 ? (
                <EmptyState icon={Archive} title="No documents" description="Upload documents through collateral detail pages" />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {filtered.map((doc, i) => (
                        <Card key={i} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{doc.name}</p>
                                        <p className="text-xs text-muted-foreground">{doc.collateral_id} · {doc.borrower}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {doc.uploaded_date ? format(new Date(doc.uploaded_date), 'dd MMM yyyy') : 'No date'}
                                        </p>
                                    </div>
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-3.5 w-3.5" /></Button>
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}