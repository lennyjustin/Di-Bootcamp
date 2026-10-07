import React from "react";
import { useTasks } from "./TaskContext.jsx";

export default function TaskItem({ task }) {
  const { dispatch } = useTasks();

  return (
    <li className={`task-row${task.completed ? " is-complete" : ""}`}>
      <button
        className="task-check"
        type="button"
        onClick={() => dispatch({ type: "TOGGLE_TASK", id: task.id })}
        aria-label={task.completed ? `Reopen ${task.text}` : `Complete ${task.text}`}
        aria-pressed={task.completed}
      >
        {task.completed && <span aria-hidden="true">✓</span>}
      </button>
      <span className="task-copy">{task.text}</span>
      <button
        className="remove-task"
        type="button"
        onClick={() => dispatch({ type: "REMOVE_TASK", id: task.id })}
        aria-label={`Remove ${task.text}`}
        title="Remove task"
      >
        ×
      </button>
    </li>
  );
}
