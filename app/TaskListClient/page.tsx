// src/app/dashboard/TaskListClient.tsx
"use client";

import { LogOut } from "@/action";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";

// Define TypeScript interface for Task
interface Task {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
  createdAt: string;
}

// Fetch functions (same as before, but using /tasks)
// const FeachTask = async () => {
//   const res = await fetch("api/tasks");
//   if (!res.ok) throw new Error("Failed to fetch tasks");
//   return res.json();
// };

async function createTask(title: string) {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
}

async function updateTask(id: string, completed: boolean) {
  console.log(id)
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
}

export default function TaskListClient({
  initialTasks,
}: {
  initialTasks: Task[];
}) {
  const queryClient = useQueryClient();

  // 💧 HYDRATE CACHE ON MOUNT
  useEffect(() => {
    // Set initial data in TanStack Query cache
    queryClient.setQueryData(["tasks"], { tasks: initialTasks });
  }, [initialTasks]);

  // ➕ CREATE TASK MUTATION
  const createTaskMutation = useMutation({
    mutationFn: (title: string) => createTask(title),
    onSuccess: () => {
      // Refetch tasks to get fresh data (in case server added timestamps, etc.)
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // ✅ TOGGLE TASK MUTATION (with optimistic update)
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      updateTask(id, completed),
    onMutate: async (newTask) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<{ tasks: Task[] }>([
        "tasks",
      ]);

      // Optimistically update cache
      queryClient.setQueryData(["tasks"], (old: any) => ({
        tasks:
          old?.tasks.map((task: Task) =>
            task.id === newTask.id
              ? { ...task, completed: newTask.completed }
              : task
          ) || [],
      }));

      // Return context for rollback
      return { previousTasks };
    },
    onError: (error, newTask, context) => {
      // Roll back to previous value on error
      queryClient.setQueryData(["tasks"], context?.previousTasks);
    },
  });

  // 📝 Handle form submission
  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.taskInput as HTMLInputElement;
    const title = input.value.trim();
    if (title) {
      createTaskMutation.mutate(title);
      input.value = "";
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Tasks</h1>
        <form
          action={LogOut}
            
        >
          <button
            type="submit"
            className="text-sm text-red-600 hover:underline"
          >
            Sign Out
          </button>
        </form>
      </div>

      {/* ➕ Add Task Form */}
      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          name="taskInput"
          type="text"
          placeholder="Add a new task"
          className="flex-1 px-3 py-2 border rounded"
          disabled={createTaskMutation.isPending}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={createTaskMutation.isPending}
        >
          Add
        </button>
      </form>

      {/* ✅ Task List */}
      <ul className="space-y-3">
        {initialTasks?.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-3 p-3 border rounded"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={(e) =>
                updateTaskMutation.mutate({
                  id: task.id,
                  completed: e.target.checked,
                })
              }
              className="h-5 w-5"
            />
            <span
              className={task.completed ? "line-through text-gray-500" : ""}
            >
              {task.title}
            </span>
          </li>
        ))}
      </ul>

      {initialTasks?.length === 0 && (
        <p className="text-gray-500">No tasks yet. Add one above!</p>
      )}
    </div>
  );
}
