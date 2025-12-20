// src/app/dashboard/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import * as Sentry from "@sentry/nextjs";
import { redirect } from "next/navigation";

import TaskListInfinite from "./TaskListInfinite";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/Login");
  }

  // set sentry user context -runs in same serverless function as page
  Sentry.setUser({
    id: session.user.id,
    email: session.user.email as string,
    username: session.user.name || undefined,
  });
  const tasks = await prisma.task.findMany({
    where: { userId: session.user?.id },
    orderBy: { createdAt: "desc" },
  });

  return <TaskListInfinite />;
}
