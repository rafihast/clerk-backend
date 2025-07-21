// middleware.js
import { authMiddleware } from "@clerk/nextjs/server"; // ✅ gunakan dari /server

export default authMiddleware({
  publicRoutes: ["/", "/api/verify"], // rute yang bisa diakses tanpa login
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"], // Default matcher dari Clerk
};
