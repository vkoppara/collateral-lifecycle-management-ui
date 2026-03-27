import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from '@/components/layout/AppLayout';

// Page imports
import Dashboard from './pages/Dashboard';
import Collaterals from './pages/Collaterals';
import CollateralDetail from './pages/CollateralDetail';
import LegalDueDiligence from './pages/LegalDueDiligence';
import Valuations from './pages/Valuations';
import RiskEngine from './pages/RiskEngine';
import Approvals from './pages/Approvals';
import DocumentVault from './pages/DocumentVault';
import Monitoring from './pages/Monitoring';
import Reports from './pages/Reports';
import UsersAudit from './pages/UsersAudit';
import Branches from './pages/Branches';

const AuthenticatedApp = () => {
    const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

    if (isLoadingPublicSettings || isLoadingAuth) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
                    <p className="text-xs text-muted-foreground">Loading CollateralOS...</p>
                </div>
            </div>
        );
    }

    if (authError) {
        if (authError.type === 'user_not_registered') {
            return <UserNotRegisteredError />;
        } else if (authError.type === 'auth_required') {
            navigateToLogin();
            return null;
        }
    }

    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/collaterals" element={<Collaterals />} />
                <Route path="/collaterals/:id" element={<CollateralDetail />} />
                <Route path="/legal" element={<LegalDueDiligence />} />
                <Route path="/valuations" element={<Valuations />} />
                <Route path="/risk" element={<RiskEngine />} />
                <Route path="/approvals" element={<Approvals />} />
                <Route path="/vault" element={<DocumentVault />} />
                <Route path="/monitoring" element={<Monitoring />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/users" element={<UsersAudit />} />
                <Route path="/branches" element={<Branches />} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
        </Routes>
    );
};

function App() {
    return (
        <AuthProvider>
            <QueryClientProvider client={queryClientInstance}>
                <Router basename={import.meta.env.BASE_URL}>
                    <AuthenticatedApp />
                </Router>
                <Toaster />
            </QueryClientProvider>
        </AuthProvider>
    )
}

export default App
