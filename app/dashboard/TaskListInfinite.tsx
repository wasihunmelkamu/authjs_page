"use client";
import {
  useInfiniteQuery,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";

import { useEffect, useRef } from "react";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
  createdAt: string;
}
interface TasksPage {
  tasks: Task[];
  nextPage: number | null;
  hasMore: boolean;
}
//fetch page of tasks
async function fetchTasksPage(pageParam = 1): Promise<TasksPage> {
  const res = await fetch(`api/tasks?page=${pageParam}&limit=10`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json(); // expectd :{task:[], nextPage:2 ,hasMore:true}
}
//Create task
const CreateTask = async (title: string) => {
  const res = await fetch("api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
};
//update task
const UpdateTask = async (id: string, completed: boolean) => {
  const res = await fetch(`api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
};

const TaskListInfinte = async () => {
  const queryClient = useQueryClient();
  const observeRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["tasks"],
      queryFn: ({ pageParam }) => fetchTasksPage(pageParam as number),
      initialPageParam: 1,
      getNextPageParam: (lastPage: TasksPage) => {
        return lastPage.hasMore ? lastPage.nextPage : undefined;
      },
    });
  //
  const CreateTaskMutaion = useMutation({
    mutationFn: (title: string) => CreateTask(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
  const UpdateTaskMution = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      UpdateTask(id, completed),
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousData = queryClient.getQueryData<any>(["tasks"]);
      queryClient.setQueryData(["tasks"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: TasksPage, pageIndex: number) => {
            const taskIndex = page.tasks.findIndex((t) => t.id === newTask.id);
            if (taskIndex !== -1) {
              const updateTasks = [...page.tasks];
              updateTasks[taskIndex] = {
                ...updateTasks[taskIndex],
                completed: newTask.completed,
              };
              return { ...page, tasks: updateTasks };
            }
            return page;
          }),
        };
      });
      return { previousData };
    },
    onError: (err, newTask, context) => {
      queryClient.setQueryData(["tasks"], context?.previousData);
    },
  });

  //Infinte scroll trigger
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );
    observer.observe(loadMoreRef.current);
    observeRef.current = observer;
    return () => {
      if (observeRef.current) observeRef.current.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage]);
  if (status === "pending") return <div>Loaddin..</div>;
  if (status === "error") return <div>Error Loading tasks</div>;
  const allTask = data.pages.flatMap((page) => page.tasks);
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Tasks</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.taskInput as HTMLInputElement;
          const title = input.value.trim();
          if (title) {
            CreateTaskMutaion.mutate(title);
            input.value = "";
          }
        }}
        className="mb-6 flex gap-2"
      >
        <input
          name="taskInput"
          type="text"
          placeholder="Add a new task"
          className="felx-1 px-3 py-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-600  text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </form>
      {/* Task List */}
      <ul className="space-y-3">
        {allTask.map((task) => (
          <li
            key={task.id}
            className="felx items-center gap-3 p-3 border rounded"
          >
            {" "}
            <input
              type="checkbox"
              checked={task.completed}
              onChange={(e) =>
                UpdateTaskMution.mutate({
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
      {/* 📥 Load More Trigger */}
      <div ref={loadMoreRef} className="h-10">
        {isFetchingNextPage && <div>Loading more...</div>}
        {!hasNextPage && allTask.length > 0 && <div>No more tasks</div>}
      </div>
    </div>
  );
};
