import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['hsl(222, 47%, 20%)', 'hsl(38, 92%, 50%)', 'hsl(160, 60%, 45%)', 'hsl(280, 65%, 60%)'];

export default function PortfolioChart({ collaterals }) {
    const typeData = ['property', 'gold', 'vehicle'].map(type => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: collaterals.filter(c => c.type === type).length
    })).filter(d => d.value > 0);

    if (typeData.length === 0) {
        typeData.push({ name: 'No Data', value: 1 });
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Portfolio by Type</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                        <Pie data={typeData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                            {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v) => [`${v} collaterals`]} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}