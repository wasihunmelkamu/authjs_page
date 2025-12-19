// src/middleware.ts
import { auth } from "@/auth";
export { auth as middleware } from "@/auth";

import * as Sentry from "@sentry/nextjs";
import { NextRequest } from "next/server";
export async function middlewares(request: NextRequest) {
  const session = await auth();

  if (session?.user) {
    Sentry.setUser({
      id: session.user.id,
      email: session?.user.email as string,
      username: session.user.name || undefined,
    });
  }
  if (session && request.nextUrl.pathname === "/Login") {
    return Response.redirect(new URL("/dashboard", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard-client/:path*"],
};
