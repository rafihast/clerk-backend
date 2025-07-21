// File: middleware.js (di root proyek backend Vercel Anda)
import clerkMiddleware from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
