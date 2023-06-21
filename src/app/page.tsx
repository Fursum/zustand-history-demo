"use client";
import { useState } from "react";
import AddTodoForm from "@/components/AddTodoForm";
import TodoDisplay from "@/components/TodoDisplay";

// Todo list example
export default function Home() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsHistoryOpen((value) => !value)}>
        Show history
      </button>

      <AddTodoForm />
      <TodoDisplay />
    </div>
  );
}
