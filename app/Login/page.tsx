// src/app/login/page.tsx
import { signIn } from "../auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">TaskFlow</h1>
        
        <form
          action={async () => {
            "use server";
            await signIn("credentials", {
              email: "user@example.com",
              password: "password123",
              redirectTo: "/dashboard",
            });
          }}
          className="mb-4"
        >
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Login with Email (Demo)
          </button>
        </form>

        <form
          action={async () => {
            "use server";
            await signIn ("google", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
          >
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
}