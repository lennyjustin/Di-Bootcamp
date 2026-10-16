# Age Tracker

A small React app that updates age asynchronously through Redux Toolkit thunks.
Age changes have a short simulated delay, during which the spinner is displayed
and both controls are disabled. Age cannot be decremented below zero.

## Run locally

```sh
npm install
npm run dev
```

`configureStore` includes thunk middleware by default. The `ageUpAsync` and
`ageDownAsync` actions resolve after the simulated delay and update the age in
their fulfilled reducers.
