import React from "react";
import { useTasks } from "./TaskContext.jsx";
import TaskItem from "./TaskItem.jsx";

const filters = [
  { id: "all", label: "All tasks" },
  { id: "active", label: "In progress" },
  { id: "completed", label: "Completed" },
];

export default function TaskList() {
  const { state, dispatch } = useTasks();
  const visibleTasks = state.tasks.filter((task) => {
    if (state.filter === "active") return !task.completed;
    if (state.filter === "completed") return task.completed;
    return true;
  });
  const completedCount = state.tasks.filter((task) => task.completed).length;

  return (
    <section className="task-board" aria-labelledby="task-list-title">
      <div className="task-board-heading">
        <div>
          <p className="section-kicker">YOUR WORKSPACE</p>
          <h2 id="task-list-title">Today’s tasks</h2>
        </div>
        <span className="task-total">
          {String(state.tasks.length).padStart(2, "0")}
          <span> TOTAL</span>
        </span>
      </div>

      <div className="filter-tabs" role="group" aria-label="Filter tasks">
        {filters.map((filter) => (
          <button
            className={`filter-tab${state.filter === filter.id ? " is-active" : ""}`}
            key={filter.id}
            type="button"
            aria-pressed={state.filter === filter.id}
            onClick={() => dispatch({ type: "FILTER_TASKS", filter: filter.id })}
          >
            {filter.label}
            {filter.id === "completed" && completedCount > 0 && (
              <span className="filter-count">{completedCount}</span>
            )}
          </button>
        ))}
      </div>

      {visibleTasks.length > 0 ? (
        <ul className="task-list">
          {visibleTasks.map((task, index) => (
            <TaskItem key={task.id} task={task} index={index} />
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">
            {state.filter === "completed" ? "✓" : "✦"}
          </span>
          <strong>
            {state.filter === "completed"
              ? "No completed tasks yet"
              : state.filter === "active"
                ? "You’re all caught up"
                : "Your list is clear"}
          </strong>
          <span>
            {state.filter === "active"
              ? "Add a new task or enjoy the breathing room."
              : "Add a task above to start building momentum."}
          </span>
        </div>
      )}

      <div className="task-board-footer">
        <span>
          {state.tasks.length === 0
            ? "A fresh start."
            : `${completedCount} of ${state.tasks.length} tasks complete`}
        </span>
        <span className="completion-track" aria-hidden="true">
          <span
            style={{
              width: `${state.tasks.length ? (completedCount / state.tasks.length) * 100 : 0}%`,
            }}
          />
        </span>
      </div>
    </section>
  );
}
