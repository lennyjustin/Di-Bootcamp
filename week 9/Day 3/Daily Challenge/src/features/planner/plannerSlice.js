import { createSlice } from '@reduxjs/toolkit';

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const initialState = {
  selectedDate: getLocalDateString(),
  tasksByDay: {},
};

const plannerSlice = createSlice({
  name: 'planner',
  initialState,
  reducers: {
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    addTask: (state, action) => {
      const { date, task } = action.payload;
      state.tasksByDay[date] ??= [];
      state.tasksByDay[date].push(task);
    },
    editTask: (state, action) => {
      const { date, id, changes } = action.payload;
      const task = state.tasksByDay[date]?.find((item) => item.id === id);
      if (task) {
        Object.assign(task, changes);
      }
    },
    deleteTask: (state, action) => {
      const { date, id } = action.payload;
      const tasks = state.tasksByDay[date];
      if (tasks) {
        state.tasksByDay[date] = tasks.filter((task) => task.id !== id);
        if (state.tasksByDay[date].length === 0) {
          delete state.tasksByDay[date];
        }
      }
    },
  },
});

export const { setSelectedDate, addTask, editTask, deleteTask } =
  plannerSlice.actions;
export { getLocalDateString };
export default plannerSlice.reducer;
