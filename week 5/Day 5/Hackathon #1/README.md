# SomaSmart

## Project name
SomaSmart

## Problem statement
Many students read notes but still struggle to understand difficult topics, test their knowledge, and know what to revise.

## Solution
SomaSmart is a simple AI-powered study companion that explains a topic, highlights key points, gives a practical example, and generates a quiz with instant feedback.

## Features
- Home page with subject and topic selection
- Lesson explanation section
- Five-question quiz
- Results screen with revision advice
- Demo fallback without an API key

## Tech stack
- Python 3
- Flask
- OpenAI SDK
- HTML, CSS, JavaScript

## Install
```bash
python -m venv .venv
pip install -r requirements.txt
```

## Run
```bash
python app.py
```
Open http://127.0.0.1:5000 on this computer.

To open SomaSmart from another device on the same Wi-Fi network, use:

`http://192.168.8.12:5000`

The Flask server listens on all network interfaces. Windows Firewall may ask for permission the first time it runs; allow Python on private networks.

## Demo flow
1. Select History
2. Enter "Causes of the First World War"
3. Click Start learning
4. Read the explanation
5. Start the quiz
6. Answer all questions
7. View the final score
