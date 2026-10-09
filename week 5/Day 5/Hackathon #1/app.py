import json
import os
import sqlite3
import time
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from flask import Flask, jsonify, redirect, render_template, request, send_from_directory, url_for
from openai import OpenAI

from database import (
    delete_curriculum_plan,
    get_lesson,
    init_database,
    list_curriculum_plans,
    list_lessons,
    list_quiz_attempts,
    save_curriculum_plan,
    save_lesson,
    save_quiz_attempt,
)

load_dotenv()
APP_DIR = Path(__file__).resolve().parent
PLATFORM_DIR = Path(
    os.getenv("SOMASMART_PLATFORM_DIR", str(APP_DIR.parent / "somasmart"))
).resolve()
if not PLATFORM_DIR.is_dir():
    PLATFORM_DIR = APP_DIR

PLATFORM_DATA_DIR = PLATFORM_DIR / "data"
TEMPLATE_DIR = PLATFORM_DIR / "templates"
STATIC_DIR = PLATFORM_DIR / "static"
CURRICULUM_BUILDER_DIR = APP_DIR / "curiculam buider"
app = Flask(
    __name__,
    template_folder=str(TEMPLATE_DIR if TEMPLATE_DIR.is_dir() else APP_DIR / "templates"),
    static_folder=str(STATIC_DIR if STATIC_DIR.is_dir() else APP_DIR / "static"),
)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024
database_path = Path(
    os.getenv("DATABASE_PATH", "").strip()
    or str(APP_DIR / "instance" / "hackathon.sqlite3")
).expanduser()
if not database_path.is_absolute():
    database_path = APP_DIR / database_path
app.config["DATABASE_PATH"] = str(database_path)
init_database(app.config["DATABASE_PATH"])

RATE_LIMIT_WINDOW_SECONDS = 60
RATE_LIMIT_MAX_REQUESTS = 20
_learn_requests: dict[str, list[float]] = {}


@app.after_request
def add_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    script_policy = "script-src 'self';"
    style_policy = "style-src 'self' https://fonts.googleapis.com;"
    if request.path.startswith("/curriculum-builder/"):
        script_policy = "script-src 'self' 'unsafe-inline';"
        style_policy = (
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com "
            "https://api.fontshare.com;"
        )
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; "
        f"{script_policy} "
        f"{style_policy} "
        "font-src 'self' https://fonts.gstatic.com https://cdn.fontshare.com; "
        "connect-src 'self'; img-src 'self' data:;"
    )
    return response


@app.errorhandler(413)
def request_too_large(_error):
    return jsonify({"error": "Request is too large."}), 413


@app.errorhandler(sqlite3.Error)
def database_error(_error):
    app.logger.exception("Database operation failed")
    return jsonify({"error": "Unable to access the learning database."}), 500


def is_rate_limited(client_key: str) -> bool:
    now = time.monotonic()
    recent_requests = [
        timestamp
        for timestamp in _learn_requests.get(client_key, [])
        if now - timestamp < RATE_LIMIT_WINDOW_SECONDS
    ]
    if len(recent_requests) >= RATE_LIMIT_MAX_REQUESTS:
        _learn_requests[client_key] = recent_requests
        return True

    recent_requests.append(now)
    _learn_requests[client_key] = recent_requests
    return False


def load_platform_json(filename: str) -> dict[str, Any]:
    platform_path = PLATFORM_DATA_DIR / filename
    app_path = APP_DIR / "data" / filename
    data_path = platform_path if platform_path.is_file() else app_path
    with data_path.open("r", encoding="utf-8") as file:
        return json.load(file)

def load_demo_content() -> dict[str, Any]:
    return load_platform_json("demo_content.json")


def load_curriculum_guide() -> dict[str, Any]:
    return load_platform_json("curriculum_guide.json")


def load_curriculum_topics() -> dict[str, Any]:
    return load_platform_json("curriculum_topics.json")


def load_subject_curriculum(filename: str) -> dict[str, Any]:
    return load_platform_json(filename)


def load_mathematics_curriculum() -> dict[str, Any]:
    return load_subject_curriculum("mathematics_curriculum.json")


