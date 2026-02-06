'use client';

/**
 * Providers wrapper for the application
 * Sets up TanStack Query, Auth context, and other providers
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

import { AuthProvider } from '@/lib/auth';
import { Toaster } from '@/components/ui/toaster';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    // Create QueryClient with default options
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Stale time: how long data is considered fresh
                        staleTime: 30 * 1000, // 30 seconds
                        // Cache time: how long to keep data in cache
                        gcTime: 5 * 60 * 1000, // 5 minutes
                        // Retry failed requests
                        retry: 1,
                        // Refetch on window focus
                        refetchOnWindowFocus: true,
                    },
                    mutations: {
                        // Retry mutations once
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                {children}
                <Toaster />
            </AuthProvider>
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    );
}
