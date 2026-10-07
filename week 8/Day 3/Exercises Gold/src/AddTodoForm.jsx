import React, { useState } from "react";
import { useTodos } from "./TodoContext.jsx";

export default function AddTodoForm() {
  const [text, setText] = useState("");
  const { dispatch } = useTodos();

  function handleSubmit(event) {
    event.preventDefault();
    const todoText = text.trim();
    if (!todoText) return;

    dispatch({
      type: "ADD_TODO",
      id: crypto.randomUUID(),
      text: todoText,
    });
    setText("");
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <label className="visually-hidden" htmlFor="new-todo">
        Add a todo
      </label>
      <input
        id="new-todo"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Add something to your list..."
        maxLength={160}
      />
      <button type="submit" disabled={!text.trim()}>
        Add to list <span aria-hidden="true">+</span>
      </button>
    </form>
  );
}
