# Trivia Quiz Game

An Express app that uses `express.Router()` for a hard-coded, three-question trivia quiz. The current question and score are stored in the player's session.

## Run

From this folder:

```text
npm install
npm start
```

The app runs at `http://localhost:3003/quiz` by default. You can also start it with `node "Daliy Challenge.js"`; set `PORT` to use another port.

## Routes

- `GET /quiz` — start or restart the quiz and show question one
- `POST /quiz` — validate the submitted choice, show feedback, and advance
- `GET /quiz/score` — show the final score after all questions are answered

Quiz scores are held in the Express session. The default session store is in-memory and intended for local development; sessions are cleared when the server restarts. For deployment, set a strong `SESSION_SECRET` and configure a persistent session store.
