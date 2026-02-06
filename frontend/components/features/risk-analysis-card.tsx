'use client';

import {
    AlertTriangle,
    CheckCircle,
    Info,
    ShieldAlert,
    ShieldCheck,
    Shield
} from 'lucide-react';

import { usePortfolioAnalysis } from '@/hooks';
import { cn } from '@/lib/utils';

export function RiskAnalysisCard() {
    const { data: analysis, isLoading } = usePortfolioAnalysis();

    if (isLoading) {
        return (
            <div className="card h-full flex items-center justify-center min-h-[300px]">
                <div className="flex flex-col items-center gap-2">
                    <div className="skeleton h-12 w-12 rounded-full" />
                    <div className="skeleton h-4 w-32" />
                </div>
            </div>
        );
    }

    if (!analysis) return null;

    const { risk_score, diversification_grade, recommendation, high_correlation_pairs } = analysis;

    // determine colors based on grade
    const isSafe = ['A', 'B'].includes(diversification_grade);
    const isModerate = diversification_grade === 'C';
    const isRisky = ['D', 'F'].includes(diversification_grade);

    const gradeColor = isSafe
        ? 'text-success'
        : isModerate
            ? 'text-warning'
            : 'text-danger';

    const bgGradient = isSafe
        ? 'from-success/10 to-transparent'
        : isModerate
            ? 'from-warning/10 to-transparent'
            : 'from-danger/10 to-transparent';

    return (
        <div className="card h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg bg-background-tertiary", gradeColor)}>
                        {isSafe ? <ShieldCheck className="h-6 w-6" /> : isRisky ? <ShieldAlert className="h-6 w-6" /> : <Shield className="h-6 w-6" />}
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Risk Analysis</h2>
                        <p className="text-xs text-foreground-secondary">Portfolio Correlation & Diversification</p>
                    </div>
                </div>
                <div className={cn("text-3xl font-bold font-mono", gradeColor)}>
                    Grade {diversification_grade}
                </div>
            </div>

            <div className={`flex-1 rounded-xl bg-gradient-to-b ${bgGradient} p-6 mb-6 flex flex-col items-center justify-center text-center`}>
                <div className="text-sm text-foreground-muted uppercase tracking-wider mb-2">Risk Score</div>
                <div className={cn("text-5xl font-bold mb-2", gradeColor)}>
                    {risk_score}
                    <span className="text-lg text-foreground-muted font-normal">/100</span>
                </div>
                <p className="text-foreground max-w-sm">
                    {recommendation}
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground-secondary flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    High Correlation Pairs
                </h3>

                {high_correlation_pairs.length === 0 ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm">
                        <CheckCircle className="h-4 w-4" />
                        No highly correlated assets found. Good diversification!
                    </div>
                ) : (
                    <div className="space-y-2">
                        {high_correlation_pairs.map((pair, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background-tertiary text-sm">
                                <div className="flex items-center gap-2 font-mono">
                                    <span className="font-semibold">{pair.symbol_x}</span>
                                    <span className="text-foreground-muted">↔</span>
                                    <span className="font-semibold">{pair.symbol_y}</span>
                                </div>
                                <div className="font-mono text-danger font-medium">
                                    {(pair.correlation * 100).toFixed(0)}%
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-start gap-2 text-xs text-foreground-muted">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>
                        Lower correlation means better diversification. A score below 30 is ideal.
                        High correlation increase portfolio volatility.
                    </p>
                </div>
            </div>
        </div>
    );
}
