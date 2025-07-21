// middleware.js (in the project root, or src/middleware.js if you’re using a src/ directory)
import { withClerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default withClerkMiddleware((req) => {
  // you can do additional per-request logic here,
  // or just pass through to your handlers:
  return NextResponse.next();
});

// only run this middleware on your API routes (and pages, if you want)
export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/|static/|favicon.ico).*)'
  ],
};
