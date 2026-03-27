import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Menu, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const notifications = [
    {
        id: 1,
        title: 'Valuation pending review',
        detail: 'Property COL-2026-0142 needs approver action.',
        time: '2m ago',
    },
    {
        id: 2,
        title: 'Insurance expiry alert',
        detail: 'Two collateral policies expire within 7 days.',
        time: '14m ago',
    },
    {
        id: 3,
        title: 'New legal check completed',
        detail: 'Legal diligence report uploaded for BRN-8821.',
        time: '1h ago',
    },
];

const pageHeaderMeta = [
    { matcher: /^\/$/, title: 'Dashboard', subtitle: 'Collateral portfolio overview & alerts' },
    { matcher: /^\/collaterals$/, title: 'Collateral Registry', subtitle: 'Manage all collateral assets' },
    { matcher: /^\/collaterals\/[^/]+$/, title: 'Collateral Details', subtitle: 'View documents, valuations, legal checks and approvals' },
    { matcher: /^\/legal$/, title: 'Legal Due Diligence', subtitle: 'Title verification & encumbrance checks' },
    { matcher: /^\/valuations$/, title: 'Technical Valuations', subtitle: 'Valuation management & market benchmarking' },
    { matcher: /^\/risk$/, title: 'Risk Engine', subtitle: 'LTV analysis, risk scoring & fraud detection' },
    { matcher: /^\/approvals$/, title: 'Approval Workflow', subtitle: 'Multi-level maker-checker approval system' },
    { matcher: /^\/vault$/, title: 'Document Vault', subtitle: 'Digital document storage & retrieval' },
    { matcher: /^\/monitoring$/, title: 'Monitoring & Revaluation', subtitle: 'Track expirations, revaluations & NPA alerts' },
    { matcher: /^\/reports$/, title: 'Reports & Analytics', subtitle: 'Portfolio analysis & regulatory reporting' },
    { matcher: /^\/users$/, title: 'Users & Audit Trail', subtitle: 'Role management & RBI-compliant audit logs' },
    { matcher: /^\/branches$/, title: 'Branch Management', subtitle: 'Manage multi-branch hierarchy' },
];

export default function AppLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const pageMeta = pageHeaderMeta.find((item) => item.matcher.test(location.pathname)) || {
        title: 'Unified Collateral Intelligence',
        subtitle: 'Manage and monitor collateral operations',
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Desktop sidebar */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
                    <div className="relative z-10">
                        <Sidebar />
                    </div>
                </div>
            )}

            {/* Main content */}
            <main className={cn("lg:ml-[19rem] min-h-screen transition-all duration-300")}>
                <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
                    <div className="flex h-[4.5rem] items-center gap-3 px-5 md:px-8 lg:px-10">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-input hover:bg-accent"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div className="min-w-0 flex-1 max-w-[36rem]">
                            <p className="text-base md:text-lg font-semibold leading-tight truncate">{pageMeta.title}</p>
                            <p className="text-sm text-muted-foreground truncate">{pageMeta.subtitle}</p>
                        </div>

                        <div className="ml-auto flex items-center gap-2 md:gap-3">
                            <div className="relative w-48 sm:w-64 md:w-80">
                                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input type="search" placeholder="Search..." className="h-9 pl-8" />
                            </div>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="icon" className="relative">
                                        <Bell className="h-4 w-4" />
                                        <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-red-500 px-1 text-[10px] leading-4 text-white">
                                            {notifications.length}
                                        </span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="w-80 p-0">
                                    <div className="border-b px-4 py-3">
                                        <p className="text-sm font-semibold">Notifications</p>
                                        <p className="text-xs text-muted-foreground">Recent platform updates</p>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.map((item) => (
                                            <div key={item.id} className="border-b last:border-b-0 px-4 py-3">
                                                <p className="text-sm font-medium">{item.title}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{item.detail}</p>
                                                <p className="text-[11px] text-muted-foreground mt-2">{item.time}</p>
                                            </div>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
