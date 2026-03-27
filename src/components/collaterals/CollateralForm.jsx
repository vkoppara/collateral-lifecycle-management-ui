import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const SUB_TYPES = {
    property: ['Residential', 'Commercial', 'Agricultural', 'Industrial', 'Plot'],
    gold: ['24K Gold', '22K Gold', '18K Gold', 'Gold Coins', 'Gold Biscuits'],
    vehicle: ['Car', 'Commercial Vehicle', 'Two-wheeler', 'Construction Equipment'],
};

export default function CollateralForm({ initial, onSubmit, onCancel }) {
    const [form, setForm] = useState(initial || {
        type: 'property', sub_type: '', borrower_id: '', borrower_name: '',
        description: '', address: '', city: '', state: '', pincode: '',
        market_value: '', distress_value: '', loan_amount: '', branch: '',
    });

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const [mapQuery, setMapQuery] = useState('');
    const debounceRef = useRef(null);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const parts = [form.address, form.city, form.state, form.pincode].filter(Boolean);
            if (parts.length > 0) setMapQuery(parts.join(', '));
            else setMapQuery('');
        }, 800);
        return () => clearTimeout(debounceRef.current);
    }, [form.address, form.city, form.state, form.pincode]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const mv = parseFloat(form.market_value) || 0;
        const la = parseFloat(form.loan_amount) || 0;
        const ltv = mv > 0 ? ((la / mv) * 100) : 0;
        onSubmit({
            ...form,
            market_value: mv,
            distress_value: parseFloat(form.distress_value) || 0,
            loan_amount: la,
            ltv_ratio: Math.round(ltv * 100) / 100,
            collateral_id: form.collateral_id || `COL-${Date.now().toString(36).toUpperCase()}`,
            status: form.status || 'draft',
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">{initial ? 'Edit Collateral' : 'Register New Collateral'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Collateral Type</Label>
                            <Select value={form.type} onValueChange={v => { set('type', v); set('sub_type', ''); }}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="property">Property</SelectItem>
                                    <SelectItem value="gold">Gold</SelectItem>
                                    <SelectItem value="vehicle">Vehicle</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Sub Type</Label>
                            <Select value={form.sub_type} onValueChange={v => set('sub_type', v)}>
                                <SelectTrigger><SelectValue placeholder="Select sub type" /></SelectTrigger>
                                <SelectContent>
                                    {(SUB_TYPES[form.type] || []).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Borrower</Label>
                            <Input value={form.borrower_name} onChange={e => set('borrower_name', e.target.value)} placeholder="Borrower name" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Address</Label>
                            <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full address" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">City</Label>
                            <Input value={form.city} onChange={e => set('city', e.target.value)} placeholder="City" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">State</Label>
                            <Input value={form.state} onChange={e => set('state', e.target.value)} placeholder="State" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Pincode</Label>
                            <Input value={form.pincode} onChange={e => set('pincode', e.target.value)} placeholder="Pincode" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Market Value (₹)</Label>
                            <Input type="number" value={form.market_value} onChange={e => set('market_value', e.target.value)} placeholder="0" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Distress Value (₹)</Label>
                            <Input type="number" value={form.distress_value} onChange={e => set('distress_value', e.target.value)} placeholder="0" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Loan Amount (₹)</Label>
                            <Input type="number" value={form.loan_amount} onChange={e => set('loan_amount', e.target.value)} placeholder="0" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Branch</Label>
                            <Input value={form.branch} onChange={e => set('branch', e.target.value)} placeholder="Branch name" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs">Description</Label>
                        <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Collateral details..." rows={3} />
                    </div>

                    {mapQuery && (
                        <div className="space-y-1.5">
                            <Label className="text-xs">Location Preview</Label>
                            <div className="rounded-lg overflow-hidden border h-56 w-full">
                                <iframe
                                    title="map-preview"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed&z=15`}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground">Showing: {mapQuery}</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
                        <Button type="submit">{initial ? 'Update' : 'Register Collateral'}</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
