import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Upload, FileText, AlertTriangle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import StatusBadge from '@/components/shared/StatusBadge';
import { format } from 'date-fns';

const formatINR = (v) => v ? `₹${Number(v).toLocaleString('en-IN')}` : '—';

export default function CollateralDetail() {
    const { id } = useParams();
    const qc = useQueryClient();

    const { data: collateral, isLoading } = useQuery({
        queryKey: ['collateral', id],
        queryFn: async () => {
            const list = await base44.entities.Collateral.list('-created_date', 200);
            return list.find(c => c.id === id);
        },
        enabled: !!id,
    });

    const { data: valuations = [] } = useQuery({
        queryKey: ['valuations-all'],
        queryFn: () => base44.entities.Valuation.list('-created_date', 100),
    });

    const { data: legalChecks = [] } = useQuery({
        queryKey: ['legal-checks-all'],
        queryFn: () => base44.entities.LegalCheck.list('-created_date', 100),
    });

    const { data: approvals = [] } = useQuery({
        queryKey: ['approvals-all'],
        queryFn: () => base44.entities.ApprovalRequest.list('-created_date', 100),
    });

    const updateMutation = useMutation({
        mutationFn: (data) => base44.entities.Collateral.update(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['collateral', id] }),
    });

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            const docs = [...(collateral.documents || []), { name: file.name, url: file_url, type: file.type, uploaded_date: new Date().toISOString() }];
            updateMutation.mutate({ documents: docs });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to upload file.';
            window.alert(message);
        } finally {
            e.target.value = '';
        }
    };

    if (isLoading || !collateral) {
        return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
    }

    return (
        <div>
            <div className="mb-4">
                <Link to="/collaterals" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-3 w-3" /> Back to Registry
                </Link>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
                <StatusBadge status={collateral.status} />
                <StatusBadge status={collateral.risk_level} />
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="valuations">Valuations ({valuations.filter(v => v.collateral_id === id || v.collateral_ref === collateral?.collateral_id).length})</TabsTrigger>
                    <TabsTrigger value="legal">Legal ({legalChecks.filter(l => l.collateral_id === id || l.collateral_ref === collateral?.collateral_id).length})</TabsTrigger>
                    <TabsTrigger value="approvals">Approvals ({approvals.filter(a => a.collateral_id === id || a.collateral_ref === collateral?.collateral_id).length})</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm">Collateral Details</CardTitle></CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="grid grid-cols-2 gap-3">
                                    <div><p className="text-xs text-muted-foreground">Type</p><p className="font-medium capitalize">{collateral.type}</p></div>
                                    <div><p className="text-xs text-muted-foreground">Sub Type</p><p className="font-medium">{collateral.sub_type || '—'}</p></div>
                                    <div><p className="text-xs text-muted-foreground">Market Value</p><p className="font-medium">{formatINR(collateral.market_value)}</p></div>
                                    <div><p className="text-xs text-muted-foreground">Distress Value</p><p className="font-medium">{formatINR(collateral.distress_value)}</p></div>
                                    <div><p className="text-xs text-muted-foreground">Loan Amount</p><p className="font-medium">{formatINR(collateral.loan_amount)}</p></div>
                                    <div><p className="text-xs text-muted-foreground">LTV Ratio</p><p className="font-bold text-lg">{collateral.ltv_ratio ? `${collateral.ltv_ratio}%` : '—'}</p></div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-sm">Location & Legal</CardTitle></CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="grid grid-cols-2 gap-3">
                                    <div><p className="text-xs text-muted-foreground">Address</p><p className="font-medium">{collateral.address || '—'}</p></div>
                                    <div><p className="text-xs text-muted-foreground">City / State</p><p className="font-medium">{[collateral.city, collateral.state].filter(Boolean).join(', ') || '—'}</p></div>
                                    <div><p className="text-xs text-muted-foreground">Legal Status</p><StatusBadge status={collateral.legal_status} /></div>
                                    <div><p className="text-xs text-muted-foreground">CERSAI</p><p className="font-medium">{collateral.cersai_registered ? `✓ ${collateral.cersai_id || 'Registered'}` : 'Not registered'}</p></div>
                                    <div><p className="text-xs text-muted-foreground">Insurance Expiry</p><p className="font-medium">{collateral.insurance_expiry ? format(new Date(collateral.insurance_expiry), 'dd MMM yyyy') : '—'}</p></div>
                                    <div><p className="text-xs text-muted-foreground">Next Revaluation</p><p className="font-medium">{collateral.next_revaluation_date ? format(new Date(collateral.next_revaluation_date), 'dd MMM yyyy') : '—'}</p></div>
                                </div>
                                {collateral.fraud_flags && collateral.fraud_flags.length > 0 && (
                                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-xs font-semibold text-red-700 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Fraud Flags</p>
                                        <ul className="mt-1 space-y-1">{collateral.fraud_flags.map((f, i) => <li key={i} className="text-xs text-red-600">• {f}</li>)}</ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {(() => {
                        const parts = [collateral.address, collateral.city, collateral.state, collateral.pincode].filter(Boolean);
                        if (parts.length === 0) return null;
                        const q = encodeURIComponent(parts.join(', '));
                        return (
                            <div className="mt-4">
                                <Card>
                                    <CardHeader className="pb-2"><CardTitle className="text-sm">Location on Map</CardTitle></CardHeader>
                                    <CardContent className="p-0">
                                        <div className="rounded-b-lg overflow-hidden h-64 w-full">
                                            <iframe
                                                title="collateral-map"
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                loading="lazy"
                                                src={`https://maps.google.com/maps?q=${q}&output=embed&z=15`}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })()}
                </TabsContent>

                <TabsContent value="documents">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm">Documents</CardTitle>
                            <label>
                                <input type="file" className="hidden" onChange={handleFileUpload} />
                                <Button variant="outline" size="sm" asChild><span><Upload className="h-3 w-3 mr-1" />Upload</span></Button>
                            </label>
                        </CardHeader>
                        <CardContent>
                            {(!collateral.documents || collateral.documents.length === 0) ? (
                                <p className="text-xs text-muted-foreground py-8 text-center">No documents uploaded yet</p>
                            ) : (
                                <div className="space-y-2">
                                    {collateral.documents.map((doc, i) => (
                                        <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                            <FileText className="h-4 w-4 text-primary shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate">{doc.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{doc.uploaded_date ? format(new Date(doc.uploaded_date), 'dd MMM yyyy') : ''}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="valuations">
                    <Card>
                        <CardContent className="pt-6">
                            {(() => {
                                const vFiltered = valuations.filter(v => v.collateral_ref === collateral?.collateral_id);
                                return vFiltered.length === 0 ? (
                                    <p className="text-xs text-muted-foreground py-8 text-center">No valuations recorded</p>
                                ) : (
                                    <div className="space-y-3">
                                        {vFiltered.map(v => (
                                            <div key={v.id} className="p-4 border rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-sm font-medium">{v.valuer_name || 'Unknown Valuer'}</p>
                                                    <StatusBadge status={v.status} />
                                                </div>
                                                <div className="grid grid-cols-3 gap-3 text-xs">
                                                    <div><p className="text-muted-foreground">Market Value</p><p className="font-medium">{formatINR(v.market_value)}</p></div>
                                                    <div><p className="text-muted-foreground">Distress Value</p><p className="font-medium">{formatINR(v.distress_value)}</p></div>
                                                    <div><p className="text-muted-foreground">Date</p><p className="font-medium">{v.valuation_date ? format(new Date(v.valuation_date), 'dd MMM yyyy') : '—'}</p></div>
                                                </div>
                                                {v.remarks && <p className="text-xs text-muted-foreground mt-2">{v.remarks}</p>}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="legal">
                    <Card>
                        <CardContent className="pt-6">
                            {(() => {
                                const lFiltered = legalChecks.filter(l => l.collateral_ref === collateral?.collateral_id); return lFiltered.length === 0 ? (
                                    <p className="text-xs text-muted-foreground py-8 text-center">No legal checks recorded</p>
                                ) : (
                                    <div className="space-y-3">
                                        {lFiltered.map(l => (
                                            <div key={l.id} className="p-4 border rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-sm font-medium">{l.officer_name || 'Legal Officer'}</p>
                                                    <StatusBadge status={l.overall_status} />
                                                </div>
                                                <div className="grid grid-cols-3 gap-3 text-xs">
                                                    <div><p className="text-muted-foreground">Title</p><StatusBadge status={l.title_status} /></div>
                                                    <div><p className="text-muted-foreground">Encumbrance</p><StatusBadge status={l.encumbrance_status} /></div>
                                                    <div><p className="text-muted-foreground">CERSAI</p><StatusBadge status={l.cersai_check} /></div>
                                                </div>
                                                {l.remarks && <p className="text-xs text-muted-foreground mt-2">{l.remarks}</p>}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="approvals">
                    <Card>
                        <CardContent className="pt-6">
                            {(() => {
                                const aFiltered = approvals.filter(a => a.collateral_ref === collateral?.collateral_id); return aFiltered.length === 0 ? (
                                    <p className="text-xs text-muted-foreground py-8 text-center">No approval requests</p>
                                ) : (
                                    <div className="space-y-3">
                                        {aFiltered.map(a => (
                                            <div key={a.id} className="p-4 border rounded-lg flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium capitalize">{a.request_type.replace(/_/g, ' ')}</p>
                                                    <p className="text-xs text-muted-foreground">Level {a.level || 1} · {a.requested_by || 'System'}</p>
                                                </div>
                                                <StatusBadge status={a.status} />
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
