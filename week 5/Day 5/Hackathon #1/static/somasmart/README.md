# SomaSmart

## Project name
SomaSmart

## Problem statement
Many students read notes but still struggle to understand difficult topics, test their knowledge, and know what to revise. Resources are often too dense, and students do not get quick feedback.

## Solution
SomaSmart is a simple AI-powered study companion for secondary school students. It explains topics in clear language, highlights key points, gives a practical example, and generates a five-question quiz with instant feedback and revision guidance.

## Features
- Home page with subject and topic selection
- AI-powered explanation generation
- Five-question multiple-choice quiz
- Quiz feedback and score summary
- Demo fallback content for a ready-made lesson and quiz
- Mobile-friendly design

## Technology stack
- Python 3
- Flask
- OpenAI Python SDK
- HTML, CSS, and JavaScript

## Installation
1. Open a terminal in the project folder.
2. Create a virtual environment:
   ```bash
   python -m venv .venv
   ```
3. Activate it:
   - Windows PowerShell:
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
   - macOS/Linux:
     ```bash
     source .venv/bin/activate
     ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Environment variables
Create a file named `.env` using the example file:
```bash
copy .env.example .env
```
Then update the values:
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

## How to run locally
```bash
python app.py
```
Then open:
```text
http://127.0.0.1:5000
```

## How to test
- Visit the home page and select a subject and topic.
- Start learning to view lesson content.
- Start the quiz and answer all five questions.
- Review the final score and revision suggestion.
- Confirm the app still works with the demo fallback when the API is unavailable.

## Team member responsibilities
- Frontend Developer: homepage, lesson screen, quiz interactions, results screen
- Backend and AI Developer: Flask app, OpenAI integration, validation, fallback content
- UI/UX, Testing, and Presentation: polished design, demo testing, presentation rehearsal

## Future improvements
- Add more subjects and topics
- Improve AI prompt tuning for local curriculum alignment
- Add saved revision summaries
- Add analytics on student progress

## AI usage and limitations
This MVP uses the OpenAI Responses API to generate a study lesson and quiz. The app validates the JSON response before rendering it. If the API key is missing or the service fails, the app falls back to a built-in demo lesson for the topic: "Causes of the First World War". The app never exposes API keys to the browser.

## Demo flow
1. Open SomaSmart.
2. Select History.
3. Enter "Causes of the First World War".
4. Click Start learning.
5. Review the AI explanation and key points.
6. Start the quiz.
7. Answer the questions.
8. View the final score and revision suggestion.

## Commands
```bash
python -m venv .venv
pip install -r requirements.txt
python app.py
```
