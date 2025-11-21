import { VerificationToken } from "./node_modules/.pnpm/@prisma+client@6.19.0_typescript@5.9.3/node_modules/.prisma/client/index.d";

import { prisma } from "@/prisma";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(
      new URL("/singup?error=invalid_token", request.url)
    );
  }
  // find token
  const VerificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });
  if (!VerificationToken || VerificationToken.expires < new Date()) {
    return NextResponse.redirect(
      new URL("/signup?error=expired_toekn", request.url)
    );
  }
  // update user to verified
  await prisma.user.update({
    where: { email: VerificationToken.identifier },
    data: { emailVerified: new Date() },
  });
  // Delete token
  await prisma.verificationToken.delete({
    where: { token: VerificationToken.token },
  });
  // Redirect to login
  return NextResponse.redirect(new URL("/login?verified=1", request.url));
}
