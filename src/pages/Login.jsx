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
    const { loginWithGoogle, loginWithPassword, registerWithPassword } = useAuth();
    const navigate = useNavigate();
    const buttonRef = useRef(null);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isPasswordSigningIn, setIsPasswordSigningIn] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [error, setError] = useState('');
    const [form, setForm] = useState({ fullName: '', email: '', password: '' });

    const extractErrorMessage = (authError, fallback) => {
        if (authError instanceof Error) {
            try {
                const parsed = JSON.parse(authError.message);
                if (parsed?.error) return parsed.error;
            } catch {
                return authError.message;
            }
            return authError.message;
        }

        return fallback;
    };

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

    const handleAuthSubmit = async (event) => {
        event.preventDefault();
        if (!form.email || !form.password) {
            setError('Email and password are required.');
            return;
        }

        if (authMode === 'register' && !form.fullName.trim()) {
            setError('Full name is required.');
            return;
        }

        setError('');
        setIsPasswordSigningIn(true);
        try {
            if (authMode === 'register') {
                await registerWithPassword({
                    fullName: form.fullName.trim(),
                    email: form.email.trim(),
                    password: form.password,
                });
            } else {
                await loginWithPassword(form.email.trim(), form.password);
            }
            navigate('/', { replace: true });
        } catch (authError) {
            const message = extractErrorMessage(
                authError,
                authMode === 'register' ? 'Registration failed. Please try again.' : 'Email login failed. Please try again.'
            );
            setError(message);
        } finally {
            setIsPasswordSigningIn(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent p-6">
            <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center">
                <div className="glass-panel-strong relative grid w-full grid-cols-1 overflow-hidden rounded-3xl lg:grid-cols-2">
                    <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 hidden h-[56%] w-px -translate-x-1/2 -translate-y-1/2 bg-slate-300/90 lg:block dark:bg-slate-600/80" />

                    <div className="relative z-10 bg-white/78 p-8 text-slate-900 backdrop-blur-xl md:p-10 dark:bg-slate-900/70 dark:text-slate-100">
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-700 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-200">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Secure Access
                        </div>

                        <h1 className="mt-6 text-3xl font-bold leading-tight text-slate-900 dark:text-white">Unified Collateral Intelligence</h1>
                        <p className="mt-3 max-w-md text-sm text-slate-700 dark:text-slate-200">
                            Sign in with your Google account to access protected dashboards, valuations, legal due diligence, and collateral workflows.
                        </p>

                        <div className="mt-8 space-y-4 text-sm text-slate-700 dark:text-slate-200">
                            <div className="flex items-start gap-3">
                                <LockKeyhole className="mt-0.5 h-4 w-4 text-sky-600 dark:text-sky-300" />
                                <p>All application pages are private and available only after authentication.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="mt-0.5 h-4 w-4 text-sky-600 dark:text-sky-300" />
                                <p>Google OAuth credentials are verified server-side before granting access.</p>
                            </div>
                        </div>
                    </div>

                    <CardContent className="relative z-10 flex flex-col items-center justify-center border-t border-slate-200/85 bg-white/88 p-8 backdrop-blur-xl md:p-10 lg:border-t-0 dark:border-slate-700/70 dark:bg-slate-900/60">
                        <div className="w-full max-w-sm text-center">
                            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                {authMode === 'register' ? 'Create Account' : 'Welcome Back'}
                            </h2>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                {authMode === 'register'
                                    ? 'Register with your work details, or continue with Google.'
                                    : 'Sign in with email/password or continue with Google.'}
                            </p>

                            <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-slate-300/90 bg-white/80 p-1 dark:border-slate-700 dark:bg-slate-900/45">
                                <button
                                    type="button"
                                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${authMode === 'login'
                                        ? 'bg-sky-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70'}`}
                                    onClick={() => {
                                        setAuthMode('login');
                                        setError('');
                                    }}
                                >
                                    Sign In
                                </button>
                                <button
                                    type="button"
                                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${authMode === 'register'
                                        ? 'bg-sky-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70'}`}
                                    onClick={() => {
                                        setAuthMode('register');
                                        setError('');
                                    }}
                                >
                                    Register
                                </button>
                            </div>

                            <form className="mt-4 space-y-3" onSubmit={handleAuthSubmit}>
                                {authMode === 'register' && (
                                    <Input
                                        type="text"
                                        value={form.fullName}
                                        onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                                        placeholder="Full name"
                                        autoComplete="name"
                                        className="h-10 border-slate-200/80 bg-white/80 text-slate-900 placeholder:text-slate-500 focus-visible:ring-sky-400 dark:border-slate-700 dark:bg-slate-900/55 dark:text-slate-100"
                                    />
                                )}
                                <Input
                                    type="email"
                                    value={form.email}
                                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                                    placeholder="Work email"
                                    autoComplete="email"
                                    className="h-10 border-slate-200/80 bg-white/80 text-slate-900 placeholder:text-slate-500 focus-visible:ring-sky-400 dark:border-slate-700 dark:bg-slate-900/55 dark:text-slate-100"
                                />
                                <Input
                                    type="password"
                                    value={form.password}
                                    onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                                    placeholder="Password"
                                    autoComplete="current-password"
                                    className="h-10 border-slate-200/80 bg-white/80 text-slate-900 placeholder:text-slate-500 focus-visible:ring-sky-400 dark:border-slate-700 dark:bg-slate-900/55 dark:text-slate-100"
                                />
                                <Button type="submit" className="h-10 w-full bg-sky-600 text-white hover:bg-sky-500" disabled={isPasswordSigningIn || isSigningIn}>
                                    {isPasswordSigningIn
                                        ? (authMode === 'register' ? 'Creating account...' : 'Signing in...')
                                        : (authMode === 'register' ? 'Create Account' : 'Sign in with Email')}
                                </Button>
                            </form>

                            <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
                                <span className="h-px flex-1 bg-slate-300 dark:bg-slate-600" />
                                Or
                                <span className="h-px flex-1 bg-slate-300 dark:bg-slate-600" />
                            </div>

                            <div className="flex justify-center rounded-xl border border-slate-200 bg-white/85 px-3 py-2 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/50">
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
