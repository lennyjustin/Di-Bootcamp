import React, { useEffect, useRef, useState } from "react";
import { useTasks } from "./TaskContext.jsx";

export default function TaskItem({ task, index }) {
  const [isEditing, setIsEditing] = useState(false);
  const editInputRef = useRef(null);
  const { dispatch } = useTasks();

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [isEditing]);

  function saveEdit(event) {
    event.preventDefault();
    const updatedText = editInputRef.current?.value.trim() ?? "";
    if (updatedText) {
      dispatch({ type: "EDIT_TASK", id: task.id, text: updatedText });
      setIsEditing(false);
    } else {
      editInputRef.current?.focus();
    }
  }

  function cancelEdit() {
    setIsEditing(false);
  }

  return (
    <li className={`task-item${task.completed ? " task-item--complete" : ""}`}>
      <span className="task-index">{String(index + 1).padStart(2, "0")}</span>
      <button
        className="completion-toggle"
        type="button"
        aria-label={task.completed ? `Reopen ${task.text}` : `Complete ${task.text}`}
        aria-pressed={task.completed}
        onClick={() => dispatch({ type: "TOGGLE_TASK", id: task.id })}
      >
        {task.completed && <span aria-hidden="true">✓</span>}
      </button>

      {isEditing ? (
        <form className="edit-form" onSubmit={saveEdit}>
          <label className="visually-hidden" htmlFor={`edit-${task.id}`}>
            Edit task
          </label>
          <input
            ref={editInputRef}
            id={`edit-${task.id}`}
            defaultValue={task.text}
            maxLength={160}
            onKeyDown={(event) => {
              if (event.key === "Escape") cancelEdit();
            }}
          />
          <button className="icon-button save-button" type="submit" aria-label="Save task">
            ✓
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={cancelEdit}
            aria-label="Cancel editing"
          >
            ×
          </button>
        </form>
      ) : (
        <>
          <span className="task-text">{task.text}</span>
          <div className="task-actions">
            <button
              className="icon-button"
              type="button"
              onClick={() => setIsEditing(true)}
              aria-label={`Edit ${task.text}`}
              title="Edit task"
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="m13.8 3.6 2.6 2.6M4 16l3.7-.8L16 6.9a1.8 1.8 0 0 0-2.6-2.6l-8.3 8.3L4 16Z" />
              </svg>
            </button>
            <button
              className="icon-button delete-button"
              type="button"
              onClick={() => dispatch({ type: "REMOVE_TASK", id: task.id })}
              aria-label={`Remove ${task.text}`}
              title="Remove task"
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M4.5 6h11M8 6V4h4v2m2.5 0-.6 10h-7L6.3 6m2.2 3v4m3-4v4" />
              </svg>
            </button>
          </div>
        </>
      )}
    </li>
  );
}
