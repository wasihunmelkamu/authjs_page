// src/app/login/page.tsx
import { signIn,auth } from "@/auth";
import { redirect } from "next/navigation";

export default function LoginPage() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">TaskFlow</h1>

        {/* Email/Password Login */}
        <form
          action={async (formData: FormData) => {
            "use server";
            await signIn("credentials", {
              email: formData.get("email") as string,
              password: formData.get("password") as string,
              redirectTo: "/dashboard",
            });
          }}
          className="mb-4"
        >
          <div>
            <div>
              <label htmlFor="name">Email</label>
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="w-full px-3 py-2 mb-2 border rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="w-full px-3 py-2 mb-3 border rounded"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Sign in with Email
          </button>
        </form>

        {/* Google Login */}
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
          >
            Sign in with Google
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="/sinUp" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
