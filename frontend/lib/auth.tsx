'use client';

/**
 * Authentication context and hooks
 */
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { authApi, clearTokens, getAccessToken, setTokens } from '@/lib/api';
import type { LoginRequest, RegisterRequest, User } from '@/types';

interface AuthContextValue {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    error: Error | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const queryClient = useQueryClient();
    const [isInitialized, setIsInitialized] = useState(false);

    // Check if we have a stored token on mount
    useEffect(() => {
        const token = getAccessToken();
        setIsInitialized(true);
        if (!token) {
            // No token, clear any stale user data
            queryClient.setQueryData(['user'], null);
        }
    }, [queryClient]);

    // Fetch current user
    const {
        data: user,
        isLoading: isLoadingUser,
        error,
    } = useQuery({
        queryKey: ['user'],
        queryFn: authApi.getMe,
        enabled: isInitialized && !!getAccessToken(),
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            queryClient.setQueryData(['user'], data.user);
        },
    });

    // Register mutation
    const registerMutation = useMutation({
        mutationFn: authApi.register,
    });

    const login = useCallback(
        async (data: LoginRequest) => {
            await loginMutation.mutateAsync(data);
        },
        [loginMutation]
    );

    const register = useCallback(
        async (data: RegisterRequest) => {
            await registerMutation.mutateAsync(data);
        },
        [registerMutation]
    );

    const logout = useCallback(() => {
        clearTokens();
        queryClient.setQueryData(['user'], null);
        queryClient.clear();
    }, [queryClient]);

    const value: AuthContextValue = {
        user: user ?? null,
        isLoading: !isInitialized || isLoadingUser,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        error: error as Error | null,
    };

    return <AuthContext.Provider value={ value }> { children } </AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
