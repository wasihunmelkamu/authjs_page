
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { completed } = await request.json();
  const task = await prisma.task.findUnique({
    where: { id: params.id, userId: session.user.id },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const updated = await prisma.task.update({
    where: { id: task.id },
    data: { completed },
  });

  return NextResponse.json({ task: updated });
}