def load_chemistry_curriculum() -> dict[str, Any]:
    return load_subject_curriculum("chemistry_curriculum.json")


def load_physics_curriculum() -> dict[str, Any]:
    return load_subject_curriculum("physics_curriculum.json")


def load_business_studies_curriculum() -> dict[str, Any]:
    return load_subject_curriculum("business_studies_curriculum.json")


def curriculum_subjects() -> list[str]:
    return list(load_curriculum_topics().get("subjects", {}).keys())


def validate_learning_content(content: Any) -> dict[str, Any]:
    if not isinstance(content, dict):
        raise ValueError("AI response must be a JSON object.")

    required_fields = ["title", "explanation", "key_points", "example", "questions"]
    for field in required_fields:
        if field not in content:
            raise ValueError(f"Missing required field: {field}")

    title = str(content.get("title", "")).strip()
    explanation = str(content.get("explanation", "")).strip()
    example = str(content.get("example", "")).strip()
    key_points = content.get("key_points")
    questions = content.get("questions")

    if not title or not explanation or not example:
        raise ValueError("Title, explanation, and example are required.")

    if not isinstance(key_points, list) or not key_points or len(key_points) < 3:
        raise ValueError("Key points must be a list with at least three items.")

    if not isinstance(questions, list) or len(questions) != 5:
        raise ValueError("Exactly five questions are required.")

    normalized_questions = []
    for question in questions:
        if not isinstance(question, dict):
            raise ValueError("Each question must be an object.")

        q_text = str(question.get("question", "")).strip()
        q_options = question.get("options")
        answer = question.get("answer")
        explanation_text = str(question.get("explanation", "")).strip()

        if not q_text or not q_options or not explanation_text:
            raise ValueError("Each question must include text, options, and an explanation.")

        if not isinstance(q_options, list) or len(q_options) != 4:
            raise ValueError("Each question must have exactly four options.")

        if not isinstance(answer, int) or answer < 0 or answer > 3:
            raise ValueError("Each question answer must be an integer between 0 and 3.")

        normalized_questions.append(
            {
                "question": q_text,
                "options": [str(option).strip() for option in q_options],
                "answer": answer,
                "explanation": explanation_text,
            }
        )

    return {
        "title": title,
        "explanation": explanation,
        "key_points": [str(point).strip() for point in key_points if str(point).strip()],
        "example": example,
        "questions": normalized_questions,
        "source": "ai",
    }


def build_ai_prompt(subject: str, topic: str) -> str:
    return (
        f"You are a kind and knowledgeable secondary school tutor. "
        f"Teach the topic '{topic}' in {subject}. "
        "Use age-appropriate language and explain clearly. "
        "Provide a brief but helpful explanation, three to five key learning points, and one example. "
        "Then generate exactly five multiple-choice questions about the topic. "
        "Each question must have four options and only one correct answer. "
        "Include the correct index and a short explanation for the correct answer. "
        "Do not invent facts. If something is uncertain, say so clearly. "
        "Keep the output valid JSON with this structure: "
        '{"title":"string","explanation":"string","key_points":["string"],"example":"string","questions":[{"question":"string","options":["string","string","string","string"],"answer":0,"explanation":"string"}]}'
        " The JSON must contain exactly five questions and exactly four options in each question."
    )


