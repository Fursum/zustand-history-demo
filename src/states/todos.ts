import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type Todo = {
  id: number;
  title: string;
  content: string;
  isDone: boolean;
};

type TodoStore = {
  todos: Todo[];
  addTodo: (todo: Todo) => void;
  editTodo: (todo: Todo) => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  clearTodos: () => void;
};

export const useTodoStore = create<TodoStore>()(
  devtools((set, get) => ({
    todos: [],
    addTodo: (todo) => set((state) => ({ todos: [...state.todos, todo] })),
    editTodo: (todo) =>
      set((state) => {
        const index = state.todos.findIndex((t) => t.id === todo.id);
        state.todos[index] = todo;
        return { todos: [...state.todos] };
      }),
    toggleTodo: (id) =>
      set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id ? { ...todo, isDone: !todo.isDone } : todo
        ),
      })),
    deleteTodo: (id) =>
      set((state) => ({
        todos: state.todos.filter((todo) => todo.id !== id),
      })),
    clearTodos: () => set({ todos: [] }),
  }))
);
