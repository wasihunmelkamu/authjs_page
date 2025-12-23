// src/app/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">Welcome to TaskFlow</h1>
      <p className="text-gray-600 mb-6">Secure task management with Auth.js</p>
      <a
        href="/Login"
        className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
      >
        Get Started
      </a>
    </div>

  );
}