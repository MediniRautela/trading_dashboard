'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, User, Mail, Calendar, Shield } from 'lucide-react';
import { format } from 'date-fns';

import { useAuth } from '@/lib/auth';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { CommandPalette } from '@/components/layout/command-palette';

export default function SettingsPage() {
    const router = useRouter();
    const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
    const [isCommandOpen, setIsCommandOpen] = useState(false);

    // Redirect to login if not authenticated
    if (!isAuthLoading && !isAuthenticated) {
        router.push('/login');
        return null;
    }

    if (isAuthLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-foreground-secondary">Loading Settings...</div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Sidebar */}
            <Sidebar className="hidden md:flex" />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <Header
                    user={user}
                    onCommandPaletteOpen={() => setIsCommandOpen(true)}
                />

                {/* Main */}
                <main className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-accent/10 rounded-lg">
                            <Settings className="h-6 w-6 text-accent" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                    </div>

                    <div className="max-w-2xl">
                        {/* Profile Section */}
                        <div className="card mb-6">
                            <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Profile</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-foreground-secondary mb-1 block">Username</label>
                                    <div className="flex items-center gap-3 p-3 bg-background-tertiary rounded-lg">
                                        <User className="h-4 w-4 text-foreground-muted" />
                                        <span className="text-foreground">{user?.username}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-foreground-secondary mb-1 block">Email</label>
                                    <div className="flex items-center gap-3 p-3 bg-background-tertiary rounded-lg">
                                        <Mail className="h-4 w-4 text-foreground-muted" />
                                        <span className="text-foreground">{user?.email}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-foreground-secondary mb-1 block">Member Since</label>
                                    <div className="flex items-center gap-3 p-3 bg-background-tertiary rounded-lg">
                                        <Calendar className="h-4 w-4 text-foreground-muted" />
                                        <span className="text-foreground">
                                            {user?.created_at ? format(new Date(user.created_at), 'MMMM d, yyyy') : '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Section (Placeholder) */}
                        <div className="card opacity-75">
                            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                                <h2 className="text-lg font-semibold">Security</h2>
                                <span className="text-xs bg-background-elevated px-2 py-0.5 rounded text-foreground-secondary">Coming Soon</span>
                            </div>

                            <div className="space-y-4">
                                <button className="w-full flex items-center justify-between p-3 bg-background-tertiary rounded-lg cursor-not-allowed">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-4 w-4 text-foreground-muted" />
                                        <span className="text-foreground-secondary">Change Password</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Command Palette */}
            <CommandPalette
                isOpen={isCommandOpen}
                onClose={() => setIsCommandOpen(false)}
                onSymbolSelect={() => { }}
            />
        </div>
    );
}
