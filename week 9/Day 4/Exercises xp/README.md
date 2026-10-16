# Redux Thunk User Profile

A small React and Redux Toolkit app that fetches user 1 from JSONPlaceholder and
shows the profile, loading state, and request errors.

## Run locally

```sh
npm install
npm run dev
```

The Redux store is created with `configureStore`, which includes thunk
middleware by default. `fetchUser` is a `createAsyncThunk` action, and the
component dispatches it on load or when the user selects **Refresh user**.
