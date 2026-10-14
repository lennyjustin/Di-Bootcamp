import { useState } from 'react';
import { connect } from 'react-redux';
import { addTodo, removeTodo, toggleTodo } from './redux/actions.js';

const filters = ['All', 'Active', 'Completed'];

function App({ todos, addTodo, toggleTodo, removeTodo }) {
  const [draft, setDraft] = useState('');
  const [filter, setFilter] = useState('All');

  const completedCount = todos.filter((todo) => todo.completed).length;
  const remainingCount = todos.length - completedCount;
  const visibleTodos = todos.filter((todo) => {
    if (filter === 'Active') return !todo.completed;
    if (filter === 'Completed') return todo.completed;
    return true;
  });

  function handleSubmit(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    addTodo(text);
    setDraft('');
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Daylist home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="m6.5 12.5 3.6 3.6 7.7-8.2"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span>daylist</span>
        </a>
        <span className="topbar-note">A little more done, every day.</span>
      </header>

      <section className="todo-card" aria-labelledby="page-title">
        <div className="intro">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            YOUR PERSONAL SPACE
          </span>
          <h1 id="page-title">Make today count.</h1>
          <p className="intro-copy">
            One thing at a time. You&apos;ve got this.
          </p>
        </div>

        <form className="add-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="new-todo">
            Add a task
          </label>
          <span className="input-plus" aria-hidden="true">
            +
          </span>
          <input
            id="new-todo"
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="What needs to get done?"
            maxLength={160}
          />
          <button className="add-button" type="submit" disabled={!draft.trim()}>
            Add task
            <span aria-hidden="true">↗</span>
          </button>
        </form>

        <div className="list-heading">
          <div className="list-title-wrap">
            <h2>Your tasks</h2>
            <span className="task-count">{remainingCount}</span>
          </div>
          <div className="filters" role="group" aria-label="Filter tasks">
            {filters.map((name) => (
              <button
                className={`filter-button${filter === name ? ' is-selected' : ''}`}
                type="button"
                key={name}
                aria-pressed={filter === name}
                onClick={() => setFilter(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {visibleTodos.length > 0 ? (
          <ul className="todo-list">
            {visibleTodos.map((todo) => (
              <li className="todo-item" key={todo.id}>
                <label className="todo-label">
                  <input
                    className="todo-checkbox"
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                  />
                  <span className="custom-check" aria-hidden="true">
                    <svg viewBox="0 0 16 16" fill="none">
                      <path
                        d="m3.5 8.2 3 3 6-6.4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="todo-text">{todo.text}</span>
                </label>
                <button
                  className="remove-button"
                  type="button"
                  aria-label={`Remove ${todo.text}`}
                  onClick={() => removeTodo(todo.id)}
                >
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path
                      d="M4.5 6h11m-9.7 0 .6 9.2c.1.8.7 1.3 1.5 1.3h4.2c.8 0 1.4-.5 1.5-1.3l.6-9.2M8 6V4.5h4V6m-3.5 3v4m3-4v4"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">
              {filter === 'Completed' ? '✦' : '✓'}
            </span>
            <p>
              {todos.length === 0
                ? 'A fresh start. Add your first task above.'
                : filter === 'Completed'
                  ? 'Nothing checked off just yet.'
                  : 'All caught up. Enjoy the breathing room.'}
            </p>
          </div>
        )}

        <footer className="list-footer">
          <span>
            {remainingCount === 0
              ? 'Everything is done'
              : `${remainingCount} ${remainingCount === 1 ? 'task' : 'tasks'} left`}
          </span>
          <span className="footer-separator" aria-hidden="true">
            ·
          </span>
          <span>{completedCount} completed</span>
        </footer>
      </section>

      <p className="page-footer">Small steps add up.</p>
    </main>
  );
}

const mapStateToProps = (state) => ({
  todos: state.todos,
});

const mapDispatchToProps = {
  addTodo,
  toggleTodo,
  removeTodo,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
