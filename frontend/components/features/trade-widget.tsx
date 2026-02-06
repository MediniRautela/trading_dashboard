'use client';

/**
 * Trade Widget - Buy/Sell stocks
 */
import { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Minus, Plus } from 'lucide-react';

import { useBuyStock, useSellStock, useLivePrice } from '@/hooks';
import { cn, formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/toaster';

interface TradeWidgetProps {
    symbol: string;
    balance: number;
}

export function TradeWidget({ symbol, balance }: TradeWidgetProps) {
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');

    const { data: price, isLoading: isPriceLoading } = useLivePrice(symbol);
    const buyMutation = useBuyStock();
    const sellMutation = useSellStock();

    const currentPrice = price?.price || 0;
    const totalCost = quantity * currentPrice;
    const canAfford = balance >= totalCost;
    const isLoading = buyMutation.isPending || sellMutation.isPending;

    const handleTrade = async () => {
        try {
            if (activeTab === 'buy') {
                const result = await buyMutation.mutateAsync({ symbol, quantity });
                toast(result.message, { type: 'success' });
            } else {
                const result = await sellMutation.mutateAsync({ symbol, quantity });
                toast(result.message, { type: 'success' });
            }
            setQuantity(1);
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Trade failed';
            toast('Trade failed', { description: message, type: 'error' });
        }
    };

    return (
        <div className="card">
            <h2 className="text-heading font-semibold mb-4">Trade {symbol}</h2>

            {/* Buy/Sell Tabs */}
            <div className="flex mb-4 bg-background-tertiary rounded-lg p-1">
                <button
                    onClick={() => setActiveTab('buy')}
                    className={cn(
                        'flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm font-medium transition-colors',
                        activeTab === 'buy'
                            ? 'bg-success text-white'
                            : 'text-foreground-secondary hover:text-foreground'
                    )}
                >
                    <ArrowUpCircle className="h-4 w-4" />
                    Buy
                </button>
                <button
                    onClick={() => setActiveTab('sell')}
                    className={cn(
                        'flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm font-medium transition-colors',
                        activeTab === 'sell'
                            ? 'bg-danger text-white'
                            : 'text-foreground-secondary hover:text-foreground'
                    )}
                >
                    <ArrowDownCircle className="h-4 w-4" />
                    Sell
                </button>
            </div>

            {/* Current Price */}
            <div className="flex items-center justify-between mb-4 p-3 bg-background-tertiary rounded-lg">
                <span className="text-sm text-foreground-muted">Current Price</span>
                <span className="font-mono font-medium text-foreground">
                    {isPriceLoading ? (
                        <span className="skeleton h-4 w-16 inline-block" />
                    ) : (
                        formatCurrency(currentPrice)
                    )}
                </span>
            </div>

            {/* Quantity */}
            <div className="mb-4">
                <label className="block text-sm text-foreground-muted mb-2">Quantity</label>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 rounded bg-background-tertiary hover:bg-background-elevated transition-colors"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="flex-1 text-center font-mono text-lg py-2"
                    />
                    <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2 rounded bg-background-tertiary hover:bg-background-elevated transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Quick Amounts */}
            <div className="flex gap-2 mb-4">
                {[1, 5, 10, 50].map((amt) => (
                    <button
                        key={amt}
                        onClick={() => setQuantity(amt)}
                        className={cn(
                            'flex-1 py-1.5 text-sm rounded transition-colors',
                            quantity === amt
                                ? 'bg-accent text-white'
                                : 'bg-background-tertiary text-foreground-secondary hover:bg-background-elevated'
                        )}
                    >
                        {amt}
                    </button>
                ))}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between mb-4 p-3 bg-background-tertiary rounded-lg">
                <span className="text-sm text-foreground-muted">Total {activeTab === 'buy' ? 'Cost' : 'Value'}</span>
                <span className="text-lg font-mono font-semibold text-foreground">
                    {formatCurrency(totalCost)}
                </span>
            </div>

            {/* Balance Warning */}
            {activeTab === 'buy' && !canAfford && (
                <div className="mb-4 p-2 bg-danger/10 border border-danger/20 rounded text-sm text-danger text-center">
                    Insufficient balance
                </div>
            )}

            {/* Submit */}
            <button
                onClick={handleTrade}
                disabled={isLoading || (activeTab === 'buy' && !canAfford)}
                className={cn(
                    'w-full py-3 rounded-lg font-medium transition-colors',
                    activeTab === 'buy'
                        ? 'bg-success text-white hover:bg-success/90'
                        : 'bg-danger text-white hover:bg-danger/90',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
            >
                {isLoading
                    ? 'Processing...'
                    : `${activeTab === 'buy' ? 'Buy' : 'Sell'} ${quantity} ${symbol}`}
            </button>

            {/* Available Balance */}
            <div className="mt-4 text-center text-xs text-foreground-muted">
                Available: {formatCurrency(balance)}
            </div>
        </div>
    );
}
