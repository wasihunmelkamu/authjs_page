import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

// fetch task
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  const total = await prisma.task.count({
    where: { userId: session.user.id },
  });

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    tasks,
    nextPage: skip + limit < total ? page + 1 : null,
    hasMore: skip + limit < total,
  });
}

//create task

export async function POST(request: Request) {
  const session = await auth();
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
