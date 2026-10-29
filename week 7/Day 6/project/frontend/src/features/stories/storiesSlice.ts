import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import type { Story } from '../../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8010/api';

export interface StoriesState {
  items: Story[];
  loading: boolean;
  error: string | null;
}

const initialState: StoriesState = {
  items: [],
  loading: false,
  error: null,
};

const handleResponse = async (response: Response) => {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.message || 'Request failed.';
    throw new Error(message);
  }

  return payload;
};

const authHeaders = (token: string | null): Record<string, string> => {
  if (!token) {
    return {};
  }

  return {
    Authorization: 'Bearer ' + token,
  };
};

export const fetchStories = createAsyncThunk<Story[], void, { state: RootState; rejectValue: string }>(
  'stories/fetchStories',
  async (_, thunkApi) => {
    const token = thunkApi.getState().auth.token;
    try {
      const response = await fetch(`${API_BASE}/stories`, {
        headers: authHeaders(token),
        credentials: 'include',
      });
      return await handleResponse(response);
    } catch (error) {
      return thunkApi.rejectWithValue(error instanceof Error ? error.message : 'Could not load stories.');
    }
  },
);

export const createStory = createAsyncThunk<Story, { title: string; content: string }, { state: RootState; rejectValue: string }>(
  'stories/createStory',
  async (storyData, thunkApi) => {
    const token = thunkApi.getState().auth.token;
    try {
      const response = await fetch(`${API_BASE}/stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? authHeaders(token) : {}),
        },
        credentials: 'include',
        body: JSON.stringify(storyData),
      });
      return await handleResponse(response);
    } catch (error) {
      return thunkApi.rejectWithValue(error instanceof Error ? error.message : 'Could not create story.');
    }
  },
);

export const updateStory = createAsyncThunk<Story, { id: number; title?: string; content?: string }, { state: RootState; rejectValue: string }>(
  'stories/updateStory',
  async ({ id, title, content }, thunkApi) => {
    const token = thunkApi.getState().auth.token;
    try {
      const response = await fetch(`${API_BASE}/stories/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? authHeaders(token) : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ title, content }),
      });
      return await handleResponse(response);
    } catch (error) {
      return thunkApi.rejectWithValue(error instanceof Error ? error.message : 'Could not update story.');
    }
  },
);

export const deleteStory = createAsyncThunk<number, number, { state: RootState; rejectValue: string }>(
  'stories/deleteStory',
  async (id, thunkApi) => {
    const token = thunkApi.getState().auth.token;
    try {
      const response = await fetch(`${API_BASE}/stories/${id}`, {
        method: 'DELETE',
        headers: token ? authHeaders(token) : {},
        credentials: 'include',
      });
      await handleResponse(response);
      return id;
    } catch (error) {
      return thunkApi.rejectWithValue(error instanceof Error ? error.message : 'Could not delete story.');
    }
  },
);

const storiesSlice = createSlice({
  name: 'stories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchStories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to fetch stories.';
      })
      .addCase(createStory.pending, (state) => {
        state.loading = true;
      })
      .addCase(createStory.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createStory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Could not create story.';
      })
      .addCase(updateStory.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateStory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map((story) =>
          story.id === action.payload.id ? action.payload : story,
        );
      })
      .addCase(updateStory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Could not update story.';
      })
      .addCase(deleteStory.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteStory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((story) => story.id !== action.payload);
      })
      .addCase(deleteStory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Could not delete story.';
      });
  },
});

export default storiesSlice.reducer;
