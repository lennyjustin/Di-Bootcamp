import { createSelector } from '@reduxjs/toolkit';

export const selectAllTasks = (state) => state.productivity.tasks;
export const selectCategories = (state) => state.productivity.categories;

export const selectTasksByCategory = createSelector(
  [selectAllTasks, (_state, categoryId) => categoryId],
  (tasks, categoryId) =>
    categoryId === 'all'
      ? tasks
      : tasks.filter((task) => task.categoryId === categoryId),
);

export const selectCompletedTasks = createSelector(
  [selectAllTasks],
  (tasks) => tasks.filter((task) => task.completed).length,
);

export const selectCategoryById = createSelector(
  [selectCategories, (_state, categoryId) => categoryId],
  (categories, categoryId) =>
    categories.find((category) => category.id === categoryId),
);
