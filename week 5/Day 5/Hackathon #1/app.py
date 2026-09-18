import json
import os
from typing import Any

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request
from openai import OpenAI

load_dotenv()
app = Flask(__name__, template_folder="templates", static_folder="static")

SUBJECTS = [
    "History",
    "Biology",
    "Mathematics",
    "Geography",
    "English",
    "Computer Studies",
]


def load_demo_content() -> dict[str, Any]:
    demo_path = os.path.join(os.path.dirname(__file__), "data", "demo_content.json")
    with open(demo_path, "r", encoding="utf-8") as file:
        return json.load(file)


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
        demo_content["source"] = "demo"
        demo_content["demo_label"] = "Demo content"
        return demo_content


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/health")
def health_check():
    return jsonify({"status": "ok", "app": "SomaSmart"})


@app.route("/api/learn", methods=["POST"])
def learn():
    data = request.get_json(silent=True) or {}
    subject = (data.get("subject") or "").strip()
    topic = (data.get("topic") or "").strip()

    if not subject or not topic:
        return jsonify({"error": "Subject and topic are required."}), 400

    if len(subject) > 100:
        return jsonify({"error": "Subject name is too long."}), 400

    if len(topic) > 200:
        return jsonify({"error": "Topic is too long. Please keep it under 200 characters."}), 400

    if subject not in SUBJECTS:
        return jsonify({"error": "Please choose a valid subject."}), 400

    try:
        result = get_learning_content(subject, topic)
        return jsonify(result)
    except Exception:
        app.logger.exception("Failed to generate lesson content")
        return jsonify({"error": "Something went wrong while preparing your lesson."}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
