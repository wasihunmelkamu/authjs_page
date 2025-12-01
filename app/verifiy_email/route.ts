import { request } from "http";
import { prisma } from "@/prisma";
import { NextResponse } from "next/server";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(
      new URL("/signUp?error=invalied_token", request.url)
    );
  }
  //find token
  const VerficationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });
  if (!VerficationToken || VerficationToken.expires < new Date()) {
    return NextResponse.redirect(
      new URL("/signUp?error=expired_token", request.url)
    );
  }
  // update user to verfied
  await prisma.user.update({
    where: {
      email: VerficationToken.identifier,
    },
    data: { emailVerified: new Date() },
  });
  // delet token\
  await prisma.verificationToken.delete({
    where: { token: VerficationToken.token },
  });
  //redirect to login
  return NextResponse.redirect(new URL("/login?verified=1", request.url));
}
