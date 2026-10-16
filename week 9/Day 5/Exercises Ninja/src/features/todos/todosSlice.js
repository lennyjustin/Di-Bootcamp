import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  items: [
    { id: 'todo-1', text: 'Review the week ahead', completed: true },
    { id: 'todo-2', text: 'Finish the project outline', completed: false },
    { id: 'todo-3', text: 'Take a proper lunch break', completed: false },
    { id: 'todo-4', text: 'Tidy up the workspace', completed: true },
  ],
  visibilityFilter: 'All',
};

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo: {
      reducer(state, action) {
        state.items.push(action.payload);
      },
      prepare(text) {
        return {
          payload: {
            id: nanoid(),
            text: text.trim(),
            completed: false,
          },
        };
      },
    },
    toggleTodo(state, action) {
      const todo = state.items.find(({ id }) => id === action.payload);

      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    removeTodo(state, action) {
      state.items = state.items.filter(({ id }) => id !== action.payload);
    },
    setVisibilityFilter(state, action) {
      state.visibilityFilter = action.payload;
    },
  },
});

export const { addTodo, toggleTodo, removeTodo, setVisibilityFilter } =
  todosSlice.actions;

export default todosSlice.reducer;
