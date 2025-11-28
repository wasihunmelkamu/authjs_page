import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

const GET=async(request: Request) =>{
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
export default GET