def call_openai_api(subject: str, topic: str) -> dict[str, Any]:
    api_key = (os.getenv("OPENAI_API_KEY") or "").strip()
    if not api_key or api_key == "your_openai_api_key_here":
        raise RuntimeError("Missing API key.")

    client = OpenAI(api_key=api_key)

    schema = {
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "explanation": {"type": "string"},
            "key_points": {
                "type": "array",
                "items": {"type": "string"},
                "minItems": 3,
                "maxItems": 5,
            },
            "example": {"type": "string"},
            "questions": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "question": {"type": "string"},
                        "options": {
                            "type": "array",
                            "items": {"type": "string"},
                            "minItems": 4,
                            "maxItems": 4,
                        },
                        "answer": {"type": "integer", "minimum": 0, "maximum": 3},
                        "explanation": {"type": "string"},
                    },
                    "required": ["question", "options", "answer", "explanation"],
                    "additionalProperties": False,
                },
                "minItems": 5,
                "maxItems": 5,
            },
        },
        "required": ["title", "explanation", "key_points", "example", "questions"],
        "additionalProperties": False,
    }

    response = client.responses.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        input=[
            {"role": "system", "content": build_ai_prompt(subject, topic)},
            {"role": "user", "content": f"Create a study lesson and quiz for {subject}: {topic}."},
        ],
        text={
            "format": {
                "type": "json_schema",
                "name": "learning_content",
                "schema": schema,
                "strict": True,
            }
        },
    )

    raw_response = getattr(response, "output_text", None)
    if raw_response:
        parsed_json = json.loads(raw_response)
    else:
        output_item = response.output[0]
        text_value = output_item.content[0].text
        parsed_json = json.loads(text_value)

    return validate_learning_content(parsed_json)


def get_learning_content(subject: str, topic: str) -> dict[str, Any]:
    try:
        return call_openai_api(subject, topic)
    except Exception:
        demo_content = load_demo_content()
        lessons = demo_content.get("lessons", {})
        lesson = lessons.get(subject) or lessons.get("History")
        if not lesson:
            raise ValueError("No local lesson is available for this subject.")

        result = dict(lesson)
        result["subject"] = subject
        result["source"] = "demo"
        result["demo_label"] = demo_content.get("demo_label", "Local curriculum lesson")

        curriculum_files = {
            "Mathematics": "mathematics_curriculum.json",
            "Chemistry": "chemistry_curriculum.json",
            "Physics": "physics_curriculum.json",
            "Business Studies": "business_studies_curriculum.json",
        }
        curriculum_filename = curriculum_files.get(subject)
        if curriculum_filename:
            curriculum = load_subject_curriculum(curriculum_filename)
            result["worked_answers"] = curriculum.get("worked", [])
            result["curriculum_source_note"] = curriculum.get("source_note")

        if subject == "Mathematics":
            mathematics = load_mathematics_curriculum()
            topic_lower = topic.lower()
            topic_words = {
                word
                for word in topic_lower.replace(",", "").split()
                if len(word) > 3
            }
            strands = mathematics.get("strands", [])
            selected_strand = next(
                (
                    strand
                    for strand in strands
                    if strand["name"].lower() in topic_lower
                    or any(
                        word in topic_words
                        for word in strand["name"].lower().replace(",", "").split()
                        if len(word) > 3
                    )
                ),
                strands[0] if strands else None,
            )
            if selected_strand:
                result["curriculum_strand"] = selected_strand["name"]
                result["curriculum_notes"] = selected_strand.get("notes", [])
            result["key_terms"] = mathematics.get("terms", [])
            result["revision_tasks"] = mathematics.get("questions", [])

        return result


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/curriculum-builder")
def curriculum_builder_redirect():
    return redirect(url_for("curriculum_builder"))


@app.route("/curriculum-builder/")
def curriculum_builder():
    return send_from_directory(CURRICULUM_BUILDER_DIR, "index.html")


@app.route("/curriculum-builder/<path:filename>")
def curriculum_builder_assets(filename: str):
    return send_from_directory(CURRICULUM_BUILDER_DIR, filename)


@app.route("/api/health")
def health_check():
    return jsonify({"status": "ok", "app": "SomaSmart"})


@app.route("/api/curriculum")
def curriculum():
    return jsonify(load_curriculum_guide())


@app.route("/api/curriculum-topics")
def curriculum_topics():
    return jsonify(load_curriculum_topics())


@app.route("/api/curriculum/mathematics")
def mathematics_curriculum():
    return jsonify(load_mathematics_curriculum())


@app.route("/api/curriculum/chemistry")
def chemistry_curriculum():
    return jsonify(load_chemistry_curriculum())


@app.route("/api/curriculum/physics")
def physics_curriculum():
    return jsonify(load_physics_curriculum())


@app.route("/api/curriculum/business-studies")
def business_studies_curriculum():
    return jsonify(load_business_studies_curriculum())


