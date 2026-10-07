import React from "react";
import AddTaskForm from "./AddTaskForm.jsx";
import TaskList from "./TaskList.jsx";
import { useTasks } from "./TaskContext.jsx";

export default function App() {
  const { state } = useTasks();
  const completedCount = state.tasks.filter((task) => task.completed).length;
  const completion =
    state.tasks.length === 0
      ? 0
      : Math.round((completedCount / state.tasks.length) * 100);

  return (
    <main className="app-shell">
      <div className="page-container">
        <header className="topbar">
          <a className="brand" href="#top" aria-label="Daymark home">
            <span className="brand-symbol" aria-hidden="true">
              d<span />
            </span>
            <span>daymark</span>
          </a>
          <span className="date-chip">
            <span className="date-dot" />
            A CLEAR DAY, ONE TASK AT A TIME
          </span>
        </header>

        <section className="welcome" id="top">
          <p className="eyebrow">YOUR DAILY RESET</p>
          <h1>
            Make room for
            <br />
            <span>what matters.</span>
          </h1>
          <p className="welcome-copy">
            Capture the next small step. Progress feels good when it’s simple.
          </p>
        </section>

        <section className="progress-card" aria-label="Task completion progress">
          <div className="progress-copy">
            <span className="progress-label">TODAY’S MOMENTUM</span>
            <strong>{completion}%</strong>
            <span>
              {completedCount} of {state.tasks.length} tasks complete
            </span>
          </div>
          <div className="progress-art" aria-hidden="true">
            <span className="progress-sun" />
            <span className="progress-hill progress-hill--back" />
            <span className="progress-hill progress-hill--front" />
            <span className="progress-sparkle">✦</span>
          </div>
        </section>

        <AddTaskForm />
        <TaskList />

        <footer className="page-footer">
          <span>Small steps count. Keep going.</span>
          <span>MADE WITH FOCUS <span className="footer-heart">♥</span></span>
        </footer>
      </div>
    </main>
  );
}
