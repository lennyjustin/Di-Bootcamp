import React from "react";
import { useTodos } from "./TodoContext.jsx";

export default function TodoList() {
  const { todos, dispatch } = useTodos();

  return (
    <section className="todo-panel" aria-labelledby="todo-heading">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">YOUR LIST</p>
          <h2 id="todo-heading">A few things to do</h2>
        </div>
        <span className="count-chip">{todos.length} items</span>
      </div>

      {todos.length > 0 ? (
        <ul className="todo-list">
          {todos.map((todo, index) => (
            <li className="todo-row" key={todo.id}>
              <span className="todo-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="todo-text">{todo.text}</span>
              <button
                className="remove-button"
                type="button"
                onClick={() => dispatch({ type: "REMOVE_TODO", id: todo.id })}
                aria-label={`Remove ${todo.text}`}
                title="Remove todo"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <span className="empty-mark" aria-hidden="true">
            ✓
          </span>
          <strong>All clear.</strong>
          <p>Add a todo above whenever something comes to mind.</p>
        </div>
      )}

      <footer className="panel-footer">
        {todos.length === 0 ? "Enjoy the open space." : `${todos.length} things on your list`}
      </footer>
    </section>
  );
}
