import React from "react";
import AddTodoForm from "./AddTodoForm.jsx";
import TodoList from "./TodoList.jsx";

export default function App() {
  return (
    <main className="app-shell">
      <div className="content">
        <header className="topbar">
          <a className="brand" href="#home" aria-label="Goodlist home">
            <span className="brand-icon" aria-hidden="true">
              g
            </span>
            goodlist
          </a>
          <span className="topbar-tag">
            <span /> A LITTLE ORDER
          </span>
        </header>

        <section className="hero" id="home">
          <p className="eyebrow">A LIGHTER KIND OF PRODUCTIVITY</p>
          <h1>
            One thing,
            <br />
            <span>then the next.</span>
          </h1>
          <p className="hero-copy">
            Keep your to-dos somewhere simple, so your mind can stay on what
            you’re doing now.
          </p>
        </section>

        <section className="todo-app" aria-label="Todo list">
          <div className="form-label">WHAT WOULD YOU LIKE TO REMEMBER?</div>
          <AddTodoForm />
          <TodoList />
        </section>

        <footer className="page-footer">
          <span>Small lists. Clear minds.</span>
          <span>POWERED BY useReducer</span>
        </footer>
      </div>
    </main>
  );
}
