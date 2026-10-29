import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addTodo,
  removeTodo,
  setVisibilityFilter,
  toggleTodo,
} from '../features/todos/todosSlice.js';
import {
  selectActiveTodosCount,
  selectFilteredTodosCount,
  selectTodos,
  selectVisibilityFilter,
} from '../features/todos/todosSelectors.js';

const filters = ['All', 'Active', 'Completed'];

export default function TodoList() {
  const dispatch = useDispatch();
  const todos = useSelector(selectTodos);
  const visibilityFilter = useSelector(selectVisibilityFilter);
  const filteredCount = useSelector(selectFilteredTodosCount);
  const activeCount = useSelector(selectActiveTodosCount);
  const [newTodoText, setNewTodoText] = useState('');

  const handleToggle = useCallback(
    (todoId) => dispatch(toggleTodo(todoId)),
    [dispatch],
  );
  const handleDelete = useCallback(
    (todoId) => dispatch(removeTodo(todoId)),
    [dispatch],
  );

  function handleAddTodo(event) {
    event.preventDefault();
    const text = newTodoText.trim();

    if (!text) return;

    dispatch(addTodo(text));
    setNewTodoText('');
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <span className="eyebrow">MAKE SPACE FOR WHAT MATTERS</span>
        <h1>Small steps, steady days.</h1>
        <p>A little list to help you focus on one thing at a time.</p>
      </header>

      <section className="todo-card" aria-labelledby="todo-heading">
        <div className="card-heading">
          <div>
            <span className="eyebrow">YOUR CHECKLIST</span>
            <h2 id="todo-heading">Today’s tasks</h2>
          </div>
          <span className="remaining-count" aria-live="polite">
            {activeCount} left
          </span>
        </div>

        <form className="add-todo-form" onSubmit={handleAddTodo}>
          <label className="visually-hidden" htmlFor="new-todo">
            Add a todo
          </label>
          <input
            id="new-todo"
            onChange={(event) => setNewTodoText(event.target.value)}
            placeholder="What would you like to get done?"
            value={newTodoText}
          />
          <button className="add-button" type="submit">
            Add task
          </button>
        </form>

        <div className="filter-row" aria-label="Filter todos" role="group">
          {filters.map((filter) => (
            <button
              aria-pressed={visibilityFilter === filter}
              className="filter-button"
              key={filter}
              onClick={() => dispatch(setVisibilityFilter(filter))}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>

        {todos.length > 0 ? (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li className="todo-row" key={todo.id}>
                <button
                  aria-label={
                    todo.completed
                      ? `Mark ${todo.text} as active`
                      : `Complete ${todo.text}`
                  }
                  aria-pressed={todo.completed}
                  className={`todo-checkbox${todo.completed ? ' is-complete' : ''}`}
                  onClick={() => handleToggle(todo.id)}
                  type="button"
                >
                  {todo.completed ? '✓' : ''}
                </button>
                <span className={todo.completed ? 'todo-text completed' : 'todo-text'}>
                  {todo.text}
                </span>
                <button
                  aria-label={`Delete ${todo.text}`}
                  className="delete-button"
                  onClick={() => handleDelete(todo.id)}
                  type="button"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state" role="status">
            {visibilityFilter === 'Completed'
              ? 'No completed tasks yet. Keep going!'
              : visibilityFilter === 'Active'
                ? 'You’re all caught up. Enjoy the breathing room.'
                : 'Your list is clear. Add a task whenever you’re ready.'}
          </p>
        )}

        <footer className="list-footer" aria-live="polite">
          Showing {filteredCount} {filteredCount === 1 ? 'task' : 'tasks'}
        </footer>
      </section>

      <footer className="page-footer">
        Progress is progress, no matter the pace.
      </footer>
    </main>
  );
}
