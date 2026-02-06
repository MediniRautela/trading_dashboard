'use client';

/**
 * Positions Table - Display user's stock holdings
 */
import { ChevronRight } from 'lucide-react';

import type { Position } from '@/types';
import { cn, formatCurrency, formatPercent } from '@/lib/utils';

interface PositionsTableProps {
    positions: Position[];
    isLoading?: boolean;
    onSymbolClick?: (symbol: string) => void;
}

export function PositionsTable({
    positions,
    isLoading,
    onSymbolClick,
}: PositionsTableProps) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-background-tertiary rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="skeleton h-8 w-8 rounded" />
                            <div>
                                <div className="skeleton h-4 w-16 mb-1" />
                                <div className="skeleton h-3 w-12" />
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="skeleton h-4 w-20 mb-1" />
                            <div className="skeleton h-3 w-14" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (positions.length === 0) {
        return (
            <div className="text-center py-8 text-foreground-muted">
                <p>No positions yet</p>
                <p className="text-sm mt-1">Start trading to build your portfolio</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr>
                        <th className="text-left">Symbol</th>
                        <th className="text-right">Shares</th>
                        <th className="text-right">Avg Price</th>
                        <th className="text-right">Current</th>
                        <th className="text-right">Value</th>
                        <th className="text-right">P&L</th>
                        <th className="w-8"></th>
                    </tr>
                </thead>
                <tbody>
                    {positions.map((position) => (
                        <tr
                            key={position.id}
                            onClick={() => onSymbolClick?.(position.symbol)}
                            className="cursor-pointer hover:bg-background-tertiary"
                        >
                            <td>
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded bg-background-tertiary flex items-center justify-center text-xs font-medium text-foreground">
                                        {position.symbol.slice(0, 2)}
                                    </div>
                                    <span className="font-medium text-foreground">{position.symbol}</span>
                                </div>
                            </td>
                            <td className="text-right font-mono">
                                {position.quantity}
                            </td>
                            <td className="text-right font-mono text-foreground-secondary">
                                {formatCurrency(position.average_price)}
                            </td>
                            <td className="text-right font-mono">
                                {formatCurrency(position.current_price)}
                            </td>
                            <td className="text-right font-mono font-medium">
                                {formatCurrency(position.current_value)}
                            </td>
                            <td className="text-right">
                                <div className={cn(
                                    'font-mono',
                                    position.pnl >= 0 ? 'text-success' : 'text-danger'
                                )}>
                                    {formatCurrency(position.pnl)}
                                    <span className="text-xs ml-1">
                                        ({formatPercent(position.pnl_percentage)})
                                    </span>
                                </div>
                            </td>
                            <td>
                                <ChevronRight className="h-4 w-4 text-foreground-muted" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
