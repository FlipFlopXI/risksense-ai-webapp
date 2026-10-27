/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['10.0.2.2'],
  transpilePackages: ['three'],
  async rewrites() {
    const api = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
    return api ? [{ source: '/backend/:path*', destination: `${api}/:path*` }] : [];
  },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'Referrer-Policy', value: 'no-referrer' },
    ] }, { source: '/register/complete', headers: [
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'Cache-Control', value: 'no-store' },
    ] }];
  },
};

export default nextConfig;
