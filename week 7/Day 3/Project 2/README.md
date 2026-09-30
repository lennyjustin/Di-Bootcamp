# Mini Project — Real-time Chat App

Express and Socket.IO chat with selectable usernames, `general`/`random`/`help` rooms, room join/leave, live member lists, real-time messages, join notices, browser notifications, emoji insertion, and in-memory recent-message history.

## Run

From this folder run `npm install`, then `npm start`. Open `http://localhost:3001` (or set `PORT`). Use another browser tab to test multiple users. Run `npm test` for Socket.IO integration tests.

Messages and users live in server memory; chat history resets when the server stops. The client uses text-only rendering for messages to avoid interpreting user input as HTML.
