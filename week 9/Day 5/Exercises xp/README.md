# Book Inventory Selector

A React and Redux Toolkit app that demonstrates memoized selectors for
filtering an in-memory book inventory by genre.

## Run locally

```sh
npm install
npm run dev
```

`selectBooks` returns the full inventory. `selectHorrorBooks`,
`selectFantasyBooks`, and `selectScienceFictionBooks` use `createSelector` to
return memoized genre-specific lists. Select a genre in the app to switch the
list being displayed.
