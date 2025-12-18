import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

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
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { title } = await request.json();
    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        userId: session?.user.id,
      },
    });
    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    //capture with context

    Sentry.captureException(error, { tags: { api: "tasks", methode: "POST" } });
    return NextResponse.json({ error: "server error " }, { status: 500 });
  }
}
//
