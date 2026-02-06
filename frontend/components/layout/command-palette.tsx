'use client';

/**
 * Command Palette (Cmd+K)
 * Global quick actions and navigation
 */
import { useEffect, useState, useCallback } from 'react';
import { Command } from 'cmdk';
import * as Dialog from '@radix-ui/react-dialog';
import {
    ArrowDown,
    ArrowUp,
    BarChart3,
    Briefcase,
    History,
    LayoutDashboard,
    Moon,
    Search,
    Sun,
    TrendingUp,
    Trophy,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useQuickTrade, useStocks } from '@/hooks';
import { toast } from '@/components/ui/toaster';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onSymbolSelect?: (symbol: string) => void;
}

export function CommandPalette({ isOpen, onClose, onSymbolSelect }: CommandPaletteProps) {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const { data: stocksData } = useStocks();
    const quickTradeMutation = useQuickTrade();

    // Keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) {
                    onClose();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleSelect = useCallback(
        (callback: () => void) => {
            callback();
            setSearch('');
            onClose();
        },
        [onClose]
    );

    // Check if search is a quick trade command
    const isTradeCommand = /^(buy|sell)\s+\w+\s+\d+$/i.test(search.trim());

    const handleQuickTrade = async () => {
        if (!isTradeCommand) return;

        try {
            const result = await quickTradeMutation.mutateAsync(search);
            toast(result.message, { type: 'success' });
            setSearch('');
            onClose();
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Trade failed';
            toast('Trade failed', { description: message, type: 'error' });
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                <Dialog.Content className="fixed left-1/2 top-1/4 -translate-x-1/2 z-50 w-full max-w-xl">
                    <Dialog.Title className="sr-only">Search Stocks</Dialog.Title>
                    <Command className="rounded-xl border border-border bg-background-secondary shadow-2xl overflow-hidden">
                        {/* Search Input */}
                        <div className="flex items-center border-b border-border px-4">
                            <Search className="h-4 w-4 text-foreground-muted shrink-0" />
                            <Command.Input
                                value={search}
                                onValueChange={setSearch}
                                placeholder="Search stocks, navigate, or type 'buy AAPL 10'..."
                                className="flex-1 h-12 px-3 text-foreground bg-transparent border-0 outline-none placeholder:text-foreground-muted"
                            />
                            {isTradeCommand && (
                                <button
                                    onClick={handleQuickTrade}
                                    disabled={quickTradeMutation.isPending}
                                    className="px-3 py-1 text-xs bg-accent text-white rounded hover:bg-accent/90"
                                >
                                    {quickTradeMutation.isPending ? 'Trading...' : 'Execute'}
                                </button>
                            )}
                        </div>

                        {/* Results */}
                        <Command.List className="max-h-80 overflow-y-auto p-2">
                            <Command.Empty className="py-6 text-center text-sm text-foreground-muted">
                                No results found.
                            </Command.Empty>

                            {/* Navigation */}
                            <Command.Group heading="Navigation">
                                <Command.Item
                                    onSelect={() => handleSelect(() => router.push('/'))}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-foreground-secondary data-[selected=true]:bg-background-tertiary data-[selected=true]:text-foreground"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Command.Item>
                                <Command.Item
                                    onSelect={() => handleSelect(() => router.push('/portfolio'))}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-foreground-secondary data-[selected=true]:bg-background-tertiary data-[selected=true]:text-foreground"
                                >
                                    <Briefcase className="h-4 w-4" />
                                    Portfolio
                                </Command.Item>
                                <Command.Item
                                    onSelect={() => handleSelect(() => router.push('/predictions'))}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-foreground-secondary data-[selected=true]:bg-background-tertiary data-[selected=true]:text-foreground"
                                >
                                    <TrendingUp className="h-4 w-4" />
                                    Predictions
                                </Command.Item>
                                <Command.Item
                                    onSelect={() => handleSelect(() => router.push('/history'))}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-foreground-secondary data-[selected=true]:bg-background-tertiary data-[selected=true]:text-foreground"
                                >
                                    <History className="h-4 w-4" />
                                    Trade History
                                </Command.Item>
                                <Command.Item
                                    onSelect={() => handleSelect(() => router.push('/leaderboard'))}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-foreground-secondary data-[selected=true]:bg-background-tertiary data-[selected=true]:text-foreground"
                                >
                                    <Trophy className="h-4 w-4" />
                                    Leaderboard
                                </Command.Item>
                            </Command.Group>

                            {/* Stocks */}
                            <Command.Group heading="Stocks">
                                {stocksData?.stocks
                                    .filter((stock) => {
                                        if (!search) return true;
                                        const query = search.toLowerCase();
                                        return (
                                            stock.symbol.toLowerCase().includes(query) ||
                                            stock.name.toLowerCase().includes(query)
                                        );
                                    })
                                    .slice(0, 10) // Show top 10 matches
                                    .map((stock) => (
                                        <Command.Item
                                            key={stock.symbol}
                                            value={`${stock.symbol} ${stock.name}`} // Add value specifically for cmdk filtering if used
                                            onSelect={() =>
                                                handleSelect(() => onSymbolSelect?.(stock.symbol))
                                            }
                                            className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-foreground-secondary data-[selected=true]:bg-background-tertiary data-[selected=true]:text-foreground"
                                        >
                                            <div className="flex items-center gap-3">
                                                <BarChart3 className="h-4 w-4" />
                                                <span className="font-medium">{stock.symbol}</span>
                                                <span className="text-foreground-muted">{stock.name}</span>
                                            </div>
                                        </Command.Item>
                                    ))}
                            </Command.Group>

                            {/* Quick Trade Help */}
                            <Command.Group heading="Quick Trade">
                                <div className="px-3 py-2 text-xs text-foreground-muted">
                                    Type commands like:<br />
                                    • <code className="bg-background px-1 rounded">buy AAPL 10</code> - Buy 10 shares of AAPL<br />
                                    • <code className="bg-background px-1 rounded">sell MSFT 5</code> - Sell 5 shares of MSFT
                                </div>
                            </Command.Group>
                        </Command.List>

                        {/* Footer */}
                        <div className="flex items-center justify-between px-4 py-2 border-t border-border text-xs text-foreground-muted">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <ArrowUp className="h-3 w-3" />
                                    <ArrowDown className="h-3 w-3" />
                                    to navigate
                                </span>
                                <span>↵ to select</span>
                                <span>esc to close</span>
                            </div>
                        </div>
                    </Command>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
