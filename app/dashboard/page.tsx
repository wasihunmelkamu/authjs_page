// src/app/dashboard/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { redirect } from "next/navigation";
import TaskListClient from "../TaskListClient/page";
import TaskListInfinite from "./TaskListInfinite";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/Login");
  }

  const tasks = await prisma.task.findMany({
    where: { userId: session.user?.id },
    orderBy: { createdAt: "desc" },
  });

  return <TaskListInfinite />;
}