# Productivity Tracker

A React and Redux Toolkit app for organizing tasks by category and tracking
completion progress.

## Run locally

```sh
npm install
npm run dev
```

The Redux state and actions are defined in `src/features/productivity/`. The
memoized selectors derive tasks by category, completed-task counts, and
individual category details.
