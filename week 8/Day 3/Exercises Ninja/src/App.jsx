import React from "react";
import AddTask from "./AddTask.jsx";
import TaskList from "./TaskList.jsx";

export default function App() {
  return (
    <main className="app-shell">
      <div className="content">
        <header className="topbar">
          <a className="brand" href="#home" aria-label="Task Garden home">
            <span className="brand-mark" aria-hidden="true">
              ✳
            </span>
            task garden
          </a>
          <span className="topbar-note">
            <span /> ONE THING AT A TIME
          </span>
        </header>

        <section className="hero" id="home">
          <p className="eyebrow">A LITTLE MORE CLARITY</p>
          <h1>
            Grow your
            <br />
            <span>to-do list.</span>
          </h1>
          <p className="hero-copy">
            Plant an idea, tend to it, and enjoy the small wins along the way.
          </p>
        </section>

        <section className="workspace" aria-label="Task manager">
          <div className="form-label">
            <span>WHAT’S ON YOUR MIND?</span>
            <span className="form-hint">Press enter to add</span>
          </div>
          <AddTask />
          <TaskList />
        </section>

        <footer className="page-footer">
          <span>Made for thoughtful progress.</span>
          <span>BUILT WITH CONTEXT + REDUCER</span>
        </footer>
      </div>
    </main>
  );
}
