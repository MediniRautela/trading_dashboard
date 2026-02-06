'use client';

/**
 * Register Page
 */
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, TrendingUp, User } from 'lucide-react';

import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/toaster';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate password match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password strength
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) {
            setError('Password must contain uppercase, lowercase, and a number');
            return;
        }

        setIsLoading(true);

        try {
            await register({ email, username, password });
            toast('Account created!', {
                description: 'Please sign in to continue.',
                type: 'success',
            });
            router.push('/login');
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Registration failed';
            setError(message);
            toast('Registration failed', { description: message, type: 'error' });
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
                        Start your trading journey
                    </p>
                </div>

                {/* Register Card */}
                <div className="card">
                    <h1 className="text-xl font-semibold text-foreground mb-6">
                        Create your account
                    </h1>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username */}
                        <div>
                            <label className="block text-sm text-foreground-secondary mb-1.5">
                                Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    minLength={3}
                                    maxLength={50}
                                    pattern="[a-zA-Z0-9_]+"
                                    placeholder="trader_123"
                                    className="w-full pl-10 pr-4 py-2.5"
                                />
                            </div>
                            <p className="mt-1 text-xs text-foreground-muted">
                                Letters, numbers, and underscores only
                            </p>
                        </div>

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
                                    minLength={8}
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
                            <p className="mt-1 text-xs text-foreground-muted">
                                Minimum 8 characters with uppercase, lowercase, and number
                            </p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm text-foreground-secondary mb-1.5">
                                Confirm password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2.5"
                                />
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
                            {isLoading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="mt-6 text-center text-sm text-foreground-secondary">
                        Already have an account?{' '}
                        <Link href="/login" className="text-accent hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>

                {/* Starting Balance Notice */}
                <p className="mt-4 text-center text-xs text-foreground-muted">
                    You'll start with $100,000 in virtual trading funds.
                </p>
            </div>
        </div>
    );
}
