import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';

import './globals.css';
import { Providers } from './providers';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'ARTHA - AI-Powered Trading Dashboard',
    description:
        'Professional trading dashboard with real-time ML predictions, paper trading, and portfolio analytics.',
    keywords: ['trading', 'dashboard', 'AI', 'machine learning', 'stocks', 'portfolio'],
    authors: [{ name: 'ARTHA Team' }],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body
                className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
            >
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
