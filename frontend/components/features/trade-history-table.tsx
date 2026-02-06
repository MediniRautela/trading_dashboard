'use client';

import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

import { cn, formatCurrency } from '@/lib/utils';
import type { TradeHistoryItem } from '@/types';

interface TradeHistoryTableProps {
    trades: TradeHistoryItem[];
    isLoading?: boolean;
}

export function TradeHistoryTable({ trades, isLoading }: TradeHistoryTableProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between p-4 bg-background-tertiary rounded-lg animate-pulse">
                        <div className="h-4 w-24 bg-background-elevated rounded" />
                        <div className="h-4 w-32 bg-background-elevated rounded" />
                        <div className="h-4 w-16 bg-background-elevated rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (!trades || trades.length === 0) {
        return (
            <div className="text-center py-12 text-foreground-muted bg-background-secondary rounded-lg border border-dashed border-border">
                <p>No trading history available</p>
                <p className="text-sm mt-1">Execute your first trade to see it here</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-foreground-secondary">Time</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-foreground-secondary">Symbol</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-foreground-secondary">Type</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-foreground-secondary">Quantity</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-foreground-secondary">Price</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-foreground-secondary">Total</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-foreground-secondary">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {trades.map((trade) => (
                        <tr key={trade.id} className="group hover:bg-background-tertiary transition-colors">
                            <td className="py-3 px-4 text-sm text-foreground-secondary">
                                {trade.created_at ? format(new Date(trade.created_at), 'MMM d, HH:mm') : '-'}
                            </td>
                            <td className="py-3 px-4">
                                <span className="font-medium text-foreground">{trade.symbol}</span>
                            </td>
                            <td className="py-3 px-4">
                                <span className={cn(
                                    "flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full w-fit",
                                    trade.trade_type === 'BUY'
                                        ? "bg-success/10 text-success"
                                        : "bg-danger/10 text-danger"
                                )}>
                                    {trade.trade_type === 'BUY' ? (
                                        <ArrowUpRight className="h-3 w-3" />
                                    ) : (
                                        <ArrowDownLeft className="h-3 w-3" />
                                    )}
                                    {trade.trade_type}
                                </span>
                            </td>
                            <td className="py-3 px-4 text-right text-sm font-mono text-foreground">
                                {trade.quantity}
                            </td>
                            <td className="py-3 px-4 text-right text-sm font-mono text-foreground-secondary">
                                {formatCurrency(trade.price)}
                            </td>
                            <td className="py-3 px-4 text-right text-sm font-mono font-medium text-foreground">
                                {formatCurrency(trade.total_value)}
                            </td>
                            <td className="py-3 px-4 text-right">
                                <span className="text-xs px-2 py-0.5 rounded bg-background-elevated text-foreground-secondary border border-border">
                                    {trade.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
