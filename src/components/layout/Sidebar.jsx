import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Shield, FileCheck, Scale, AlertTriangle,
    CheckSquare, Archive, BarChart3, Users, Building2,
    ChevronLeft, ChevronRight, LogOut, RefreshCw
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/collaterals', label: 'Collaterals', icon: Shield },
    { path: '/legal', label: 'Legal Due Diligence', icon: FileCheck },
    { path: '/valuations', label: 'Valuations', icon: Scale },
    { path: '/risk', label: 'Risk Engine', icon: AlertTriangle },
    { path: '/approvals', label: 'Approvals', icon: CheckSquare },
    { path: '/vault', label: 'Document Vault', icon: Archive },
    { path: '/monitoring', label: 'Monitoring', icon: RefreshCw },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    { path: '/users', label: 'Users & Audit', icon: Users },
    { path: '/branches', label: 'Branches', icon: Building2 },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    return (
        <aside className={cn(
            "fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground z-40 transition-all duration-300 flex flex-col",
            collapsed ? "w-16" : "w-[19rem]"
        )}>
            <div className="flex items-center gap-3 px-5 h-[4.5rem] border-b border-sidebar-border shrink-0">
                <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
                    <Shield className="h-4 w-4 text-sidebar-primary-foreground" />
                </div>
                {!collapsed && (
                    <div className="min-w-0 overflow-hidden flex-1">
                        <h1 className="text-[1.02rem] font-bold tracking-tight whitespace-nowrap">Unified Collateral Intelligence</h1>
                        <p className="text-xs text-sidebar-foreground/60 uppercase tracking-widest">UCIP</p>
                    </div>
                )}
            </div>

            <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
                {navItems.map(item => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path));
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                                isActive
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                            )}
                        >
                            <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-sidebar-primary")} />
                            {!collapsed && <span className="truncate">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className={cn(
                "p-2 border-t border-sidebar-border",
                collapsed ? "space-y-1" : "flex items-center gap-1"
            )}>
                <button
                    onClick={() => base44.auth.logout()}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors",
                        collapsed ? "w-full" : "flex-1"
                    )}
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>Sign Out</span>}
                </button>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn(
                        "flex items-center justify-center rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors",
                        collapsed ? "w-full py-1.5" : "w-9 h-9 shrink-0"
                    )}
                >
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
            </div>
        </aside>
    );
}
