import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const GOOGLE_SCRIPT_ID = 'google-identity-script';

const getGoogleClientId = () => import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Login() {
    const { loginWithGoogle, loginWithPassword } = useAuth();
    const navigate = useNavigate();
    const buttonRef = useRef(null);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isPasswordSigningIn, setIsPasswordSigningIn] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ email: '', password: '' });

    useEffect(() => {
        const clientId = getGoogleClientId();
        if (!clientId) {
            setError('Google OAuth is not configured. Set VITE_GOOGLE_CLIENT_ID.');
            return;
        }

        const initializeGoogle = () => {
            if (!window.google || !buttonRef.current) return;

            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: async ({ credential }) => {
                    if (!credential) {
                        setError('Google sign-in did not return a credential. Please retry.');
                        return;
                    }

                    setIsSigningIn(true);
                    setError('');

                    try {
                        await loginWithGoogle(credential);
                        navigate('/', { replace: true });
                    } catch (authError) {
                        const message = authError instanceof Error ? authError.message : 'Google login failed. Please try again.';
                        setError(message);
                    } finally {
                        setIsSigningIn(false);
                    }
                },
            });

            buttonRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(buttonRef.current, {
                theme: 'outline',
                size: 'large',
                width: 320,
                shape: 'pill',
                text: 'continue_with',
            });
        };

        if (window.google) {
            initializeGoogle();
            return;
        }

        const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
        if (existingScript) {
            existingScript.addEventListener('load', initializeGoogle);
            return () => existingScript.removeEventListener('load', initializeGoogle);
        }

        const script = document.createElement('script');
        script.id = GOOGLE_SCRIPT_ID;
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogle;
        document.head.appendChild(script);

        return () => script.removeEventListener('load', initializeGoogle);
    }, [loginWithGoogle, navigate]);

    const handlePasswordLogin = async (event) => {
        event.preventDefault();
        if (!form.email || !form.password) {
            setError('Email and password are required.');
            return;
        }

        setError('');
        setIsPasswordSigningIn(true);
        try {
            await loginWithPassword(form.email.trim(), form.password);
            navigate('/', { replace: true });
        } catch (authError) {
            const message = authError instanceof Error ? authError.message : 'Email login failed. Please try again.';
            setError(message);
        } finally {
            setIsPasswordSigningIn(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-amber-50 p-6">
            <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center">
                <div className="grid w-full grid-cols-1 overflow-hidden rounded-2xl border bg-card shadow-xl lg:grid-cols-2">
                    <div className="bg-sidebar p-8 text-sidebar-foreground md:p-10">
                        <div className="inline-flex items-center gap-2 rounded-full border border-sidebar-border bg-sidebar-accent px-3 py-1 text-xs uppercase tracking-[0.18em] text-sidebar-foreground/80">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Secure Access
                        </div>

                        <h1 className="mt-6 text-3xl font-bold leading-tight">Unified Collateral Intelligence</h1>
                        <p className="mt-3 max-w-md text-sm text-sidebar-foreground/80">
                            Sign in with your Google account to access protected dashboards, valuations, legal due diligence, and collateral workflows.
                        </p>

                        <div className="mt-8 space-y-4 text-sm text-sidebar-foreground/80">
                            <div className="flex items-start gap-3">
                                <LockKeyhole className="mt-0.5 h-4 w-4 text-sidebar-primary" />
                                <p>All application pages are private and available only after authentication.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="mt-0.5 h-4 w-4 text-sidebar-primary" />
                                <p>Google OAuth credentials are verified server-side before granting access.</p>
                            </div>
                        </div>
                    </div>

                    <CardContent className="flex flex-col items-center justify-center p-8 md:p-10">
                        <div className="w-full max-w-sm text-center">
                            <h2 className="text-2xl font-semibold">Welcome Back</h2>
                            <p className="mt-2 text-sm text-muted-foreground">Sign in with email/password or continue with Google.</p>

                            <form className="mt-8 space-y-3" onSubmit={handlePasswordLogin}>
                                <Input
                                    type="email"
                                    value={form.email}
                                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                                    placeholder="Work email"
                                    autoComplete="email"
                                    className="h-10"
                                />
                                <Input
                                    type="password"
                                    value={form.password}
                                    onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                                    placeholder="Password"
                                    autoComplete="current-password"
                                    className="h-10"
                                />
                                <Button type="submit" className="w-full h-10" disabled={isPasswordSigningIn || isSigningIn}>
                                    {isPasswordSigningIn ? 'Signing in...' : 'Sign in with Email'}
                                </Button>
                            </form>

                            <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                <span className="h-px flex-1 bg-border" />
                                Or
                                <span className="h-px flex-1 bg-border" />
                            </div>

                            <div className="flex justify-center">
                                <div ref={buttonRef} className="min-h-10" />
                            </div>

                            {isSigningIn && <p className="mt-4 text-xs text-muted-foreground">Signing you in...</p>}

                            {error && (
                                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-left">
                                    <p className="flex items-start gap-2 text-xs text-red-700">
                                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                        {error}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </div>
            </div>
        </div>
    );
}
