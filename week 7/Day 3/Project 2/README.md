# Gather — Real-time Chat

A responsive multi-room chat app built with Express and Socket.IO. It supports usernames, `general`/`random`/`help` rooms, live presence, room switching/leaving, message history for the current server session, in-app new-message notifications, and optional browser notifications.

## Run it

From this folder:

1. `npm install`
2. `npm start`
3. Open `http://localhost:3000` in one or more browser tabs.

Set `PORT` to use a different port. Chat messages are kept in memory and reset when the server restarts; no account or database is required.

Run the Socket.IO integration tests with `npm test`.
