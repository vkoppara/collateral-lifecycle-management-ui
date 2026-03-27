import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { BarChart3 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';

const COLORS = ['hsl(222, 47%, 20%)', 'hsl(38, 92%, 50%)', 'hsl(160, 60%, 45%)', 'hsl(280, 65%, 60%)', 'hsl(340, 75%, 55%)'];
const formatINR = (v) => {
    if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    return `₹${v.toLocaleString('en-IN')}`;
};

export default function Reports() {
    const { data: collaterals = [] } = useQuery({
        queryKey: ['collaterals'],
        queryFn: () => base44.entities.Collateral.list('-created_date', 200),
    });

    // Branch performance
    const branchData = {};
    collaterals.forEach(c => {
        const b = c.branch || 'Unassigned';
        if (!branchData[b]) branchData[b] = { count: 0, value: 0, loanAmt: 0 };
        branchData[b].count++;
        branchData[b].value += c.market_value || 0;
        branchData[b].loanAmt += c.loan_amount || 0;
    });
    const branchChart = Object.entries(branchData).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.value - a.value).slice(0, 10);

    // Status distribution
    const statusData = {};
    collaterals.forEach(c => {
        const s = c.status || 'draft';
        statusData[s] = (statusData[s] || 0) + 1;
    });
    const statusChart = Object.entries(statusData).map(([name, value]) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value
    }));

    // State-wise exposure
    const stateData = {};
    collaterals.forEach(c => {
        const s = c.state || 'Unknown';
        if (!stateData[s]) stateData[s] = { value: 0, count: 0 };
        stateData[s].value += c.market_value || 0;
        stateData[s].count++;
    });
    const stateChart = Object.entries(stateData).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.value - a.value).slice(0, 8);

    const totalValue = collaterals.reduce((s, c) => s + (c.market_value || 0), 0);
    const totalLoan = collaterals.reduce((s, c) => s + (c.loan_amount || 0), 0);

    return (
        <div>
            <PageHeader title="Reports & Analytics" description="Portfolio analysis & regulatory reporting" />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <StatCard title="Total Portfolio" value={formatINR(totalValue)} icon={BarChart3} />
                <StatCard title="Total Exposure" value={formatINR(totalLoan)} />
                <StatCard title="Collateral Count" value={collaterals.length} />
                <StatCard title="Branches" value={Object.keys(branchData).length} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Branch Performance (by Value)</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={branchChart} barSize={28}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
                                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => formatINR(v)} />
                                <Tooltip formatter={(v) => formatINR(v)} />
                                <Bar dataKey="value" fill="hsl(222, 47%, 20%)" radius={[3, 3, 0, 0]} name="Portfolio Value" />
                                <Bar dataKey="loanAmt" fill="hsl(38, 92%, 50%)" radius={[3, 3, 0, 0]} name="Loan Amount" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Status Distribution</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie data={statusChart} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                                    {statusChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">State-wise Exposure</CardTitle></CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={stateChart} barSize={36}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => formatINR(v)} />
                            <Tooltip formatter={(v) => formatINR(v)} />
                            <Bar dataKey="value" fill="hsl(160, 60%, 45%)" radius={[4, 4, 0, 0]} name="Market Value" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}