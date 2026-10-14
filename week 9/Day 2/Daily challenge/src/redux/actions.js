export const SET_SELECTED_DATE = 'planner/setSelectedDate';
export const ADD_TASK = 'planner/addTask';
export const EDIT_TASK = 'planner/editTask';
export const DELETE_TASK = 'planner/deleteTask';

export function setSelectedDate(date) {
  return { type: SET_SELECTED_DATE, payload: date };
}

export function addTask(date, details) {
  return {
    type: ADD_TASK,
    payload: {
      date,
      task: { ...details, id: crypto.randomUUID() },
    },
  };
}

export function editTask(date, id, changes) {
  return {
    type: EDIT_TASK,
    payload: { date, id, changes },
  };
}

export function deleteTask(date, id) {
  return {
    type: DELETE_TASK,
    payload: { date, id },
  };
}
