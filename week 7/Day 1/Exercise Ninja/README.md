# Emoji Greeting App

Express app that uses `express.Router()` for a name-and-emoji greeting form.

## Start

Run from this folder:

```text
npm install
npm start
```

The app is available at `http://localhost:3002` by default. You can also launch it with `node "Exercise Ninja.js"`. Set `PORT` to choose another port.

## Routes

- `GET /` — greeting form with emoji choices 😀 🎉 🌟 🎈 👋
- `POST /greet` — form-encoded submission; validates the name and emoji and renders a personalized greeting.
