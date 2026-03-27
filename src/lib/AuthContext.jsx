import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        checkUserAuth();
    }, []);

    const checkUserAuth = async () => {
        try {
            setIsLoadingAuth(true);
            setAuthError(null);

            const token = base44.auth.getToken();
            if (!token) {
                setIsAuthenticated(false);
                setUser(null);
                setAuthError({ type: 'auth_required', message: 'Login required' });
                return;
            }

            const currentUser = await base44.auth.me();
            setUser(currentUser);
            setIsAuthenticated(true);
        } catch (error) {
            const fallbackMessage = error instanceof Error ? error.message : 'Login required';
            setAuthError({ type: 'auth_required', message: fallbackMessage });
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setIsLoadingAuth(false);
        }
    };

    const loginWithGoogle = async (credential) => {
        const response = await base44.auth.loginWithGoogle(credential);
        if (!response?.token || !response?.user) {
            throw new Error('Invalid login response from server');
        }

        base44.auth.setToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        setAuthError(null);
        return response.user;
    };

    const loginWithPassword = async (email, password) => {
        const response = await base44.auth.loginWithPassword({ email, password });
        if (!response?.token || !response?.user) {
            throw new Error('Invalid login response from server');
        }

        base44.auth.setToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        setAuthError(null);
        return response.user;
    };

    const logout = (shouldRedirect = true) => {
        setUser(null);
        setIsAuthenticated(false);

        if (shouldRedirect) {
            base44.auth.logout();
        } else {
            base44.auth.setToken('');
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
            }
        }
    };

    const navigateToLogin = () => {
        base44.auth.redirectToLogin();
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isLoadingAuth,
            authError,
            logout,
            loginWithGoogle,
            loginWithPassword,
            navigateToLogin,
            checkUserAuth,
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
