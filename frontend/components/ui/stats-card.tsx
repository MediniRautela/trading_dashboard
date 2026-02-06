'use client';

/**
 * Stats Card component for dashboard metrics
 */
import type { ReactNode } from 'react';
import { cn, formatPercent } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: string;
    change?: number;
    icon?: ReactNode;
    isLoading?: boolean;
}

export function StatsCard({ title, value, change, icon, isLoading }: StatsCardProps) {
    if (isLoading) {
        return (
            <div className="card">
                <div className="flex items-start justify-between">
                    <div className="skeleton h-4 w-20 mb-2" />
                    <div className="skeleton h-8 w-8 rounded" />
                </div>
                <div className="skeleton h-7 w-28 mt-2" />
                <div className="skeleton h-4 w-16 mt-1" />
            </div>
        );
    }

    return (
        <div className="card hover:shadow-glow/5 transition-shadow">
            <div className="flex items-start justify-between">
                <span className="text-xs text-foreground-muted uppercase tracking-wide">
                    {title}
                </span>
                {icon && (
                    <div className="p-1.5 rounded bg-background-tertiary text-foreground-secondary">
                        {icon}
                    </div>
                )}
            </div>

            <div className="mt-2 text-xl font-semibold font-mono text-foreground">
                {/* Guard against object values being passed as children */}
                {typeof value === 'object' ? JSON.stringify(value) : value}
            </div>

            {change !== undefined && (
                <div className={cn(
                    'mt-1 text-sm font-mono',
                    change >= 0 ? 'text-success' : 'text-danger'
                )}>
                    {formatPercent(change)}
                </div>
            )}
        </div>
    );
}