@app.route("/api/history")
def learning_history():
    return jsonify(
        {
            "lessons": list_lessons(app.config["DATABASE_PATH"]),
            "quiz_attempts": list_quiz_attempts(app.config["DATABASE_PATH"]),
        }
    )


@app.route("/api/lessons/<int:lesson_id>")
def saved_lesson(lesson_id: int):
    lesson = get_lesson(app.config["DATABASE_PATH"], lesson_id)
    if lesson is None:
        return jsonify({"error": "Lesson not found."}), 404
    return jsonify(lesson)


@app.route("/api/quiz-attempts", methods=["POST"])
def create_quiz_attempt():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "A JSON request body is required."}), 400

    lesson_id = data.get("lesson_id")
    selected_answers = data.get("selected_answers")
    if isinstance(lesson_id, bool) or not isinstance(lesson_id, int) or lesson_id < 1:
        return jsonify({"error": "A valid lesson ID is required."}), 400
    if not isinstance(selected_answers, list):
        return jsonify({"error": "Selected answers must be a list."}), 400

    try:
        attempt = save_quiz_attempt(
            app.config["DATABASE_PATH"], lesson_id, selected_answers
        )
    except LookupError as error:
        return jsonify({"error": str(error)}), 404
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    return jsonify(attempt), 201


@app.route("/api/curriculum-builder/plans", methods=["GET", "POST"])
def curriculum_builder_plans():
    if request.method == "GET":
        return jsonify({"plans": list_curriculum_plans(app.config["DATABASE_PATH"])})

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "A JSON request body is required."}), 400

    fields = ("subject", "strand", "grade", "duration")
    limits = {"subject": 100, "strand": 200, "grade": 40, "duration": 40}
    plan = {}
    for field in fields:
        value = data.get(field)
        if not isinstance(value, str) or not value.strip():
            return jsonify({"error": f"{field.capitalize()} is required."}), 400
        if len(value.strip()) > limits[field]:
            return jsonify({"error": f"{field.capitalize()} is too long."}), 400
        plan[field] = value.strip()

    content = data.get("plan")
    if not isinstance(content, dict):
        return jsonify({"error": "A lesson plan object is required."}), 400
    plan["plan"] = content

    plan_id = save_curriculum_plan(app.config["DATABASE_PATH"], plan)
    return jsonify({"id": plan_id, "plan": plan}), 201


@app.route("/api/curriculum-builder/plans/<int:plan_id>", methods=["DELETE"])
def remove_curriculum_builder_plan(plan_id: int):
    if not delete_curriculum_plan(app.config["DATABASE_PATH"], plan_id):
        return jsonify({"error": "Lesson plan not found."}), 404
    return jsonify({"deleted": True, "id": plan_id})


@app.route("/api/learn", methods=["POST"])
def learn():
    client_key = request.remote_addr or "unknown"
    if is_rate_limited(client_key):
        response = jsonify({"error": "Too many lesson requests. Please try again shortly."})
        response.status_code = 429
        response.headers["Retry-After"] = str(RATE_LIMIT_WINDOW_SECONDS)
        return response

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        data = {}
    subject_value = data.get("subject")
    topic_value = data.get("topic")
    subject = subject_value.strip() if isinstance(subject_value, str) else ""
    topic = topic_value.strip() if isinstance(topic_value, str) else ""

    if not subject or not topic:
        return jsonify({"error": "Subject and topic are required."}), 400

    if len(subject) > 100:
        return jsonify({"error": "Subject name is too long."}), 400

    if len(topic) > 200:
        return jsonify({"error": "Topic is too long. Please keep it under 200 characters."}), 400

    if subject not in curriculum_subjects():
        return jsonify({"error": "Please choose a valid subject."}), 400

    try:
        result = get_learning_content(subject, topic)
        result["lesson_id"] = save_lesson(
            app.config["DATABASE_PATH"], subject, topic, result
        )
        return jsonify(result)
    except Exception:
        app.logger.exception("Failed to generate lesson content")
        return jsonify({"error": "Something went wrong while preparing your lesson."}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
