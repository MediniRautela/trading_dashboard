'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy } from 'lucide-react';

import { useAuth } from '@/lib/auth';
import { useLeaderboard } from '@/hooks';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { CommandPalette } from '@/components/layout/command-palette';
import { LeaderboardWidget } from '@/components/features/leaderboard-widget';

export default function LeaderboardPage() {
    const router = useRouter();
    const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
    const [isCommandOpen, setIsCommandOpen] = useState(false);

    const { data: leaderboard, isLoading: isLeaderboardLoading } = useLeaderboard();

    // Redirect to login if not authenticated
    if (!isAuthLoading && !isAuthenticated) {
        router.push('/login');
        return null;
    }

    if (isAuthLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-foreground-secondary">Loading Leaderboard...</div>
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
                            <Trophy className="h-6 w-6 text-accent" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Community Leaderboard</h1>
                            <p className="text-sm text-foreground-secondary">Top performing traders by return percentage</p>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <LeaderboardWidget
                            entries={leaderboard?.entries || []}
                            currentUserRank={leaderboard?.current_user_rank}
                            isLoading={isLeaderboardLoading}
                        />
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
