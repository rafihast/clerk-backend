// middleware.js
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  // Route yang boleh diakses tanpa autentikasi
  publicRoutes: [
    '/',                   // home
    '/login',              // halaman login
    '/_next/static/:path*',// asset Next.js
    '/favicon.ico'
  ]
});

// Tentukan route mana yang middleware-nya dijalankan
export const config = {
  matcher: [
    '/api/:path*',               // semua API route
    '/((?!_next/|static/|favicon.ico).*)' // semua page kecuali asset Next.js
  ],
};
