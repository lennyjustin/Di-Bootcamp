# Mini Project — Multiplayer Strategy

A two-player turn-based base-capture game with an Express REST API and browser UI. The board is 10×10; bases are in opposite corners. Players take one orthogonal step per turn, cannot pass obstacles or occupy the opponent, and win by reaching the undefended enemy base or attacking it from an adjacent tile.

## Start

From this folder run `npm install`, then `npm start`, and open `http://localhost:3002`. Use another browser/private window to register a second commander and join the open game. Set `PORT` to use another port. Run `npm test` for auth and rules tests.

## API

Registration and login return a bearer token; send it as `Authorization: Bearer <token>` on the game endpoints.

- `POST /api/register` — `{ "username": "northstar", "password": "secure-pass-123" }`
- `POST /api/login` — authenticate and receive a token
- `GET /api/me` — current player profile
- `GET /api/games` — open matches and games you joined
- `POST /api/games` — create a waiting match; creator starts at `(0,0)`
- `POST /api/games/:id/join` — join as player two at `(9,9)` and start the match
- `GET /api/games/:id` — retrieve current board state
- `POST /api/games/:id/moves` — `{ "direction": "up|down|left|right" }`
- `POST /api/games/:id/attack` — win when orthogonally adjacent to the enemy base
- `GET /api/games/:id/winner` — check match status and winner

Accounts and games are kept in memory and reset when the server restarts. Passwords are scrypt-hashed before storage in memory.
