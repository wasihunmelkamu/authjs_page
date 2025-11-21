import { signIn } from "@/auth";

export default function SingIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        action={async (formData) => {
          "use server";

          const email = formData.get("email")?.toString();
          const password = formData.get("password")?.toString();

          await signIn("credentials", {
            email,
            password,
            redirectTo: "/dashboard",
          });
        }}
        className="mb-8"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
           Email
          </label>
          <input
            className="text-blue-600  underline"
            name="email"
            type="email"
            required
          />
        </div>
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
          Password
          </label>
          <input
            className="text-blue-600 hover:underline"
            name="password"
            type="password"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-red-700 transition"
        ><a href="/dashboard"> Login</a>
          
        </button>
      </form>
    </div>
  );
}
