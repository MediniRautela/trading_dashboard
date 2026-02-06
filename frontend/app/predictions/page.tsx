'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { CommandPalette } from '@/components/layout/command-palette';
import { PredictionPanel } from '@/components/features/prediction-panel';
import { MarketContextCard } from '@/components/features/market-context-card';

export default function PredictionsPage() {
    const router = useRouter();
    const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
    const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
    const [isCommandOpen, setIsCommandOpen] = useState(false);

    // Redirect to login if not authenticated
    if (!isAuthLoading && !isAuthenticated) {
        router.push('/login');
        return null;
    }

    if (isAuthLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-foreground-secondary">Loading Predictions...</div>
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
                        <h1 className="text-2xl font-bold text-foreground mb-4">AI Predictions</h1>

                        {/* Search & Stock Selector */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <button
                                onClick={() => setIsCommandOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-background-tertiary rounded-lg hover:bg-background-elevated transition-colors md:w-64"
                            >
                                <Search className="h-4 w-4 text-foreground-muted" />
                                <span className="text-foreground">Search stocks...</span>
                                <kbd className="ml-auto px-2 py-0.5 text-xs bg-background rounded text-foreground-muted">
                                    ⌘K
                                </kbd>
                            </button>

                            <div className="flex gap-2 bg-background-secondary p-1 rounded-lg overflow-x-auto">
                                {['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA', 'AMZN', 'META'].map((sym) => (
                                    <button
                                        key={sym}
                                        onClick={() => setSelectedSymbol(sym)}
                                        className={cn(
                                            'px-3 py-1.5 rounded text-sm transition-colors whitespace-nowrap',
                                            selectedSymbol === sym
                                                ? 'bg-accent text-white'
                                                : 'text-foreground-secondary hover:text-foreground hover:bg-background-tertiary'
                                        )}
                                    >
                                        {sym}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-foreground">Model Analysis</h2>
                                <PredictionPanel symbol={selectedSymbol} />
                            </div>

                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-foreground">Market Context</h2>
                                <MarketContextCard symbol={selectedSymbol} />
                            </div>
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
