import { prisma } from "@/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { sendVerificationEmail } from "@/email";
import { generateId } from "lucia";
import { z } from "zod";
//password validation schema
const SignUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(8, "password must be at least 8 characters")
    .regex(/[A-Z]/, "password  must contain an uppercase letter")
    .regex(/[0-9]/, "password must contain a number"),
});
export async function SignUp(formData: FormData) {
  "use server";
  const rawFormData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  //validation with zod
  const validated = SignUpSchema.safeParse(rawFormData);
  if (!validated.success) {
    const errors = validated.error.flatten().fieldErrors;

    throw new Error("Invalid input");
  }
  const { name, email, password } = validated.data;
  //check for duplicate email
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    if (existingUser.emailVerified) {
      throw new Error("Email already in use");
    } else {
      throw new Error("Email not  verified. check  your inbox");
    }
  }
  //has password
  const hashedPassword = await bcrypt.hash(password, 10);
  //Generate verification token
  const token = generateId(32); // crypto.randomUUID()
  //CREATE USER (unverified)
  await prisma.user.create({
    data: { email, name, password: hashedPassword, emailVerified: null },
  });
  //save verfication token
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 3600000),
    },
  });
  // send verification email
  await sendVerificationEmail({ email, token });
  // Redirect to 'check email' page
  redirect("/check-email");
}

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>

        <form action={SignUp} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 "
            >
              Full Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md "
            ></input>
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="8+ chars, uppercase, number"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/Login" className="text-blue-600 hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
export default SignUpPage;
