
import { auth } from "@/auth";
import { NextResponse,NextRequest } from "next/server";
import { prisma } from "@/prisma";
export async function PATCH(
  request:NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const {id}=await params
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { completed } = await request.json();
  const task = await prisma.task.findUnique({
    where: { id: id, userId: session.user.id },
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
