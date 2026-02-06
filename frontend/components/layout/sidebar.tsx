'use client';

/**
 * Sidebar navigation component
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BarChart3,
    Briefcase,
    History,
    LayoutDashboard,
    Settings,
    TrendingUp,
    Trophy,
} from 'lucide-react';

import { cn } from '@/lib/utils';

interface SidebarProps {
    className?: string;
}

const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
    { href: '/predictions', label: 'Predictions', icon: TrendingUp },
    { href: '/history', label: 'Trade History', icon: History },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                'w-60 border-r border-border bg-background-secondary flex flex-col',
                className
            )}
        >
            {/* Logo */}
            <div className="h-14 px-4 flex items-center border-b border-border">
                <Link href="/" className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-accent" />
                    <span className="text-lg font-bold text-foreground">ARTHA</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                                isActive
                                    ? 'bg-accent/10 text-accent'
                                    : 'text-foreground-secondary hover:bg-background-tertiary hover:text-foreground'
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom - Settings */}
            <div className="p-3 border-t border-border">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground-secondary hover:bg-background-tertiary hover:text-foreground transition-colors"
                >
                    <Settings className="h-4 w-4" />
                    Settings
                </Link>
            </div>
        </aside>
    );
}
