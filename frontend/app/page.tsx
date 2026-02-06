'use client';

/**
 * Main Dashboard Page
 * Command Center layout with resizable panels
 */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Activity,
    BarChart3,
    DollarSign,
    TrendingUp,
    Wallet,
    Trophy,
    Search,
} from 'lucide-react';

import { useAuth } from '@/lib/auth';
import { usePortfolioSummary, usePositions, useLeaderboard } from '@/hooks';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { CommandPalette } from '@/components/layout/command-palette';
import { StatsCard } from '@/components/ui/stats-card';
import { PositionsTable } from '@/components/features/positions-table';
import { LeaderboardWidget } from '@/components/features/leaderboard-widget';
import { PredictionPanel } from '@/components/features/prediction-panel';
import { PriceChart } from '@/components/features/price-chart';
import { MarketContextCard } from '@/components/features/market-context-card';
import { TradeWidget } from '@/components/features/trade-widget';

export default function DashboardPage() {
    const router = useRouter();
    const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
    const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
    const [isCommandOpen, setIsCommandOpen] = useState(false);

    const { data: portfolioSummary, isLoading: isPortfolioLoading } = usePortfolioSummary();
    const { data: positions, isLoading: isPositionsLoading } = usePositions();
    const { data: leaderboard, isLoading: isLeaderboardLoading } = useLeaderboard();

    // Redirect to login if not authenticated
    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthLoading, isAuthenticated, router]);

    // Debugging API response
    console.log('Portfolio Summary:', portfolioSummary);
    console.log('Positions:', positions);

    // Validate data structure
    const isPortfolioValid = portfolioSummary && !('detail' in portfolioSummary);
    const isPositionsValid = positions && !('detail' in (positions as any)); // Type cast for error check

    if (!isAuthLoading && !isAuthenticated) {
        return null;
    }

    // Loading state
    if (isAuthLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-foreground-secondary">Loading ARTHA...</div>
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

                {/* Dashboard Content */}
                <main className="flex-1 overflow-auto p-4 md:p-6">
                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <StatsCard
                            title="Portfolio Value"
                            value={isPortfolioValid ? formatCurrency(portfolioSummary?.total_value || user?.paper_balance || 100000) : "Error"}
                            change={isPortfolioValid ? portfolioSummary?.total_pnl_percentage : 0}
                            icon={<Wallet className="h-5 w-5" />}
                            isLoading={isPortfolioLoading}
                        />
                        <StatsCard
                            title="Day P&L"
                            value={isPortfolioValid ? formatCurrency(portfolioSummary?.day_pnl || 0) : "N/A"}
                            change={isPortfolioValid ? portfolioSummary?.day_pnl_percentage : 0}
                            icon={<TrendingUp className="h-5 w-5" />}
                            isLoading={isPortfolioLoading}
                        />
                        <StatsCard
                            title="Total P&L"
                            value={isPortfolioValid ? formatCurrency(portfolioSummary?.total_pnl || 0) : "N/A"}
                            change={isPortfolioValid ? portfolioSummary?.total_pnl_percentage : 0}
                            icon={<BarChart3 className="h-5 w-5" />}
                            isLoading={isPortfolioLoading}
                        />
                        <StatsCard
                            title="Win Rate"
                            value={isPortfolioValid ? `${portfolioSummary?.win_rate || 0}%` : "N/A"}
                            icon={<Activity className="h-5 w-5" />}
                            isLoading={isPortfolioLoading}
                        />
                    </div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Predictions & Trading */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Symbol Selector */}
                            <div className="card flex items-center gap-4">
                                <button
                                    onClick={() => setIsCommandOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-background-tertiary rounded-lg hover:bg-background-elevated transition-colors"
                                >
                                    <Search className="h-4 w-4 text-foreground-muted" />
                                    <span className="text-foreground">Search stocks...</span>
                                    <kbd className="ml-4 px-2 py-0.5 text-xs bg-background rounded text-foreground-muted">
                                        ⌘K
                                    </kbd>
                                </button>
                                <div className="flex gap-2">
                                    {['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA'].map((sym) => (
                                        <button
                                            key={sym}
                                            onClick={() => setSelectedSymbol(sym)}
                                            className={cn(
                                                'px-3 py-1.5 rounded text-sm transition-colors',
                                                selectedSymbol === sym
                                                    ? 'bg-accent text-white'
                                                    : 'bg-background-tertiary text-foreground-secondary hover:bg-background-elevated'
                                            )}
                                        >
                                            {sym}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Prediction Panel */}
                            <PredictionPanel symbol={selectedSymbol} />

                            {/* Price Chart */}
                            <PriceChart symbol={selectedSymbol} />

                            {/* Market Context (The Why Widget) */}
                            <MarketContextCard symbol={selectedSymbol} />

                            {/* Positions Table */}
                            <div className="card">
                                <h2 className="text-heading font-semibold mb-4">Your Positions</h2>
                                <PositionsTable
                                    positions={positions?.positions || []}
                                    isLoading={isPositionsLoading}
                                    onSymbolClick={setSelectedSymbol}
                                />
                            </div>
                        </div>

                        {/* Right Column - Trading & Leaderboard */}
                        <div className="space-y-6">
                            {/* Trade Widget */}
                            <TradeWidget
                                symbol={selectedSymbol}
                                balance={user?.paper_balance || 100000}
                            />

                            {/* Leaderboard */}
                            <LeaderboardWidget
                                entries={leaderboard?.entries || []}
                                currentUserRank={leaderboard?.current_user_rank}
                                isLoading={isLeaderboardLoading}
                            />
                        </div>
                    </div>
                </main>
            </div>

            {/* Command Palette */}
            <CommandPalette
                isOpen={isCommandOpen}
                onClose={() => setIsCommandOpen(false)}
                onSymbolSelect={setSelectedSymbol}
            />
        </div>
    );
}
