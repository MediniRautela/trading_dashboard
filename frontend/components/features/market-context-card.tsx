'use client';

/**
 * Market Context Card - "The Why Widget"
 * AI-generated explanation of market sentiment
 */
import { Lightbulb, RefreshCw } from 'lucide-react';

import { useMarketContext } from '@/hooks';
import { cn } from '@/lib/utils';

interface MarketContextCardProps {
    symbol: string;
}

export function MarketContextCard({ symbol }: MarketContextCardProps) {
    const { data: context, isLoading, refetch } = useMarketContext(symbol);

    if (isLoading) {
        return (
            <div className="card">
                <div className="flex items-center gap-2 mb-3">
                    <div className="skeleton h-5 w-5 rounded" />
                    <div className="skeleton h-5 w-24" />
                </div>
                <div className="skeleton h-4 w-full mb-2" />
                <div className="skeleton h-4 w-3/4" />
            </div>
        );
    }

    if (!context) {
        return null;
    }

    const sentimentColors = {
        BULLISH: 'bg-success/10 border-success/30 text-success',
        BEARISH: 'bg-danger/10 border-danger/30 text-danger',
        NEUTRAL: 'bg-foreground-muted/10 border-foreground-muted/30 text-foreground-muted',
    };

    const recommendationColors = {
        BUY: 'badge-success',
        HOLD: 'badge-warning',
        SELL: 'badge-danger',
        AVOID: 'badge-danger',
    };

    return (
        <div className="card">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-warning" />
                    <h3 className="font-semibold text-foreground">Why {symbol}?</h3>
                    <span className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium border',
                        sentimentColors[context.sentiment]
                    )}>
                        {context.sentiment}
                    </span>
                </div>
                <button
                    onClick={() => refetch()}
                    className="p-1.5 rounded hover:bg-background-tertiary transition-colors"
                >
                    <RefreshCw className="h-4 w-4 text-foreground-muted" />
                </button>
            </div>

            {/* Summary */}
            <p className="text-foreground-secondary text-sm mb-4">
                {context.summary}
            </p>

            {/* Key Factors */}
            <div className="space-y-2 mb-4">
                <h4 className="text-xs text-foreground-muted uppercase tracking-wide">Key Factors</h4>
                <div className="flex flex-wrap gap-2">
                    {context.key_factors.map((factor, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 bg-background-tertiary rounded text-xs text-foreground-secondary"
                        >
                            {factor}
                        </span>
                    ))}
                </div>
            </div>

            {/* Bottom */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
                {context.recommendation && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-foreground-muted">AI Recommendation:</span>
                        <span className={cn('badge', recommendationColors[context.recommendation] || 'badge-neutral')}>
                            {context.recommendation}
                        </span>
                    </div>
                )}
                <div className="text-xs text-foreground-muted">
                    Confidence: {(context.confidence * 100).toFixed(0)}%
                </div>
            </div>
        </div>
    );
}
