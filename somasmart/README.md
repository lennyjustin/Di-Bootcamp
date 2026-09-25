# SomaSmart

## Project name
somasmartMany students read notes but still struggle to understand difficult topics, test their knowledge, and know what to revise.

## Solution
SomaSmart is a simple AI-powered study companion that  a topic, highlights key points, gives a practical example, and generates a quiz explainswith instant feedback.

## Features

## Technology stack
- Python 3
- Flask
- OpenAI Python SDK
- HTML, CSS, and JavaScript

## Installation
```bash
python -m venv .venv
pip install -r requirements.txt
```

## Environment variables
Create a `.env` file from `.env.example` and add your OpenAI key if needed.

## Curriculum topics
The app includes original topic suggestions in `data/curriculum_topics.json` for subjects such as History, Biology, Mathematics, Geography, English, Kiswahili, Chemistry, Physics, Agriculture, Home Science, Business Studies, Computer Studies, Art and Design, and Music.

The suggestions are informed by Kenya Institute of Curriculum Development learning-area categories. They are study prompts, not copied textbook content. Check the official KICD curriculum designs for the current grade-specific scope: https://kicd.ac.ke/cbc-materials/curriculum-designs/

Mathematics has an expanded curriculum source in `data/mathematics_curriculum.json`, covering six strands, key terms, revision tasks, and worked answers. It is available through `/api/curriculum/mathematics` and is included automatically when a Mathematics lesson is requested.

Chemistry worked examples are stored in `data/chemistry_curriculum.json`, including neutralisation calculations, diamond and graphite, energy profiles, copper electrolysis, and iron extraction. They are available through `/api/curriculum/chemistry` and appear in Chemistry lessons.

Physics and Business Studies worked examples are stored in `data/physics_curriculum.json` and `data/business_studies_curriculum.json`. They appear automatically in their lessons and are available through `/api/curriculum/physics` and `/api/curriculum/business-studies`.

## Run locally
```bash
python app.py
```
Open `http://127.0.0.1:5000`

## Demo flow
1. Open the app.
2. Select History.
3. Enter "Causes of the First World War".
4. Click Start learning.
5. Review the lesson.
6. Start the quiz and answer the questions.
7. View the final score.

## Commands
```bash
python -m venv .venv
pip install -r requirements.txt
python app.py
```
