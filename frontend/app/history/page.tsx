'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { History } from 'lucide-react';

import { useAuth } from '@/lib/auth';
import { useTradeHistory } from '@/hooks';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { CommandPalette } from '@/components/layout/command-palette';
import { TradeHistoryTable } from '@/components/features/trade-history-table';

export default function HistoryPage() {
    const router = useRouter();
    const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
    const [isCommandOpen, setIsCommandOpen] = useState(false);

    // In a real app we'd handle pagination state here
    const { data: historyData, isLoading: isHistoryLoading } = useTradeHistory(1, 50);

    // Redirect to login if not authenticated
    if (!isAuthLoading && !isAuthenticated) {
        router.push('/login');
        return null;
    }

    if (isAuthLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-foreground-secondary">Loading History...</div>
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
                            <History className="h-6 w-6 text-accent" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">Trade History</h1>
                    </div>

                    <div className="card">
                        <TradeHistoryTable
                            trades={historyData?.trades || []}
                            isLoading={isHistoryLoading}
                        />

                        {historyData?.total_count && historyData.total_count > 50 && (
                            <div className="mt-4 text-center text-sm text-foreground-secondary">
                                Showing recent 50 trades of {historyData.total_count}
                            </div>
                        )}
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
