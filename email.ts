
import { Resend } from "resend";
const resend = new Resend(process.env?.RESEND_API_KEY);
interface verificationEmailProps {
  email: string;
  token: string;
}
export async function sendVerificationEmail({
  email,
  token,
}: verificationEmailProps) {
  const verifyLink = `${process.env.NextAuth_URL}/verify-email?token=${token}`;
  await resend.emails.send({
    from: "TaskFlow <no-reply@yourdomain.com",
    to: email,
    subject: "verify your email",
    html: `<h2>Verify your email</h2>
      <p>Click the link below to verify your email address:</p>
       <a href="${verifyLink}" style="display:inline-block;padding:10px 20px;background:#0070f3;color:white;text-decoration:none;border-radius:5px;"> veify Email</a> <p>This link expires in 1 hour.</p>`,
  });
}
