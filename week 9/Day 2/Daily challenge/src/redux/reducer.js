import {
  ADD_TASK,
  DELETE_TASK,
  EDIT_TASK,
  SET_SELECTED_DATE,
} from './actions.js';

export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const initialState = {
  selectedDate: getLocalDateString(),
  tasksByDay: {},
};

export function plannerReducer(state = initialState, action) {
  switch (action.type) {
    case SET_SELECTED_DATE:
      return { ...state, selectedDate: action.payload };
    case ADD_TASK: {
      const { date, task } = action.payload;
      return {
        ...state,
        tasksByDay: {
          ...state.tasksByDay,
          [date]: [...(state.tasksByDay[date] ?? []), task],
        },
      };
    }
    case EDIT_TASK: {
      const { date, id, changes } = action.payload;
      const dayTasks = state.tasksByDay[date] ?? [];
      return {
        ...state,
        tasksByDay: {
          ...state.tasksByDay,
          [date]: dayTasks.map((task) =>
            task.id === id ? { ...task, ...changes } : task,
          ),
        },
      };
    }
    case DELETE_TASK: {
      const { date, id } = action.payload;
      return {
        ...state,
        tasksByDay: {
          ...state.tasksByDay,
          [date]: (state.tasksByDay[date] ?? []).filter(
            (task) => task.id !== id,
          ),
        },
      };
    }
    default:
      return state;
  }
}
