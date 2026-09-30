# Gridline — Multiplayer Strategy

A two-player turn-based base-capture game. It uses Express REST APIs, a 10×10 board, authenticated player sessions, and a responsive browser UI. Accounts and games are kept in memory and reset when the server restarts.

## Run

From this directory, run `npm install`, then `npm start`, and open `http://localhost:3000`. Use another browser or private window to create/join a match as the second player. Run `npm test` to exercise authentication and game rules.

## API

All game routes except registration/login require `Authorization: Bearer <token>`.

- `POST /api/register` — `{ "username": "northstar", "password": "secure-pass-123" }`
- `POST /api/login` — same credentials; returns a token
- `GET /api/me` — current player
- `GET /api/games` — list open matches and your games
- `POST /api/games` — create a waiting match; creator starts at (0,0)
- `POST /api/games/:id/join` — join as second player at (9,9), starting the game
- `GET /api/games/:id` — current board and match state
- `POST /api/games/:id/moves` — `{ "direction": "up|down|left|right" }`
- `POST /api/games/:id/attack` — capture the enemy base when orthogonally adjacent
- `GET /api/games/:id/winner` — check match status and winner

Only the player whose turn it is may move or attack. Moves are one orthogonal tile; out-of-bounds, occupied, and obstacle cells are rejected. Reaching an undefended enemy base or attacking it from an adjacent tile ends the match.
