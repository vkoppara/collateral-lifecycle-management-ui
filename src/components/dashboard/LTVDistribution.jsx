import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

export default function LTVDistribution({ collaterals }) {
    const ranges = [
        { range: '0-40%', min: 0, max: 40 },
        { range: '40-60%', min: 40, max: 60 },
        { range: '60-75%', min: 60, max: 75 },
        { range: '75-90%', min: 75, max: 90 },
        { range: '90%+', min: 90, max: 200 },
    ];

    const data = ranges.map(r => ({
        range: r.range,
        count: collaterals.filter(c => (c.ltv_ratio || 0) >= r.min && (c.ltv_ratio || 0) < r.max).length
    }));

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">LTV Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data} barSize={32}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                        <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="hsl(222, 47%, 20%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}