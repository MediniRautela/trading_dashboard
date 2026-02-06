'use client';

/**
 * Leaderboard Widget - Gamified trader rankings
 */
import { Crown, Medal, Trophy } from 'lucide-react';

import type { LeaderboardEntry } from '@/types';
import { cn, formatPercent } from '@/lib/utils';

interface LeaderboardWidgetProps {
    entries: LeaderboardEntry[];
    currentUserRank?: number | null;
    isLoading?: boolean;
}

const rankIcons = {
    1: <Crown className="h-4 w-4 text-yellow-500" />,
    2: <Medal className="h-4 w-4 text-gray-400" />,
    3: <Medal className="h-4 w-4 text-amber-600" />,
};

export function LeaderboardWidget({
    entries,
    currentUserRank,
    isLoading,
}: LeaderboardWidgetProps) {
    if (isLoading) {
        return (
            <div className="card">
                <div className="flex items-center gap-2 mb-4">
                    <div className="skeleton h-5 w-5 rounded" />
                    <div className="skeleton h-5 w-24" />
                </div>
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-2">
                            <div className="skeleton h-6 w-6 rounded" />
                            <div className="skeleton h-6 w-6 rounded-full" />
                            <div className="flex-1">
                                <div className="skeleton h-4 w-20" />
                            </div>
                            <div className="skeleton h-4 w-12" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-warning" />
                    <h2 className="font-semibold text-foreground">Leaderboard</h2>
                </div>
                {currentUserRank && (
                    <span className="text-xs text-foreground-muted">
                        Your rank: #{currentUserRank}
                    </span>
                )}
            </div>

            {/* Entries */}
            <div className="space-y-1">
                {entries.length === 0 ? (
                    <div className="text-center py-6 text-foreground-muted text-sm">
                        No traders yet. Be the first!
                    </div>
                ) : (
                    entries.map((entry) => (
                        <div
                            key={entry.user_id}
                            className={cn(
                                'flex items-center gap-3 p-2 rounded-lg transition-colors',
                                entry.is_current_user
                                    ? 'bg-accent/10 border border-accent/20'
                                    : 'hover:bg-background-tertiary'
                            )}
                        >
                            {/* Rank */}
                            <div className="w-6 flex items-center justify-center">
                                {rankIcons[entry.rank as keyof typeof rankIcons] || (
                                    <span className="text-sm font-mono text-foreground-muted">
                                        {entry.rank}
                                    </span>
                                )}
                            </div>

                            {/* Avatar */}
                            <div className="h-8 w-8 rounded-full bg-background-tertiary flex items-center justify-center">
                                {entry.avatar_url ? (
                                    <img
                                        src={entry.avatar_url}
                                        alt={entry.username}
                                        className="h-8 w-8 rounded-full"
                                    />
                                ) : (
                                    <span className="text-xs font-medium text-foreground">
                                        {entry.username.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>

                            {/* Username */}
                            <div className="flex-1 min-w-0">
                                <div className={cn(
                                    'text-sm font-medium truncate',
                                    entry.is_current_user ? 'text-accent' : 'text-foreground'
                                )}>
                                    {entry.username}
                                    {entry.is_current_user && (
                                        <span className="ml-1 text-xs text-accent">(you)</span>
                                    )}
                                </div>
                                <div className="text-xs text-foreground-muted">
                                    {entry.total_trades} trades • {entry.win_rate}% win
                                </div>
                            </div>

                            {/* Return */}
                            <div className={cn(
                                'text-sm font-mono font-medium',
                                entry.return_percentage >= 0 ? 'text-success' : 'text-danger'
                            )}>
                                {formatPercent(entry.return_percentage)}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* View All */}
            <button className="w-full mt-4 py-2 text-sm text-accent hover:bg-accent/10 rounded-lg transition-colors">
                View Full Leaderboard
            </button>
        </div>
    );
}
