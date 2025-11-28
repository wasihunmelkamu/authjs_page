import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { error } from "console";
import { request } from "http";

import { NextResponse } from "next/server";
//GET/api/tasks -fetch user's tasks
export async function GET() {
  const session = auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const tasks=await prisma.task.findMany({where:{userId:session.user.id},orderBy:{createdAt:'desc'}})
  return NextResponse.json({tasks})
}
// post/api/tasks-create new task
export async function POST(request:Request){
 const session=auth()
 if(!session?.user?.id){

    return NextResponse.json({error:'unauthrized',{status:401}})
 } 
 const {title}=await request.json();
 if(!title?.tirm()){
    return NextResponse.json({error:'title is required'},{status:400})
 }
 const task=await prisma.task.create({ data:{title:title:title.tirm(),userId:session.user.id}});
 return NextResponse.json({task},{status:201});
}
//PATCH/PUT/api/tasls/[id]-update tas



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
    where: { id: task.id },data:
     { completed },
  });

  return NextResponse.json({ task: updated });
}