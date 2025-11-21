// src/app/dashboard/page.tsx
import { auth,signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome, {session.user?.name}!</h1>
      <p className="mt-2 text-gray-600">You are logged in.</p>
      
      <ul className="mt-4 space-y-2">
        <li>✅ Task 1</li>
        <li>📝 Task 2</li>
      </ul>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
        className="mt-6"
      >
        <button
          type="submit"
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Sign Out
        </button>
      </form>
    </div>
  );
}