'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, Wallet, Activity } from 'lucide-react';

import { useAuth } from '@/lib/auth';
import { usePortfolioSummary } from '@/hooks';
import { formatCurrency } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { CommandPalette } from '@/components/layout/command-palette';
import { StatsCard } from '@/components/ui/stats-card';
import { PriceChart } from '@/components/features/price-chart';
import { RiskAnalysisCard } from '@/components/features/risk-analysis-card';

export default function AnalyticsPage() {
    const router = useRouter();
    const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
    const [isCommandOpen, setIsCommandOpen] = useState(false);

    const { data: portfolioSummary, isLoading: isPortfolioLoading } = usePortfolioSummary();

    // Redirect to login if not authenticated
    if (!isAuthLoading && !isAuthenticated) {
        router.push('/login');
        return null;
    }

    if (isAuthLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-foreground-secondary">Loading Analytics...</div>
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
                            <BarChart3 className="h-6 w-6 text-accent" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
                            <p className="text-sm text-foreground-secondary">Performance metrics and portfolio analysis</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <StatsCard
                            title="Total Value"
                            value={formatCurrency(portfolioSummary?.total_value || user?.paper_balance || 100000)}
                            change={portfolioSummary?.total_pnl_percentage}
                            icon={<Wallet className="h-5 w-5" />}
                            isLoading={isPortfolioLoading}
                        />
                        <StatsCard
                            title="Win Rate"
                            value={`${portfolioSummary?.win_rate || 0}%`}
                            icon={<Activity className="h-5 w-5" />}
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
                            title="Day P&L"
                            value={formatCurrency(portfolioSummary?.day_pnl || 0)}
                            change={portfolioSummary?.day_pnl_percentage}
                            icon={<TrendingUp className="h-5 w-5" />}
                            isLoading={isPortfolioLoading}
                        />
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-foreground">Market Overview (SPY)</h3>
                            <PriceChart symbol="SPY" />
                        </div>

                        <div className="h-[400px]">
                            <RiskAnalysisCard />
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
