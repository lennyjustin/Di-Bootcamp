import { createStore } from 'redux';
import { getLocalDateString, plannerReducer } from './reducer.js';

const STORAGE_KEY = 'daymark-planner-tasks';

function loadSavedTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};

    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new TypeError('Saved planner data must be an object.');
    }
    for (const tasks of Object.values(parsed)) {
      if (
        !Array.isArray(tasks) ||
        tasks.some(
          (task) =>
            !task ||
            typeof task.id !== 'string' ||
            typeof task.title !== 'string' ||
            typeof task.time !== 'string' ||
            typeof task.notes !== 'string',
        )
      ) {
        throw new TypeError('Saved planner data contains an invalid task.');
      }
    }
    return parsed;
  } catch (error) {
    console.error('Unable to load saved planner tasks.', error);
    return {};
  }
}

export const store = createStore(plannerReducer, {
  selectedDate: getLocalDateString(),
  tasksByDay: loadSavedTasks(),
});

store.subscribe(() => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(store.getState().tasksByDay),
    );
  } catch (error) {
    console.error('Unable to save planner tasks.', error);
  }
});
