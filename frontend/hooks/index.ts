'use client';

/**
 * Custom hooks wrapping TanStack Query for data fetching
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
    communityApi,
    portfolioApi,
    predictionsApi,
    tradingApi,
} from '@/lib/api';

// ============================================
// Prediction Hooks
// ============================================

export function useStocks() {
    return useQuery({
        queryKey: ['stocks'],
        queryFn: predictionsApi.getStocks,
        staleTime: 60 * 60 * 1000, // 1 hour
    });
}

export function usePrediction(symbol: string) {
    return useQuery({
        queryKey: ['prediction', symbol],
        queryFn: () => predictionsApi.getPrediction(symbol),
        enabled: !!symbol,
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    });
}

export function useMarketContext(symbol: string) {
    return useQuery({
        queryKey: ['market-context', symbol],
        queryFn: () => predictionsApi.getMarketContext(symbol),
        enabled: !!symbol,
        staleTime: 60 * 1000, // 1 minute
        refetchInterval: 60 * 1000, // Auto-refresh every minute
    });
}

export function usePriceData(symbol: string, period = '60d', interval = '15m') {
    return useQuery({
        queryKey: ['price-data', symbol, period, interval],
        queryFn: () => predictionsApi.getPriceData(symbol, period, interval),
        enabled: !!symbol,
        staleTime: 15 * 1000, // 15 seconds
    });
}

export function useLivePrice(symbol: string) {
    return useQuery({
        queryKey: ['live-price', symbol],
        queryFn: () => predictionsApi.getLivePrice(symbol),
        enabled: !!symbol,
        staleTime: 5 * 1000, // 5 seconds
        refetchInterval: 15 * 1000, // Auto-refresh every 15 seconds
    });
}

// ============================================
// Trading Hooks
// ============================================

export function usePositions() {
    return useQuery({
        queryKey: ['positions'],
        queryFn: tradingApi.getPositions,
        staleTime: 15 * 1000, // 15 seconds
        refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    });
}

export function useTradeHistory(page = 1, pageSize = 20) {
    return useQuery({
        queryKey: ['trade-history', page, pageSize],
        queryFn: () => tradingApi.getHistory(page, pageSize),
        staleTime: 30 * 1000, // 30 seconds
    });
}

export function useBuyStock() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ symbol, quantity }: { symbol: string; quantity: number }) =>
            tradingApi.buy(symbol, quantity),
        onSuccess: () => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['positions'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });
            queryClient.invalidateQueries({ queryKey: ['trade-history'] });
            queryClient.invalidateQueries({ queryKey: ['portfolio-summary'] });
        },
    });
}

export function useSellStock() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ symbol, quantity }: { symbol: string; quantity: number }) =>
            tradingApi.sell(symbol, quantity),
        onSuccess: () => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['positions'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });
            queryClient.invalidateQueries({ queryKey: ['trade-history'] });
            queryClient.invalidateQueries({ queryKey: ['portfolio-summary'] });
        },
    });
}

export function useQuickTrade() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (command: string) => tradingApi.quickTrade(command),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['positions'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });
            queryClient.invalidateQueries({ queryKey: ['trade-history'] });
            queryClient.invalidateQueries({ queryKey: ['portfolio-summary'] });
        },
    });
}

// ============================================
// Portfolio Hooks
// ============================================

export function usePortfolioSummary() {
    return useQuery({
        queryKey: ['portfolio-summary'],
        queryFn: portfolioApi.getSummary,
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 60 * 1000, // Auto-refresh every minute
    });
}

export function usePortfolioAnalysis() {
    return useQuery({
        queryKey: ['portfolio-analysis'],
        queryFn: portfolioApi.getAnalysis,
        staleTime: 60 * 1000, // 1 minute
    });
}

export function usePortfolioPerformance(period = '1M') {
    return useQuery({
        queryKey: ['portfolio-performance', period],
        queryFn: () => portfolioApi.getPerformance(period),
        staleTime: 60 * 1000, // 1 minute
    });
}

// ============================================
// Community Hooks
// ============================================

export function useLeaderboard(period = 'all_time', limit = 10) {
    return useQuery({
        queryKey: ['leaderboard', period, limit],
        queryFn: () => communityApi.getLeaderboard(period, limit),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
