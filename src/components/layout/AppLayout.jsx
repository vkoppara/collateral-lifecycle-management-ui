import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AppLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);

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
            <main className={cn("lg:ml-60 min-h-screen transition-all duration-300")}>
                {/* Mobile header */}
                <div className="lg:hidden flex items-center gap-3 p-4 border-b bg-card">
                    <button onClick={() => setMobileOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </button>
                    <h1 className="font-bold text-sm">CollateralOS</h1>
                </div>

                <div className="p-4 md:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}