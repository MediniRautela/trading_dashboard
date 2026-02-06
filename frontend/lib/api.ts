/**
 * API client for ARTHA backend
 */
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import type {
    CorrelationMatrixResponse,
    LeaderboardResponse,
    LivePriceResponse,
    LoginRequest,
    LoginResponse,
    MarketContextResponse,
    PerformanceResponse,
    PortfolioSummaryResponse,
    PositionsListResponse,
    PredictionResponse,
    PriceDataResponse,
    RegisterRequest,
    StockListResponse,
    TradeHistoryResponse,
    TradeRequest,
    TradeResponse,
    User,
} from '@/types';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Token storage (in memory for security)
let accessToken: string | null = null;
let refreshToken: string | null = null;

// Token management
export const setTokens = (access: string, refresh: string) => {
    accessToken = access;
    refreshToken = refresh;
    // Store in localStorage for persistence (consider HttpOnly cookies for production)
    if (typeof window !== 'undefined') {
        localStorage.setItem('artha_access_token', access);
        localStorage.setItem('artha_refresh_token', refresh);
    }
};

export const getAccessToken = (): string | null => {
    if (accessToken) return accessToken;
    if (typeof window !== 'undefined') {
        return localStorage.getItem('artha_access_token');
    }
    return null;
};

export const getRefreshToken = (): string | null => {
    if (refreshToken) return refreshToken;
    if (typeof window !== 'undefined') {
        return localStorage.getItem('artha_refresh_token');
    }
    return null;
};

export const clearTokens = () => {
    accessToken = null;
    refreshToken = null;
    if (typeof window !== 'undefined') {
        localStorage.removeItem('artha_access_token');
        localStorage.removeItem('artha_refresh_token');
    }
};

// Request interceptor - add auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If 401 and not already retrying, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refresh = getRefreshToken();
            if (refresh) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
                        refresh_token: refresh,
                    });

                    const { access_token, refresh_token } = response.data;
                    setTokens(access_token, refresh_token);

                    // Retry original request
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    }
                    return api(originalRequest);
                } catch {
                    // Refresh failed, clear tokens
                    clearTokens();
                }
            }
        }

        return Promise.reject(error);
    }
);

// ============================================
// Auth API
// ============================================

export const authApi = {
    register: async (data: RegisterRequest) => {
        const response = await api.post('/api/auth/register', data);
        return response.data;
    },

    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/api/auth/login', data);
        const { tokens } = response.data;
        setTokens(tokens.access_token, tokens.refresh_token);
        return response.data;
    },

    logout: () => {
        clearTokens();
    },

    getMe: async (): Promise<User> => {
        const response = await api.get<User>('/api/auth/me');
        return response.data;
    },
};

// ============================================
// Predictions API
// ============================================

export const predictionsApi = {
    getStocks: async (): Promise<StockListResponse> => {
        const response = await api.get<StockListResponse>('/api/stocks');
        return response.data;
    },

    getPrediction: async (symbol: string): Promise<PredictionResponse> => {
        const response = await api.get<PredictionResponse>(`/api/predictions/${symbol}`);
        return response.data;
    },

    getMarketContext: async (symbol: string): Promise<MarketContextResponse> => {
        const response = await api.get<MarketContextResponse>(`/api/market-context/${symbol}`);
        return response.data;
    },

    getPriceData: async (symbol: string, period = '60d', interval = '15m'): Promise<PriceDataResponse> => {
        const response = await api.get<PriceDataResponse>(`/api/price-data/${symbol}`, {
            params: { period, interval },
        });
        return response.data;
    },

    getLivePrice: async (symbol: string): Promise<LivePriceResponse> => {
        const response = await api.get<LivePriceResponse>(`/api/live-price/${symbol}`);
        return response.data;
    },
};

// ============================================
// Trading API
// ============================================

export const tradingApi = {
    buy: async (symbol: string, quantity: number): Promise<TradeResponse> => {
        const data: TradeRequest = { symbol, trade_type: 'BUY', quantity };
        const response = await api.post<TradeResponse>('/api/trade/buy', data);
        return response.data;
    },

    sell: async (symbol: string, quantity: number): Promise<TradeResponse> => {
        const data: TradeRequest = { symbol, trade_type: 'SELL', quantity };
        const response = await api.post<TradeResponse>('/api/trade/sell', data);
        return response.data;
    },

    quickTrade: async (command: string): Promise<TradeResponse> => {
        const response = await api.post<TradeResponse>('/api/trade/quick', { command });
        return response.data;
    },

    getPositions: async (): Promise<PositionsListResponse> => {
        const response = await api.get<PositionsListResponse>('/api/trade/positions');
        return response.data;
    },

    getHistory: async (page = 1, pageSize = 20): Promise<TradeHistoryResponse> => {
        const response = await api.get<TradeHistoryResponse>('/api/trade/history', {
            params: { page, page_size: pageSize },
        });
        return response.data;
    },
};

// ============================================
// Portfolio API
// ============================================

export const portfolioApi = {
    getSummary: async (): Promise<PortfolioSummaryResponse> => {
        const response = await api.get<PortfolioSummaryResponse>('/api/portfolio/summary');
        return response.data;
    },

    getAnalysis: async (): Promise<CorrelationMatrixResponse> => {
        const response = await api.get<CorrelationMatrixResponse>('/api/portfolio/analysis');
        return response.data;
    },

    getPerformance: async (period = '1M'): Promise<PerformanceResponse> => {
        const response = await api.get<PerformanceResponse>('/api/portfolio/performance', {
            params: { period },
        });
        return response.data;
    },
};

// ============================================
// Community API
// ============================================

export const communityApi = {
    getLeaderboard: async (period = 'all_time', limit = 10): Promise<LeaderboardResponse> => {
        const response = await api.get<LeaderboardResponse>('/api/community/leaderboard', {
            params: { period, limit },
        });
        return response.data;
    },
};

export default api;
