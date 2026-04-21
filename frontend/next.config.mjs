/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Aplica os cabeçalhos de segurança para todas as rotas (source: '/(.*)')
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://appssdk.zoom.us; style-src 'self' 'unsafe-inline'; connect-src 'self' wss: https:; img-src 'self' data: https:;"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
