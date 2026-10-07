import React, { createContext, useContext, useEffect, useReducer } from "react";

const STORAGE_KEY = "daymark-tasks";
const TaskContext = createContext(null);
const starterTasks = [
  { id: "starter-1", text: "Review the week’s React hooks", completed: true },
  { id: "starter-2", text: "Build an app with useReducer", completed: false },
  { id: "starter-3", text: "Take a well-earned coffee break", completed: false },
];

function loadInitialState() {
  try {
    const savedTasks = window.localStorage.getItem(STORAGE_KEY);
    if (savedTasks === null) {
      return { tasks: starterTasks, filter: "all" };
    }

    const parsedTasks = JSON.parse(savedTasks);
    if (
      Array.isArray(parsedTasks) &&
      parsedTasks.every(
        (task) =>
          typeof task.id === "string" &&
          typeof task.text === "string" &&
          typeof task.completed === "boolean",
      )
    ) {
      return { tasks: parsedTasks, filter: "all" };
    }
  } catch (error) {
    console.error("Could not load saved tasks.", error);
  }

  return { tasks: starterTasks, filter: "all" };
}

function taskReducer(state, action) {
  switch (action.type) {
    case "ADD_TASK":
      return {
        ...state,
        tasks: [...state.tasks, { id: action.id, text: action.text, completed: false }],
      };
    case "TOGGLE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, completed: !task.completed } : task,
        ),
      };
    case "EDIT_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, text: action.text } : task,
        ),
      };
    case "REMOVE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.id),
      };
    case "FILTER_TASKS":
      return { ...state, filter: action.filter };
    default:
      return state;
  }
}

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, undefined, loadInitialState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
    } catch (error) {
      console.error("Could not save tasks.", error);
    }
  }, [state.tasks]);

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used inside a TaskProvider.");
  }
  return context;
}
