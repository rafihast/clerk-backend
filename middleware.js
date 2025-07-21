import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/api/verify", "/api/hello"],
  ignoredRoutes: [],
});

export const config = {
  matcher: [
    /*
     * Apply middleware to all routes except:
     * - static files (_next, favicon, etc)
     * - public routes
     */
    "/((?!_next|favicon.ico|api/verify|api/hello|public).*)",
  ],
};
