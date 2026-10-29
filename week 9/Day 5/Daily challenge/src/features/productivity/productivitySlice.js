import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  categories: [
    { id: 'work', name: 'Work', color: '#58745a' },
    { id: 'personal', name: 'Personal', color: '#b47a50' },
    { id: 'wellbeing', name: 'Wellbeing', color: '#6e82a4' },
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Plan the week',
      categoryId: 'work',
      completed: true,
    },
    {
      id: 'task-2',
      title: 'Finish project draft',
      categoryId: 'work',
      completed: false,
    },
    {
      id: 'task-3',
      title: 'Reply to messages',
      categoryId: 'work',
      completed: false,
    },
    {
      id: 'task-4',
      title: 'Pick up groceries',
      categoryId: 'personal',
      completed: false,
    },
    {
      id: 'task-5',
      title: 'Call a friend',
      categoryId: 'personal',
      completed: true,
    },
    {
      id: 'task-6',
      title: 'Take an afternoon walk',
      categoryId: 'wellbeing',
      completed: false,
    },
  ],
};

const productivitySlice = createSlice({
  name: 'productivity',
  initialState,
  reducers: {
    addTask: {
      reducer(state, action) {
        state.tasks.push(action.payload);
      },
      prepare({ title, categoryId }) {
        return {
          payload: {
            id: nanoid(),
            title: title.trim(),
            categoryId,
            completed: false,
          },
        };
      },
    },
    editTask(state, action) {
      const task = state.tasks.find(({ id }) => id === action.payload.id);

      if (task) {
        task.title = action.payload.title.trim();
        task.categoryId = action.payload.categoryId;
      }
    },
    deleteTask(state, action) {
      state.tasks = state.tasks.filter(({ id }) => id !== action.payload);
    },
    toggleTaskProgress(state, action) {
      const task = state.tasks.find(({ id }) => id === action.payload);

      if (task) {
        task.completed = !task.completed;
      }
    },
    addCategory: {
      reducer(state, action) {
        state.categories.push(action.payload);
      },
      prepare(name) {
        const id = nanoid();
        return {
          payload: {
            id,
            name: name.trim(),
            color: '#788269',
          },
        };
      },
    },
    editCategory(state, action) {
      const category = state.categories.find(
        ({ id }) => id === action.payload.id,
      );

      if (category) {
        category.name = action.payload.name.trim();
      }
    },
    deleteCategory(state, action) {
      state.categories = state.categories.filter(
        ({ id }) => id !== action.payload,
      );
      state.tasks = state.tasks.filter(
        ({ categoryId }) => categoryId !== action.payload,
      );
    },
  },
});

export const {
  addTask,
  editTask,
  deleteTask,
  toggleTaskProgress,
  addCategory,
  editCategory,
  deleteCategory,
} = productivitySlice.actions;

export default productivitySlice.reducer;
