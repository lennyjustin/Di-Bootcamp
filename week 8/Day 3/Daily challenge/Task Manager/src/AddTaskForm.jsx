import React, { useState } from "react";
import { useTasks } from "./TaskContext.jsx";

export default function AddTaskForm() {
  const [text, setText] = useState("");
  const { dispatch } = useTasks();

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText) return;

    dispatch({
      type: "ADD_TASK",
      id: crypto.randomUUID(),
      text: trimmedText,
    });
    setText("");
  }

  return (
    <form className="add-task-form" onSubmit={handleSubmit}>
      <label className="visually-hidden" htmlFor="new-task">
        Add a task
      </label>
      <span className="add-task-icon" aria-hidden="true">
        +
      </span>
      <input
        id="new-task"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="What needs to get done?"
        maxLength={160}
        autoComplete="off"
      />
      <button type="submit" disabled={!text.trim()}>
        Add task <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}
