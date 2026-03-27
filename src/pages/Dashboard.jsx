import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Shield, IndianRupee, AlertTriangle, CheckCircle } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import PortfolioChart from '@/components/dashboard/PortfolioChart';
import LTVDistribution from '@/components/dashboard/LTVDistribution';
import RecentActivity from '@/components/dashboard/RecentActivity';
import AlertsPanel from '@/components/dashboard/AlertsPanel';

export default function Dashboard() {
    const { data: collaterals = [] } = useQuery({
        queryKey: ['collaterals'],
        queryFn: () => base44.entities.Collateral.list('-created_date', 200),
    });
    const { data: approvals = [] } = useQuery({
        queryKey: ['approvals'],
        queryFn: () => base44.entities.ApprovalRequest.list('-created_date', 50),
    });
    const { data: logs = [] } = useQuery({
        queryKey: ['audit-logs-recent'],
        queryFn: () => base44.entities.AuditLog.list('-created_date', 20),
    });

    const totalValue = collaterals.reduce((s, c) => s + (c.market_value || 0), 0);
    const totalLoan = collaterals.reduce((s, c) => s + (c.loan_amount || 0), 0);
    const activeCount = collaterals.filter(c => c.status === 'active' || c.status === 'approved').length;
    const pendingApprovals = approvals.filter(a => a.status === 'pending').length;

    const formatINR = (v) => {
        if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
        if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
        return `₹${v.toLocaleString('en-IN')}`;
    };

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <StatCard title="Total Collaterals" value={collaterals.length} subtitle={`${activeCount} active`} icon={Shield} />
                <StatCard title="Portfolio Value" value={formatINR(totalValue)} subtitle="Market value" icon={IndianRupee} />
                <StatCard title="Total Exposure" value={formatINR(totalLoan)} subtitle={`Avg LTV: ${collaterals.length ? (collaterals.reduce((s, c) => s + (c.ltv_ratio || 0), 0) / collaterals.length).toFixed(1) : 0}%`} icon={AlertTriangle} />
                <StatCard title="Pending Approvals" value={pendingApprovals} subtitle="Awaiting action" icon={CheckCircle} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                <PortfolioChart collaterals={collaterals} />
                <LTVDistribution collaterals={collaterals} />
                <AlertsPanel collaterals={collaterals} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <RecentActivity auditLogs={logs} />
            </div>
        </div>
    );
}
