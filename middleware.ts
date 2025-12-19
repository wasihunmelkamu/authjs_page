import { request } from "http";
// src/middleware.ts
import { auth } from "@/auth";

import { NextRequest, NextResponse } from "next/server";
import { email } from "zod";
export async function middleware(request: NextRequest) {
  const session = await auth();
  if (session && request.nextUrl.pathname === "/Login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  //call lightweight Api to log sentry user
  if (session?.user) {
    fetch(`${request.nextUrl.origin}/api/set-sentry-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      }),
    }).catch(() => {});
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard-client/:path*"],
};
