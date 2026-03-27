import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
    const [authError, setAuthError] = useState(null);
    const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

    useEffect(() => {
        checkAppState();
    }, []);

    const checkAppState = async () => {
        try {
            setIsLoadingPublicSettings(true);
            setIsLoadingAuth(true);
            setAuthError(null);
            setAppPublicSettings({ auth_required: false });
            await checkUserAuth();
        } catch (error) {
            console.error('Unexpected error:', error);
            setUser(null);
            setIsAuthenticated(false);
            setIsLoadingPublicSettings(false);
            setIsLoadingAuth(false);
        }
    };

    const checkUserAuth = async () => {
        try {
            const currentUser = await base44.auth.me();
            setUser(currentUser);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('User auth check failed:', error);
            setIsAuthenticated(false);
            setUser(null);
            setAuthError(null);
        } finally {
            setIsLoadingAuth(false);
            setIsLoadingPublicSettings(false);
        }
    };

    const logout = (shouldRedirect = true) => {
        setUser(null);
        setIsAuthenticated(false);

        if (shouldRedirect) {
            // Use the SDK's logout method which handles token cleanup and redirect
            base44.auth.logout(window.location.href);
        } else {
            // Just remove the token without redirect
            base44.auth.logout();
        }
    };

    const navigateToLogin = () => {
        base44.auth.redirectToLogin(window.location.href);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isLoadingAuth,
            isLoadingPublicSettings,
            authError,
            appPublicSettings,
            logout,
            navigateToLogin,
            checkAppState
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
