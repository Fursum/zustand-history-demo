import { FC } from "react";
import { FieldError, useForm, UseFormRegister } from "react-hook-form";
import { useHistoryStore } from "@/states/history";
import { Todo, useTodoStore } from "@/states/todos";
import styles from "./style.module.scss";

type TodoForm = {
  title: string;
  content: string;
};

const AddTodoForm: FC = () => {
  const { register, handleSubmit, formState } = useForm<TodoForm>();
  const { addTodo, deleteTodo } = useTodoStore();
  const { addAction } = useHistoryStore();

  const onSubmit = (data: TodoForm) => {
    const id = Date.now();
    const newTodo: Todo = {
      ...data,
      id: id,
      isDone: false,
    };

    addTodo(newTodo);
    addAction({
      description: {
        title: "Add",
        content: "New todo: " + data.title,
      },
      onUndo: () => deleteTodo(id),
      onRedo: () => addTodo(newTodo),
    });
  };

  return (
    <form className={styles.addTodoForm} onSubmit={handleSubmit(onSubmit)}>
      <h1>Add todo</h1>
      <FormRow
        label="Title"
        name="title"
        register={register}
        hasError={formState.errors.title}
      />
      <FormRow
        label="Content"
        name="content"
        register={register}
        hasError={formState.errors.content}
      />
      <button className={styles.edit}>Add</button>
    </form>
  );
};

export default AddTodoForm;

const FormRow: FC<{
  label: string;
  name: keyof TodoForm;
  register: UseFormRegister<TodoForm>;
  hasError?: FieldError;
}> = ({ label, name, register, hasError }) => {
  return (
    <div className={styles.row}>
      <label htmlFor={name}>{label}</label>
      <input
        className={hasError ? styles.error : ""}
        id={name}
        type="text"
        placeholder={`Write a ${name}`}
        {...register(name, { required: true })}
      />
    </div>
  );
};
