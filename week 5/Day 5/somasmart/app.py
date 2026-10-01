import json
import os
import time
from typing import Any

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request
from openai import OpenAI

load_dotenv()
app = Flask(__name__, template_folder="templates", static_folder="static")
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024

RATE_LIMIT_WINDOW_SECONDS = 60
RATE_LIMIT_MAX_REQUESTS = 20
_learn_requests: dict[str, list[float]] = {}


@app.after_request
def add_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "base-uri 'self'; frame-ancestors 'none'; form-action 'self'; "
        "script-src 'self'; style-src 'self' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; connect-src 'self'; img-src 'self' data:;"
    )
    return response


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


def load_demo_content() -> dict[str, Any]:
    demo_path = os.path.join(os.path.dirname(__file__), "data", "demo_content.json")
    with open(demo_path, "r", encoding="utf-8") as file:
        return json.load(file)


def load_curriculum_topics() -> dict[str, Any]:
    topics_path = os.path.join(os.path.dirname(__file__), "data", "curriculum_topics.json")
    with open(topics_path, "r", encoding="utf-8") as file:
        return json.load(file)


def load_mathematics_curriculum() -> dict[str, Any]:
    curriculum_path = os.path.join(os.path.dirname(__file__), "data", "mathematics_curriculum.json")
    with open(curriculum_path, "r", encoding="utf-8") as file:
        return json.load(file)


def load_chemistry_curriculum() -> dict[str, Any]:
    curriculum_path = os.path.join(os.path.dirname(__file__), "data", "chemistry_curriculum.json")
    with open(curriculum_path, "r", encoding="utf-8") as file:
        return json.load(file)


def load_physics_curriculum() -> dict[str, Any]:
    curriculum_path = os.path.join(os.path.dirname(__file__), "data", "physics_curriculum.json")
    with open(curriculum_path, "r", encoding="utf-8") as file:
        return json.load(file)


def load_business_studies_curriculum() -> dict[str, Any]:
    curriculum_path = os.path.join(os.path.dirname(__file__), "data", "business_studies_curriculum.json")
    with open(curriculum_path, "r", encoding="utf-8") as file:
        return json.load(file)


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
        "Keep the lesson aligned with the subject's school curriculum and use original wording. "
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
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
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
            raise ValueError("No demo lesson is available for this subject.")

        result = dict(lesson)
        result["subject"] = subject
        result["source"] = demo_content.get("source", "demo")
        result["demo_label"] = demo_content.get("demo_label", "Demo content")

        if subject == "Mathematics":
            mathematics = load_mathematics_curriculum()
            topic_lower = topic.lower()
            topic_words = {word for word in topic_lower.replace(",", "").split() if len(word) > 3}
            selected_strand = next(
                (
                    strand
                    for strand in mathematics["strands"]
                    if strand["name"].lower() in topic_lower
                    or any(
                        word in topic_words
                        for word in strand["name"].lower().replace(",", "").split()
                        if len(word) > 3
                    )
                ),
                mathematics["strands"][0],
            )
            result["curriculum_strand"] = selected_strand["name"]
            result["curriculum_notes"] = selected_strand["notes"]
            result["key_terms"] = mathematics["terms"]
            result["revision_tasks"] = mathematics["questions"]
            result["worked_answers"] = mathematics["worked"]

        if subject == "Chemistry":
            chemistry = load_chemistry_curriculum()
            result["worked_answers"] = chemistry["worked"]
            result["curriculum_source_note"] = chemistry["source_note"]

        if subject == "Physics":
            physics = load_physics_curriculum()
            result["worked_answers"] = physics["worked"]
            result["curriculum_source_note"] = physics["source_note"]

        if subject == "Business Studies":
            business_studies = load_business_studies_curriculum()
            result["worked_answers"] = business_studies["worked"]
            result["curriculum_source_note"] = business_studies["source_note"]

        return result


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/health")
def health_check():
    return jsonify({"status": "ok", "app": "SomaSmart"})


@app.errorhandler(413)
def request_too_large(_error):
    return jsonify({"error": "Request is too large."}), 413


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


@app.route("/api/learn", methods=["POST"])
def learn():
    client_key = request.remote_addr or "unknown"
    if is_rate_limited(client_key):
        response = jsonify({"error": "Too many lesson requests. Please try again shortly."})
        response.status_code = 429
        response.headers["Retry-After"] = str(RATE_LIMIT_WINDOW_SECONDS)
        return response

    data = request.get_json(silent=True) or {}
    subject = (data.get("subject") or "").strip()
    topic = (data.get("topic") or "").strip()

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
        return jsonify(result)
    except Exception:
        app.logger.exception("Failed to generate lesson content")
        return jsonify({"error": "Something went wrong while preparing your lesson."}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
