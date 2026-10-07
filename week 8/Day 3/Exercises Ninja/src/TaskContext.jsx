import React, { createContext, useContext, useMemo, useReducer } from "react";

const TaskContext = createContext(null);

function taskReducer(tasks, action) {
  switch (action.type) {
    case "ADD_TASK":
      return [...tasks, { id: action.id, text: action.text, completed: false }];
    case "TOGGLE_TASK":
      return tasks.map((task) =>
        task.id === action.id ? { ...task, completed: !task.completed } : task,
      );
    case "REMOVE_TASK":
      return tasks.filter((task) => task.id !== action.id);
    default:
      return tasks;
  }
}

export function TaskProvider({ children }) {
  const [tasks, dispatch] = useReducer(taskReducer, [
    { id: "welcome-1", text: "Pick one important thing to focus on", completed: false },
    { id: "welcome-2", text: "Make a little progress", completed: true },
  ]);
  const value = useMemo(() => ({ tasks, dispatch }), [tasks]);

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used inside a TaskProvider.");
  }
  return context;
}
