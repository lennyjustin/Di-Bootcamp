import React from "react";
import { useTasks } from "./TaskContext.jsx";
import TaskItem from "./TaskItem.jsx";

export default function TaskList() {
  const { tasks } = useTasks();
  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <section className="task-panel" aria-labelledby="task-list-title">
      <div className="list-heading">
        <div>
          <p className="eyebrow">YOUR TASKS</p>
          <h2 id="task-list-title">A good place to begin.</h2>
        </div>
        <span className="task-count">{tasks.length} total</span>
      </div>

      {tasks.length > 0 ? (
        <ul className="task-list">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <span aria-hidden="true">✦</span>
          <strong>Your list is clear.</strong>
          <p>Add a task above to get started.</p>
        </div>
      )}

      <footer className="list-footer">
        <span>
          {completedCount} of {tasks.length} complete
        </span>
        <span className="progress-track" aria-hidden="true">
          <span
            style={{
              width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%`,
            }}
          />
        </span>
      </footer>
    </section>
  );
}
