'use client';

/**
 * Header component with user profile and search
 */
import { Command, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

interface HeaderProps {
    user: User | null;
    onCommandPaletteOpen: () => void;
}

export function Header({ user, onCommandPaletteOpen }: HeaderProps) {
    const { logout } = useAuth();

    return (
        <header className="h-14 border-b border-border bg-background-secondary px-4 flex items-center justify-between">
            {/* Left - Logo (mobile) & Search */}
            <div className="flex items-center gap-4">
                <h1 className="text-lg font-bold text-foreground md:hidden">ARTHA</h1>

                <button
                    onClick={onCommandPaletteOpen}
                    className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-foreground-secondary bg-background-tertiary rounded-lg hover:bg-background-elevated transition-colors"
                >
                    <Command className="h-4 w-4" />
                    <span>Search...</span>
                    <kbd className="ml-6 px-1.5 py-0.5 text-xs bg-background rounded">⌘K</kbd>
                </button>
            </div>

            {/* Right - User */}
            <div className="flex items-center gap-4">
                {/* Balance */}
                {user && (
                    <div className="hidden sm:block text-right">
                        <div className="text-xs text-foreground-muted">Balance</div>
                        <div className="text-sm font-mono font-medium text-foreground">
                            ${user.paper_balance.toLocaleString()}
                        </div>
                    </div>
                )}

                {/* User Dropdown */}
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-background-tertiary transition-colors">
                            <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                                {user?.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt={user.username}
                                        className="h-8 w-8 rounded-full"
                                    />
                                ) : (
                                    <span className="text-sm font-medium text-white">
                                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                )}
                            </div>
                            <span className="hidden sm:block text-sm text-foreground">
                                {user?.username || 'User'}
                            </span>
                        </button>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Portal>
                        <DropdownMenu.Content
                            className="min-w-[180px] bg-background-secondary border border-border rounded-lg p-1 shadow-lg animate-fade-in z-50"
                            align="end"
                            sideOffset={8}
                        >
                            <DropdownMenu.Item
                                className="flex items-center gap-2 px-3 py-2 text-sm text-foreground-secondary rounded hover:bg-background-tertiary hover:text-foreground cursor-pointer outline-none"
                            >
                                <UserIcon className="h-4 w-4" />
                                Profile
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                                className="flex items-center gap-2 px-3 py-2 text-sm text-foreground-secondary rounded hover:bg-background-tertiary hover:text-foreground cursor-pointer outline-none"
                            >
                                <Settings className="h-4 w-4" />
                                Settings
                            </DropdownMenu.Item>
                            <DropdownMenu.Separator className="my-1 h-px bg-border" />
                            <DropdownMenu.Item
                                className="flex items-center gap-2 px-3 py-2 text-sm text-danger rounded hover:bg-danger/10 cursor-pointer outline-none"
                                onClick={logout}
                            >
                                <LogOut className="h-4 w-4" />
                                Sign out
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>
            </div>
        </header>
    );
}
