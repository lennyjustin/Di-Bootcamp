import AddTodo from './components/AddTodo.jsx';
import TodoList from './components/TodoList.jsx';

export default function App() {
  return (
    <main className="page-shell">
      <header className="intro">
        <span className="eyebrow">A LITTLE MORE DONE, EVERY DAY</span>
        <h1>Make today count.</h1>
        <p>One thing at a time. You&apos;ve got this.</p>
      </header>
      <section className="todo-card" aria-label="Todo list">
        <AddTodo />
        <TodoList />
      </section>
      <footer className="page-footer">Small steps add up.</footer>
    </main>
  );
}
