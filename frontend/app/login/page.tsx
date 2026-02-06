'use client';

/**
 * Login Page
 */
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, TrendingUp } from 'lucide-react';

import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/toaster';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login({ email, password });
            toast('Welcome back!', { type: 'success' });
            router.push('/');
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Invalid email or password';
            setError(message);
            toast('Login failed', { description: message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 text-2xl font-bold">
                        <TrendingUp className="h-8 w-8 text-accent" />
                        <span className="text-foreground">ARTHA</span>
                    </div>
                    <p className="mt-2 text-foreground-secondary">
                        AI-Powered Trading Dashboard
                    </p>
                </div>

                {/* Login Card */}
                <div className="card">
                    <h1 className="text-xl font-semibold text-foreground mb-6">
                        Sign in to your account
                    </h1>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm text-foreground-secondary mb-1.5">
                                Email address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="you@example.com"
                                    className="w-full pl-10 pr-4 py-2.5"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm text-foreground-secondary mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-2.5"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                'w-full py-2.5 rounded-lg font-medium transition-colors',
                                'bg-accent text-white hover:bg-accent/90',
                                'disabled:opacity-50 disabled:cursor-not-allowed'
                            )}
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    {/* Register Link */}
                    <p className="mt-6 text-center text-sm text-foreground-secondary">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-accent hover:underline">
                            Create one
                        </Link>
                    </p>
                </div>

                {/* Demo Notice */}
                <p className="mt-4 text-center text-xs text-foreground-muted">
                    Paper trading only. All trades use virtual currency.
                </p>
            </div>
        </div>
    );
}
