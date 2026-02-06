'use client';

/**
 * Price Chart Component
 * Visualizes historical price data using Recharts
 */
import { useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { format } from 'date-fns';

import { usePriceData } from '@/hooks';
import { cn, formatCurrency } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface PriceChartProps {
    symbol: string;
}

const RANGES = [
    { label: '1D', value: '1d', interval: '5m' },
    { label: '5D', value: '5d', interval: '15m' },
    { label: '1M', value: '1mo', interval: '60m' },
    { label: '3M', value: '3mo', interval: '1d' },
    { label: '1Y', value: '1y', interval: '1d' },
];

export function PriceChart({ symbol }: PriceChartProps) {
    const [range, setRange] = useState(RANGES[2]); // Default to 1M
    const { data, isLoading, error } = usePriceData(symbol, range.value, range.interval);

    if (isLoading) {
        return (
            <div className="card h-[400px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
        );
    }

    if (error || !data?.bars || data.bars.length === 0) {
        return (
            <div className="card h-[400px] flex items-center justify-center text-foreground-muted">
                <p>No price data available for {symbol}</p>
            </div>
        );
    }

    // Format data for Recharts
    const chartData = data.bars.map((bar: any) => ({
        ...bar,
        date: new Date(bar.timestamp),
    }));

    const isPositive = chartData[chartData.length - 1].close >= chartData[0].close;
    const color = isPositive ? '#10B981' : '#EF4444'; // Success or Danger color

    return (
        <div className="card h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-lg">{symbol} Price</h3>
                    <p className="text-sm text-foreground-muted">
                        {range.label} • {formatCurrency(chartData[chartData.length - 1].close)}
                    </p>
                </div>

                {/* Range Selectors */}
                <div className="flex gap-1 bg-background-tertiary p-1 rounded-lg">
                    {RANGES.map((r) => (
                        <button
                            key={r.value}
                            onClick={() => setRange(r)}
                            className={cn(
                                'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                                range.value === r.value
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-foreground-muted hover:text-foreground'
                            )}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(date) => {
                                if (range.value === '1d') return format(date, 'HH:mm');
                                if (range.value === '5d') return format(date, 'MMM dd');
                                return format(date, 'MMM dd');
                            }}
                            stroke="#666"
                            tick={{ fill: '#888', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            tickFormatter={(val) => `$${val}`}
                            stroke="#666"
                            tick={{ fill: '#888', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            width={60}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1A1A1A',
                                borderColor: '#333',
                                borderRadius: '8px',
                            }}
                            itemStyle={{ color: '#fff' }}
                            labelFormatter={(date) => format(date, 'MMM dd, HH:mm')}
                            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                        />
                        <Area
                            type="monotone"
                            dataKey="close"
                            stroke={color}
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
