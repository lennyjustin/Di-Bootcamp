import { useDispatch } from 'react-redux';
import { removeTodo, toggleTodo } from '../features/todos/todosSlice.js';

export default function TodoItem({ todo }) {
  const dispatch = useDispatch();

  return (
    <li className={`todo-item${todo.completed ? ' is-completed' : ''}`}>
      <label className="todo-label">
        <input
          className="todo-checkbox"
          type="checkbox"
          checked={todo.completed}
          onChange={() => dispatch(toggleTodo(todo.id))}
        />
        <span className="todo-text">{todo.text}</span>
      </label>
      <button
        className="remove-button"
        type="button"
        aria-label={`Remove ${todo.text}`}
        onClick={() => dispatch(removeTodo(todo.id))}
      >
        Remove
      </button>
    </li>
  );
}
