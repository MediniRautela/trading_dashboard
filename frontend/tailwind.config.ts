import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: 'class',
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './lib/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Background colors
                background: {
                    DEFAULT: 'var(--background)',
                    secondary: 'var(--background-secondary)',
                    tertiary: 'var(--background-tertiary)',
                    elevated: 'var(--background-elevated)',
                },
                // Border colors
                border: {
                    DEFAULT: 'var(--border)',
                    hover: 'var(--border-hover)',
                },
                // Text colors
                foreground: {
                    DEFAULT: 'var(--text-primary)',
                    secondary: 'var(--text-secondary)',
                    muted: 'var(--text-muted)',
                },
                // Semantic colors
                accent: {
                    DEFAULT: 'var(--accent)',
                    foreground: '#ffffff',
                },
                success: {
                    DEFAULT: 'var(--success)',
                    foreground: '#ffffff',
                },
                danger: {
                    DEFAULT: 'var(--danger)',
                    foreground: '#ffffff',
                },
                warning: {
                    DEFAULT: 'var(--warning)',
                    foreground: '#000000',
                },
                // Chart colors
                chart: {
                    bullish: 'var(--chart-bullish)',
                    bearish: 'var(--chart-bearish)',
                    neutral: 'var(--chart-neutral)',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            fontSize: {
                'display': ['32px', { lineHeight: '1.2', fontWeight: '600' }],
                'heading': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
                'body': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
                'caption': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideDown: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                pulseGlow: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
            },
            boxShadow: {
                'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
                'glow-success': '0 0 20px rgba(34, 197, 94, 0.3)',
                'glow-danger': '0 0 20px rgba(239, 68, 68, 0.3)',
            },
        },
    },
    plugins: [],
};

export default config;
