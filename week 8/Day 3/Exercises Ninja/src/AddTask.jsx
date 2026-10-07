import React, { useState } from "react";
import { useTasks } from "./TaskContext.jsx";

export default function AddTask() {
  const [text, setText] = useState("");
  const { dispatch } = useTasks();

  function handleSubmit(event) {
    event.preventDefault();
    const taskText = text.trim();
    if (!taskText) return;

    dispatch({ type: "ADD_TASK", id: crypto.randomUUID(), text: taskText });
    setText("");
  }

  return (
    <form className="add-task" onSubmit={handleSubmit}>
      <label className="visually-hidden" htmlFor="task-input">
        New task
      </label>
      <input
        id="task-input"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Add a new task..."
        maxLength={160}
      />
      <button type="submit" disabled={!text.trim()}>
        Add task <span aria-hidden="true">+</span>
      </button>
    </form>
  );
}
