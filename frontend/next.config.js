/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Enable experimental features
    // experimental: {
    //     serverActions: true,
    // },

    // Environment variables
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    },

    // Security headers
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                ],
            },
        ];
    },

    // API proxy for development
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:8000/api/:path*',
            },
            {
                source: '/ws/:path*',
                destination: 'http://localhost:8000/ws/:path*',
            },
        ];
    },
};

module.exports = nextConfig;
