import { useForm } from "react-hook-form";
import { FC, useEffect, useRef, useState } from "react";
import { Todo, useTodoStore } from "@/states/todos";
import { useHistoryStore } from "@/states/history";
import styles from "./style.module.scss";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const TodoDisplay = () => {
  const { todos, clearTodos, addTodo } = useTodoStore();
  const { addAction } = useHistoryStore();

  const [editingId, setEditingId] = useState<number | null>(null);

  const [listRef] = useAutoAnimate({ easing: "ease-out", duration: 200 });

  const handleClear = () => {
    // To restore from history
    const oldTodos = [...todos];

    clearTodos();

    addAction({
      description: {
        title: "Reset",
        content: `Cleared ${oldTodos.length} todos`,
      },
      onRedo: () => clearTodos(),
      onUndo: () => {
        oldTodos.forEach((todo) => {
          addTodo(todo);
        });
      },
    });
  };

  return (
    <div className={styles.displayTodos}>
      <h1>
        My todo list{" "}
        <button className={styles.delete} onClick={handleClear}>
          Clear
        </button>
      </h1>
      <ul ref={listRef}>
        {todos.map((todo) => (
          <li key={todo.id} className={styles.row}>
            {editingId !== todo.id && (
              <TodoCard todo={todo} setEditingId={setEditingId} />
            )}
            {editingId === todo.id && (
              <EditTodo todo={todo} setEditingId={setEditingId} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoDisplay;

const TodoCard: FC<{
  todo: Todo;
  setEditingId: (id: number) => void;
}> = ({ todo, setEditingId }) => {
  const { deleteTodo, toggleTodo } = useTodoStore();
  return (
    <>
      <input
        type="checkbox"
        checked={todo.isDone}
        onChange={() => toggleTodo(todo.id)}
      />
      <div className={styles.text}>
        <h2>{todo.title}</h2>
        <p>{todo.content}</p>
      </div>
      <div className={styles.buttons}>
        <button className={styles.edit} onClick={() => setEditingId(todo.id)}>
          Edit
        </button>
        <button className={styles.delete} onClick={() => deleteTodo(todo.id)}>
          Delete
        </button>
      </div>
    </>
  );
};

type EditTodoForm = {
  title: string;
  content: string;
};

const EditTodo: FC<{
  todo: Todo;
  setEditingId: (id: number | null) => void;
}> = ({ todo, setEditingId }) => {
  const { editTodo } = useTodoStore();
  const { addAction } = useHistoryStore();
  const { register, handleSubmit } = useForm<EditTodoForm>({
    defaultValues: { title: todo.title, content: todo.content },
  });

  const onSubmit = (data: EditTodoForm) => {
    editTodo({
      ...todo,
      ...data,
    });

    addAction({
      description: {
        title: "Edit",
        content: "Edited: " + data.title,
      },
      onUndo: () => editTodo(todo),
      onRedo: () => editTodo({ ...todo, ...data }),
    });

    setEditingId(null);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.editTodoForm}>
      <div className={styles.text}>
        <input {...register("title")} />
        <input {...register("content")} />
      </div>
      <div className={styles.buttons}>
        <button type="submit" className={styles.edit}>
          Confirm
        </button>
        <button
          type="button"
          className={styles.reset}
          onClick={() => setEditingId(null)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
