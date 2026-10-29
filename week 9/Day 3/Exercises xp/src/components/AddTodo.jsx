import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addTodo } from '../features/todos/todosSlice.js';

export default function AddTodo() {
  const [text, setText] = useState('');
  const dispatch = useDispatch();

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedText = text.trim();

    if (!trimmedText) return;

    dispatch(addTodo({ id: crypto.randomUUID(), text: trimmedText }));
    setText('');
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="new-todo">
        New todo
      </label>
      <input
        id="new-todo"
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="What needs to get done?"
        maxLength={160}
      />
      <button className="add-button" type="submit" disabled={!text.trim()}>
        Add todo
        <span aria-hidden="true">+</span>
      </button>
    </form>
  );
}
