import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchRecipes } from "../api/api";
import type { DataState, Recipe } from "../types/types";

export const searchRecipes = createAsyncThunk<
  Recipe[],
  string,
  { rejectValue: string }
>("recipes/search", async (query, { rejectWithValue, signal }) => {
  try {
    const response = await fetchRecipes(query, signal);
    return response.results;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("An unexpected error occurred while searching.");
  }
});

const initialState: DataState<Recipe> = {
  items: [],
  status: "idle",
  error: null,
};

const dataSlice = createSlice({
  name: "recipes",
  initialState,
  reducers: {
    clearRecipes(state) {
      state.items = [];
      state.status = "idle";
      state.error = null;
      state.currentRequestId = undefined;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(searchRecipes.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(searchRecipes.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) {
          return;
        }
        state.items = action.payload;
        state.status = "succeeded";
        state.error = null;
        state.currentRequestId = undefined;
      })
      .addCase(searchRecipes.rejected, (state, action) => {
        if (
          action.meta.aborted ||
          state.currentRequestId !== action.meta.requestId
        ) {
          return;
        }
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Recipe search failed.";
        state.currentRequestId = undefined;
      });
  },
});

export const { clearRecipes } = dataSlice.actions;
export default dataSlice.reducer;
