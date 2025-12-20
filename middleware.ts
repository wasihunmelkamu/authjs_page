// src/middleware.ts ✅ FINAL VERSION
export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dashboard-client/:path*",
    "/api/tasks/:path*",
  ],
};