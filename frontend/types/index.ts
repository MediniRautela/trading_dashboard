/**
 * TypeScript interfaces for ARTHA Trading Dashboard
 */

// ============================================
// User & Auth Types
// ============================================

export interface User {
    id: string;
    email: string;
    username: string;
    avatar_url: string | null;
    paper_balance: number;
    initial_balance: number;
    total_return_percentage: number;
    is_verified: boolean;
    created_at: string;
    last_login: string | null;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
}

export interface LoginResponse {
    user: User;
    tokens: TokenResponse;
}

export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

// ============================================
// Trading Types
// ============================================

export type TradeType = 'BUY' | 'SELL';

export interface TradeRequest {
    symbol: string;
    trade_type: TradeType;
    quantity: number;
}

export interface TradeResponse {
    id: string;
    symbol: string;
    trade_type: TradeType;
    quantity: number;
    price: number;
    total_value: number;
    balance_before: number;
    balance_after: number;
    status: string;
    executed_at: string;
    message: string;
}

export interface Position {
    id: string;
    symbol: string;
    quantity: number;
    average_price: number;
    total_cost: number;
    current_price: number;
    current_value: number;
    pnl: number;
    pnl_percentage: number;
    updated_at: string;
}

export interface PositionsListResponse {
    positions: Position[];
    total_value: number;
    total_pnl: number;
    total_pnl_percentage: number;
}

export interface TradeHistoryItem {
    id: string;
    symbol: string;
    trade_type: TradeType;
    quantity: number;
    price: number;
    total_value: number;
    status: string;
    created_at: string;
}

export interface TradeHistoryResponse {
    trades: TradeHistoryItem[];
    total_count: number;
    page: number;
    page_size: number;
}

// ============================================
// Prediction Types
// ============================================

export type SignalStrength = 'STRONG' | 'MODERATE' | 'WEAK';
export type Direction = 'UP' | 'DOWN';
export type Sentiment = 'BULLISH' | 'BEARISH' | 'NEUTRAL';
export type Recommendation = 'BUY' | 'HOLD' | 'SELL' | 'AVOID';

export interface PredictionResponse {
    symbol: string;
    direction: Direction;
    up_probability: number;
    down_probability: number;
    predicted_return: number;
    predicted_return_percentage: number;
    confidence: number;
    signal_strength: SignalStrength;
    prediction_horizon: string;
    model_version: string;
    generated_at: string;
}

export interface MarketContextResponse {
    symbol: string;
    sentiment: Sentiment;
    confidence: number;
    summary: string;
    key_factors: string[];
    recommendation: Recommendation | null;
    updated_at: string;
}

export interface OHLCVBar {
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface PriceDataResponse {
    symbol: string;
    interval: string;
    bars: OHLCVBar[];
    last_updated: string;
}

export interface LivePriceResponse {
    symbol: string;
    price: number;
    change: number;
    change_percentage: number;
    volume: number;
    timestamp: string;
}

export interface StockInfo {
    symbol: string;
    name: string;
    sector: string | null;
    is_tradeable: boolean;
}

export interface StockListResponse {
    stocks: StockInfo[];
    total: number;
}

// ============================================
// Portfolio Types
// ============================================

export interface PortfolioSummaryResponse {
    total_value: number;
    cash_balance: number;
    invested_value: number;
    total_pnl: number;
    total_pnl_percentage: number;
    day_pnl: number;
    day_pnl_percentage: number;
    positions_count: number;
    total_trades: number;
    win_rate: number;
    updated_at: string;
}

export interface CorrelationEntry {
    symbol_x: string;
    symbol_y: string;
    correlation: number;
}

export type DiversificationGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface CorrelationMatrixResponse {
    symbols: string[];
    matrix: number[][];
    risk_score: number;
    diversification_grade: DiversificationGrade;
    high_correlation_pairs: CorrelationEntry[];
    recommendation: string;
}

export interface PerformanceMetric {
    date: string;
    value: number;
    pnl: number;
    pnl_percentage: number;
}

export interface PerformanceResponse {
    metrics: PerformanceMetric[];
    period: string;
    start_value: number;
    end_value: number;
    total_return: number;
    total_return_percentage: number;
    max_drawdown: number;
    sharpe_ratio: number | null;
}

// ============================================
// Community Types
// ============================================

export interface LeaderboardEntry {
    rank: number;
    user_id: string;
    username: string;
    avatar_url: string | null;
    return_percentage: number;
    total_trades: number;
    win_rate: number;
    is_current_user: boolean;
}

export interface LeaderboardResponse {
    entries: LeaderboardEntry[];
    period: string;
    total_participants: number;
    current_user_rank: number | null;
    updated_at: string;
}

// ============================================
// UI State Types
// ============================================

export interface CommandItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    shortcut?: string;
    action: () => void;
    group: 'navigation' | 'actions' | 'quick_trade';
}
