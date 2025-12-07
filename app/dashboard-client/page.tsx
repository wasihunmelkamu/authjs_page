"use client";
import { LogOut } from "@/action";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

//fetch task
const FeachTask = async () => {
  const res = await fetch("api/tasks");
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
};
//create task
const CreateTask = async (title: string) => {
  const res = await fetch("api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("failed to create");
  return res.json();
};

//update task
const UpdateTask = async (id: string, completed: boolean) => {
  const res = await fetch(`api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Contente-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) throw new Error("failed to update task");
};

const DashboardClient =  () => {
  const queryClient = useQueryClient();
  const { data, error, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: FeachTask,
  });

  const CreateTaskMuation = useMutation({
    mutationFn: (title: string) => CreateTask(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const UpdateTaskMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      UpdateTask(id, completed),
    onMutate: async (newTask) => {
      //optimistci update
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const prevTasks = queryClient.getQueryData<{ tasks: any[] }>(["task"]);
      queryClient.setQueryData(["tasks"], (old: any) => ({
        tasks: old.tasks.map((t: any) =>
          t.id === newTask.id ? { ...t, completed: newTask.completed } : t
        ),
      }));
      return { prevTasks };
    },
    onError: (err, newTask, context) => {
      //Rollbck on error
      queryClient.setQueryData(["tasks"], context?.prevTasks);
    },
  });
  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.taskInput;
    const title = input.value.trim();
    if (title) {
      CreateTaskMuation.mutate(title);
      input.value = "";
    }
  };
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Tasks</h1>
        <form action={LogOut}>
          <button
            type="submit"
            className="text-sm text-red-600 hover:underline"
          >
            Sign Out
          </button>
        </form>
      </div>

      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          name="taskInput"
          type="text"
          placeholder="Add a new task"
          className="flex-1 px-3 py-2 border rounded"
          disabled={CreateTaskMuation.isPending}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={CreateTaskMuation.isPending}
        >
          Add
        </button>
      </form>
      <ul className="space-y-3">
        {data?.tasks.map((task: any) => (
          <li
            key={task.id}
            className="flex items-center gap-3 p-3 border rounded"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={(e) =>
                UpdateTaskMutation.mutate({
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

      {data?.tasks.length === 0 && (
        <p className="text-gray-500">No tasks yet. Add one above!</p>
      )}
    </div>
  );
};
export default DashboardClient