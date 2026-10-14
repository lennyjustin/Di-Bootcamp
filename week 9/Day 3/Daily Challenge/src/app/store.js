import { configureStore } from '@reduxjs/toolkit';
import plannerReducer from '../features/planner/plannerSlice.js';

export const store = configureStore({
  reducer: plannerReducer,
});
