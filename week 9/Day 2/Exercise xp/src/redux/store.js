import { createStore } from 'redux';
import { todoReducer } from './reducer.js';

export const store = createStore(todoReducer);
