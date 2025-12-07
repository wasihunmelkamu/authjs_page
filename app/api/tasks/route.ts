import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

// fetch task
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const tasks = await prisma.task.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
  
    return NextResponse.json({ tasks });
  }
//create task
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title } = await request.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      userId: session.user.id,
    },
  });

  return NextResponse.json({ task }, { status: 201 });
}
