import { configureStore } from '@reduxjs/toolkit';
import productivityReducer from '../features/productivity/productivitySlice.js';

export const store = configureStore({
  reducer: {
    productivity: productivityReducer,
  },
});
