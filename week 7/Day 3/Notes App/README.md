# Fieldnotes — Notes App

A responsive notes app with Express, a JSON-file store, search, pinned notes, five color themes, and an edit/create dialog. Notes are stored in `notes.json`.

## Start

From this folder run `npm install`, then `npm start`, and open `http://localhost:3000`. Set `PORT` to choose a different port. Run `npm test` for API tests.

## REST API

- `GET /api/notes?q=term` — list notes; optional case-insensitive search
- `GET /api/notes/:id` — get a note
- `POST /api/notes` — create `{ "title": "Ideas", "content": "...", "color": "sage" }`
- `PUT /api/notes/:id` — update title/content/color/pinned
- `DELETE /api/notes/:id` — delete a note

Available colors: `sage`, `peach`, `lavender`, `sky`, and `butter`. Notes are sorted pinned-first, then newest-updated. This learning project stores data locally without authentication.
