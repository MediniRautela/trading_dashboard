'use client';

/**
 * Portfolio Page
 * Detailed view of user holdings and performance
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Wallet,
    TrendingUp,
    BarChart3,
    Activity,
} from 'lucide-react';

import { useAuth } from '@/lib/auth';
import { usePortfolioSummary, usePositions } from '@/hooks';
import { formatCurrency } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { CommandPalette } from '@/components/layout/command-palette';
import { StatsCard } from '@/components/ui/stats-card';
import { PositionsTable } from '@/components/features/positions-table';

export default function PortfolioPage() {
    const router = useRouter();
    const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
    const [isCommandOpen, setIsCommandOpen] = useState(false);

    const { data: portfolioSummary, isLoading: isPortfolioLoading } = usePortfolioSummary();
    const { data: positions, isLoading: isPositionsLoading } = usePositions();

    // Redirect to login if not authenticated
    if (!isAuthLoading && !isAuthenticated) {
        router.push('/login');
        return null;
    }

    // Loading state
    if (isAuthLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-foreground-secondary">Loading Portfolio...</div>
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
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-4">Portfolio Overview</h1>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatsCard
                                title="Portfolio Value"
                                value={formatCurrency(portfolioSummary?.total_value || user?.paper_balance || 100000)}
                                change={portfolioSummary?.total_pnl_percentage}
                                icon={<Wallet className="h-5 w-5" />}
                                isLoading={isPortfolioLoading}
                            />
                            <StatsCard
                                title="Day P&L"
                                value={formatCurrency(portfolioSummary?.day_pnl || 0)}
                                change={portfolioSummary?.day_pnl_percentage}
                                icon={<TrendingUp className="h-5 w-5" />}
                                isLoading={isPortfolioLoading}
                            />
                            <StatsCard
                                title="Total P&L"
                                value={formatCurrency(portfolioSummary?.total_pnl || 0)}
                                change={portfolioSummary?.total_pnl_percentage}
                                icon={<BarChart3 className="h-5 w-5" />}
                                isLoading={isPortfolioLoading}
                            />
                            <StatsCard
                                title="Win Rate"
                                value={`${portfolioSummary?.win_rate || 0}%`}
                                icon={<Activity className="h-5 w-5" />}
                                isLoading={isPortfolioLoading}
                            />
                        </div>
                    </div>

                    {/* Positions Section */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-heading font-semibold">Holdings</h2>
                            <span className="text-sm text-foreground-secondary">
                                {positions?.positions?.length || 0} Positions
                            </span>
                        </div>
                        <PositionsTable
                            positions={positions?.positions || []}
                            isLoading={isPositionsLoading}
                            onSymbolClick={(symbol) => {
                                // Navigate to dashboard with symbol selected (optional enhancement for later)
                                // or show a modal. For now, we can just log it or do nothing.
                                console.log('Selected:', symbol);
                            }}
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
