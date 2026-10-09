# SomaSmart Hackathon

SomaSmart is a study companion that combines the Hackathon app with the local learning platform in `week 5/Day 5/somasmart`. The Hackathon Flask server serves that platform's UI, topic catalog, lesson data, and subject curriculum JSON from one same-origin application.

## Features

- Curriculum-informed topic suggestions across the locally defined subjects.
- A public learn page that explains the lesson, quiz, and progress flow before sign-in or sign-up.
- Lessons and five-question quizzes, with local demo content when an AI key is unavailable.
- Subject-specific local curriculum endpoints for Mathematics, Chemistry, Physics, and Business Studies.
- Quiz feedback, results, and revision suggestions.
- SQLite persistence for generated lessons, quiz attempts, and saved curriculum lesson plans.
- Rate limiting, request-size limits, and basic security headers.

## Install and run

```bash
python -m venv .venv
```

Activate the virtual environment, then run:

```bash
python -m pip install -r requirements.txt
python app.py
```

Open <http://127.0.0.1:5000> for SomaSmart, or <http://127.0.0.1:5000/curriculum-builder/> for the curriculum notes and lesson builder. Both are served by the same Flask process and link to each other. The server defaults to the adjacent `../somasmart` platform folder. To use another local copy, set `SOMASMART_PLATFORM_DIR` to its path before starting the server.

## Environment

Copy `.env.example` to `.env` and set `OPENAI_API_KEY` to enable AI-generated lessons. Leave it unset to use the local curriculum/demo content; no external API key is required for the learning flow.

The app creates `instance/hackathon.sqlite3` automatically. Set `DATABASE_PATH` to use a different SQLite file; the parent directory is created when the app starts. The database stores generated SomaSmart lessons and quiz results, as well as saved lesson plans from the Curriculum Builder. On deployments with ephemeral filesystems, point `DATABASE_PATH` at a persistent disk or records will not survive a redeploy. The current sign-in UI is a client-side demo rather than server-authenticated accounts, so records are shared in the configured database and should not be treated as private student data.

## Public deployment

The repository-root `render.yaml` configures this project as a Render web service. In Render, create a Blueprint from the repository and select the `hackathon-1-submit` branch. Render will install the requirements and start the Flask app with Gunicorn. The app works without secrets using local demo lessons; add `OPENAI_API_KEY` in the Render dashboard only if AI-generated lessons are desired.

## API endpoints

- `GET /api/health` — health check.
- `GET /api/curriculum` — legacy curriculum guide retained for compatibility.
- `GET /api/curriculum-topics` — local subject and topic catalog.
- `GET /api/curriculum/mathematics`
- `GET /api/curriculum/chemistry`
- `GET /api/curriculum/physics`
- `GET /api/curriculum/business-studies`
- `POST /api/learn` — returns a validated AI or local lesson and quiz.
- `GET /api/history` — lists recent generated lessons and quiz attempts.
- `GET /api/lessons/<id>` — retrieves a saved lesson for review.
- `POST /api/quiz-attempts` — records answers and a score for a saved lesson.
- `GET|POST /api/curriculum-builder/plans` — lists or saves curriculum lesson plans.
- `DELETE /api/curriculum-builder/plans/<id>` — deletes a saved curriculum lesson plan.
- `GET /curriculum-builder/` — curriculum notes, revision tasks, and lesson builder.

## Tests

```bash
python -m unittest discover -s tests -v
```

The local curriculum resources are original study prompts and notes. Confirm grade-specific scope with the official Kenya Institute of Curriculum Development designs.
