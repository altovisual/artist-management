/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
              "style-src 'self' 'unsafe-inline';",
              "img-src 'self' data:;",
              "font-src 'self';",
              // Aquí está la parte importante para Supabase
              "connect-src 'self' https://tdbomtxyevggobphozdu.supabase.co wss://tdbomtxyevggobphozdu.supabase.co;",
            ].join(' '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;