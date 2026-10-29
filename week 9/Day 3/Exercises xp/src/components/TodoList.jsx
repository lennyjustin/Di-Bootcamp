import { useSelector } from 'react-redux';
import TodoItem from './TodoItem.jsx';

export default function TodoList() {
  const todos = useSelector((state) => state.todos.items);

  return (
    <section className="list-section" aria-labelledby="list-title">
      <div className="list-heading">
        <h2 id="list-title">Your todos</h2>
        <span className="todo-count" aria-label={`${todos.length} todos`}>
          {todos.length}
        </span>
      </div>
      {todos.length > 0 ? (
        <ul className="todo-list">
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </ul>
      ) : (
        <p className="empty-state">
          Your list is clear. Add a todo to get started.
        </p>
      )}
    </section>
  );
}
