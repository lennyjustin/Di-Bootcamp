import React, { createContext, useContext, useMemo, useReducer } from "react";

const TodoContext = createContext(null);
const starterTodos = [
  { id: "todo-1", text: "Make a plan for the day" },
  { id: "todo-2", text: "Focus on one thing at a time" },
];

function todoReducer(todos, action) {
  switch (action.type) {
    case "ADD_TODO":
      return [...todos, { id: action.id, text: action.text }];
    case "REMOVE_TODO":
      return todos.filter((todo) => todo.id !== action.id);
    default:
      return todos;
  }
}

export function TodoProvider({ children }) {
  const [todos, dispatch] = useReducer(todoReducer, starterTodos);
  const value = useMemo(() => ({ todos, dispatch }), [todos]);

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodos() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error("useTodos must be used inside a TodoProvider.");
  }
  return context;
}
