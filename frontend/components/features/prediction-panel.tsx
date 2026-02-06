'use client';

/**
 * Prediction Panel - Display ML prediction for selected stock
 */
import { ArrowDown, ArrowUp, Brain, RefreshCw } from 'lucide-react';

import { usePrediction, useLivePrice } from '@/hooks';
import { cn, formatCurrency, formatPercent } from '@/lib/utils';

interface PredictionPanelProps {
    symbol: string;
}

export function PredictionPanel({ symbol }: PredictionPanelProps) {
    const { data: prediction, isLoading: isPredictionLoading, refetch } = usePrediction(symbol);
    const { data: price, isLoading: isPriceLoading } = useLivePrice(symbol);

    const isLoading = isPredictionLoading || isPriceLoading;

    if (isLoading) {
        return (
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <div className="skeleton h-6 w-32" />
                    <div className="skeleton h-8 w-8 rounded" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-background-tertiary rounded-lg p-3">
                            <div className="skeleton h-3 w-16 mb-2" />
                            <div className="skeleton h-6 w-20" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!prediction) {
        return (
            <div className="card text-center py-8 text-foreground-muted">
                <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Select a stock to see predictions</p>
            </div>
        );
    }

    const isUp = prediction.direction === 'UP';

    return (
        <div className="card">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Brain className="h-5 w-5 text-accent" />
                    <h2 className="text-heading font-semibold">ML Prediction</h2>
                    <span className="text-foreground-muted">•</span>
                    <span className="font-medium text-foreground">{symbol}</span>
                </div>
                <button
                    onClick={() => refetch()}
                    className="p-1.5 rounded hover:bg-background-tertiary transition-colors"
                >
                    <RefreshCw className="h-4 w-4 text-foreground-muted" />
                </button>
            </div>

            {/* Current Price */}
            {price && (
                <div className="flex items-center gap-4 mb-4">
                    <span className="text-2xl font-bold font-mono text-foreground">
                        {formatCurrency(price.price)}
                    </span>
                    <span className={cn(
                        'flex items-center gap-1 text-sm font-mono',
                        price.change >= 0 ? 'text-success' : 'text-danger'
                    )}>
                        {price.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {formatCurrency(Math.abs(price.change))} ({formatPercent(price.change_percentage)})
                    </span>
                </div>
            )}

            {/* Prediction Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Direction */}
                <div className={cn(
                    'rounded-lg p-4 text-center',
                    isUp ? 'bg-success/10 border border-success/20' : 'bg-danger/10 border border-danger/20'
                )}>
                    <div className="text-xs text-foreground-muted uppercase mb-1">Direction</div>
                    <div className={cn(
                        'text-xl font-bold flex items-center justify-center gap-2',
                        isUp ? 'text-success' : 'text-danger'
                    )}>
                        {isUp ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
                        {prediction.direction}
                    </div>
                </div>

                {/* Confidence */}
                <div className="bg-background-tertiary rounded-lg p-4 text-center">
                    <div className="text-xs text-foreground-muted uppercase mb-1">Confidence</div>
                    <div className="text-xl font-bold font-mono text-foreground">
                        {(prediction.confidence * 100).toFixed(1)}%
                    </div>
                    <div className={cn(
                        'text-xs mt-1',
                        prediction.signal_strength === 'STRONG' ? 'text-success' :
                            prediction.signal_strength === 'MODERATE' ? 'text-warning' : 'text-foreground-muted'
                    )}>
                        {prediction.signal_strength}
                    </div>
                </div>

                {/* Predicted Return */}
                <div className="bg-background-tertiary rounded-lg p-4 text-center">
                    <div className="text-xs text-foreground-muted uppercase mb-1">Est. Return</div>
                    <div className={cn(
                        'text-xl font-bold font-mono',
                        prediction.predicted_return_percentage >= 0 ? 'text-success' : 'text-danger'
                    )}>
                        {formatPercent(prediction.predicted_return_percentage)}
                    </div>
                    <div className="text-xs text-foreground-muted mt-1">
                        {prediction.prediction_horizon}
                    </div>
                </div>

                {/* Probability */}
                <div className="bg-background-tertiary rounded-lg p-4 text-center">
                    <div className="text-xs text-foreground-muted uppercase mb-1">Up / Down</div>
                    <div className="flex items-center justify-center gap-2 text-sm font-mono">
                        <span className="text-success">{(prediction.up_probability * 100).toFixed(0)}%</span>
                        <span className="text-foreground-muted">/</span>
                        <span className="text-danger">{(prediction.down_probability * 100).toFixed(0)}%</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 h-1.5 bg-danger/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-success rounded-full"
                            style={{ width: `${prediction.up_probability * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Model Info */}
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-foreground-muted">
                <span>Model: {prediction.model_version}</span>
                <span>Updated: {new Date(prediction.generated_at).toLocaleTimeString()}</span>
            </div>
        </div>
    );
}
