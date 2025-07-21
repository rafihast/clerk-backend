// middleware.js
import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Jalankan Clerk middleware untuk semua route yang dicakup di `matcher`.
// Ini akan meng-parse header Authorization / cookie dan membuat `getAuth(req)` bisa mendapatkan session.
export default clerkMiddleware();

// Konfigurasi route mana saja yang lewat middleware.
// Di sini kita apply ke semua API dan page (kecuali asset _next/static, favicon, dll).
export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/|static/|favicon.ico).*)'
  ]
};
