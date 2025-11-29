"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { title } from "process";
import { use } from "react";
import { da } from "zod/locales";
//fetch tasks
const fetchTask = async () => {
  const res = await fetch("/tasks");
  if (!res.ok) throw new Error("Failed  to fetch tasks");
  return res.json();
};
//create tasks
const createTasks = async (title: string) => {
  const res = await fetch("/taks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Faild to create tasks");
  return res.json();
};
// update tasks
const UpdateTask = async (id: string, complted: boolean) => {
  const res = await fetch(`/tasks${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ complted }),
  });
  if (!res.ok) throw new Error("Failed to updte task");
};
export default function DashboardClient() {
  const queryClient = useQueryClient(); // get permisson to  read,update and delet the cach data
  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTask,
  });
  const createTaskMuation = useMutation({
    mutationFn: ({ title }: { title: string }) => createTasks(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
  const UpdateTaskMutation = useMutation({
    mutationFn: ({ id, complted }: { id: string; complted: boolean }) =>
      UpdateTask(id, complted),
    onMutate: async (newTask) => {
      //optimistc update}

      await queryClient.cancelQueries({ queryKey: ["tasks"] }); // to prevent ongoing  requst not overide   update
      const prevTasks = queryClient.getQueryData<{ tasks: any[] }>(["tasks"]);
      queryClient.setQueryData(["tasks"], (old: any) => ({
        tasks: old.tasks.map((t: any) =>
          t.id === newTask ? { ...t, complted: newTask.complted } : t
        ),
      }));
    },
  });
  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.taskInput;
    const title = input.value.trim();
    if (title) {
      createTaskMuation.mutate({ title });
      input.value = "";
    }
  };
  if (isLoading) return <div>Loading..</div>;
  if (error) return <div>Error:{(error as Error).message}</div>;
  return (
    <div className="p-6 max-w-2x1 mx-auto">
      <div className="felx justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Tasks</h1>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          {" "}
          <button
            type="submit"
            className="text-sm text-red-600 however:underline"
          >
            Sign Out
          </button>
        </form>
      </div>
      {/* create task */}
      <form>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={createTaskMuation.isPending}
        >
          Add
        </button>
      </form>
      {/* Task list*/}
      <ul className="space-y3">
        {data?.tasks.map((task: any) => (
          <li
            key={task.id}
            className="felx items-center gap-3 p-3 border rounded"
          >
            <input
              type="checkbox"
              checked={task.complted}
              onChange={(e) =>
                UpdateTaskMutation.mutate({
                  id: task.id,
                  complted: e.target.checked,
                })
              }
              className="h-5 w-5"
            />
            <span className={task.complted ? "line-through text-gray-500" : ""}>
              {task.title}
            </span>
          </li>
        ))}
      </ul>
      {data.tasks.length === 0 && (
        <p className="text-gray-500">No tasks yet.Add one above!</p>
      )}
    </div>
  );
}
