export const ADD_TODO = 'todos/add';
export const TOGGLE_TODO = 'todos/toggle';
export const REMOVE_TODO = 'todos/remove';

export function addTodo(text) {
  return {
    type: ADD_TODO,
    payload: {
      id: crypto.randomUUID(),
      text,
    },
  };
}

export function toggleTodo(id) {
  return {
    type: TOGGLE_TODO,
    payload: id,
  };
}

export function removeTodo(id) {
  return {
    type: REMOVE_TODO,
    payload: id,
  };
}
