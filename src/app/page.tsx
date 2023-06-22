"use client";
import AddTodoForm from "@/components/AddTodoForm";
import TodoDisplay from "@/components/TodoDisplay";
import HistoryDisplay from "@/components/HistoryDisplay";

// Todo list example
export default function Home() {
  return (
    <div className="flex justify-center flex-wrap-reverse p-2 gap-4">
      <div className="flex flex-col gap-4">
        <AddTodoForm />
        <TodoDisplay />
      </div>
      <div>
        <HistoryDisplay />
      </div>
    </div>
  );
}
