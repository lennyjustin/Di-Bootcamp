import json
import sqlite3
from contextlib import contextmanager
from collections.abc import Iterator
from pathlib import Path
from typing import Any


def _connect(database_path: str | Path) -> sqlite3.Connection:
    path = Path(database_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


@contextmanager
def _connection(database_path: str | Path) -> Iterator[sqlite3.Connection]:
    connection = _connect(database_path)
    try:
        with connection:
            yield connection
    finally:
        connection.close()


def init_database(database_path: str | Path) -> None:
    with _connection(database_path) as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS lessons (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subject TEXT NOT NULL,
                topic TEXT NOT NULL,
                title TEXT NOT NULL,
                source TEXT NOT NULL,
                content_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS quiz_attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
                score INTEGER NOT NULL,
                total INTEGER NOT NULL,
                selected_answers_json TEXT NOT NULL,
                completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS curriculum_builder_plans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subject TEXT NOT NULL,
                strand TEXT NOT NULL,
                grade TEXT NOT NULL,
                duration TEXT NOT NULL,
                plan_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS daymark_courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                teacher TEXT NOT NULL,
                level TEXT NOT NULL DEFAULT 'Beginner',
                description TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS daymark_assignments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                course_id INTEGER NOT NULL REFERENCES daymark_courses(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                due_date TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                score INTEGER,
                pass_mark INTEGER NOT NULL DEFAULT 50,
                status TEXT NOT NULL DEFAULT 'pending',
                attempts INTEGER NOT NULL DEFAULT 1,
                teacher TEXT NOT NULL DEFAULT 'Instructor',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """
        )

        if connection.execute("SELECT COUNT(*) FROM daymark_courses").fetchone()[0] == 0:
            connection.executemany(
                """
                INSERT INTO daymark_courses (title, category, teacher, level, description)
                VALUES (?, ?, ?, ?, ?)
                """,
                [
                    (
                        "Web Development",
                        "Technology",
                        "Jane Mwangi",
                        "Intermediate",
                        "Build responsive interfaces and dynamic web applications.",
                    ),
                    (
                        "Accounting Basics",
                        "Business",
                        "James Otieno",
                        "Beginner",
                        "Understand financial records, ledgers, and business decision-making.",
                    ),
                    (
                        "Biology Lab Skills",
                        "Science",
                        "Dr. Amina Yusuf",
                        "Intermediate",
                        "Explore practical laboratory techniques and scientific inquiry.",
                    ),
                ],
            )

        if connection.execute("SELECT COUNT(*) FROM daymark_assignments").fetchone()[0] == 0:
            course_rows = connection.execute(
                "SELECT id, title FROM daymark_courses ORDER BY id"
            ).fetchall()
            course_map = {row["title"]: row["id"] for row in course_rows}
            connection.executemany(
                """
                INSERT INTO daymark_assignments (
                    course_id, title, due_date, description, score, pass_mark, status,
                    attempts, teacher
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    (
                        course_map["Web Development"],
                        "HTML Fundamentals",
                        "2026-10-14",
                        "Create a three-section webpage using semantic HTML and accessible structure.",
                        86,
                        50,
                        "passed",
                        1,
                        "Jane Mwangi",
                    ),
                    (
                        course_map["Web Development"],
                        "CSS Styling",
                        "2026-10-20",
                        "Build a responsive dashboard using CSS colors, layout, and animation.",
                        42,
                        50,
                        "failed",
                        1,
                        "Jane Mwangi",
                    ),
                    (
                        course_map["Accounting Basics"],
                        "Ledger Journal",
                        "2026-10-18",
                        "Record and balance a set of transactions in a ledger.",
                        67,
                        60,
                        "passed",
                        1,
                        "James Otieno",
                    ),
                ],
            )


def save_lesson(
    database_path: str | Path,
    subject: str,
    topic: str,
    lesson: dict[str, Any],
) -> int:
    with _connection(database_path) as connection:
        cursor = connection.execute(
            """
            INSERT INTO lessons (subject, topic, title, source, content_json)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                subject,
                topic,
                str(lesson["title"]),
                str(lesson.get("source", "unknown")),
                json.dumps(lesson, ensure_ascii=False),
            ),
        )
        return int(cursor.lastrowid)


def list_lessons(database_path: str | Path, limit: int = 50) -> list[dict[str, Any]]:
    with _connection(database_path) as connection:
        rows = connection.execute(
            """
            SELECT id, subject, topic, title, source, created_at
            FROM lessons
            ORDER BY id DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
    return [dict(row) for row in rows]


def get_lesson(database_path: str | Path, lesson_id: int) -> dict[str, Any] | None:
    with _connection(database_path) as connection:
        row = connection.execute(
            "SELECT content_json FROM lessons WHERE id = ?", (lesson_id,)
        ).fetchone()
    if row is None:
        return None
    lesson = json.loads(row["content_json"])
    lesson["lesson_id"] = lesson_id
    return lesson


def list_quiz_attempts(
    database_path: str | Path, limit: int = 100
) -> list[dict[str, Any]]:
    with _connection(database_path) as connection:
        rows = connection.execute(
            """
            SELECT attempts.id, attempts.lesson_id, lessons.subject, lessons.topic,
                   lessons.title, attempts.score, attempts.total,
                   attempts.completed_at
            FROM quiz_attempts AS attempts
            JOIN lessons ON lessons.id = attempts.lesson_id
            ORDER BY attempts.id DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
    return [dict(row) for row in rows]


def save_quiz_attempt(
    database_path: str | Path, lesson_id: int, selected_answers: list[int]
) -> dict[str, int]:
    with _connection(database_path) as connection:
        lesson_row = connection.execute(
            "SELECT content_json FROM lessons WHERE id = ?", (lesson_id,)
        ).fetchone()
        if lesson_row is None:
            raise LookupError("Lesson not found.")

        lesson = json.loads(lesson_row["content_json"])
        questions = lesson.get("questions")
        if not isinstance(questions, list) or len(selected_answers) != len(questions):
            raise ValueError("Answers must be provided for every quiz question.")

        for answer, question in zip(selected_answers, questions):
            options = question.get("options")
            if (
                isinstance(answer, bool)
                or not isinstance(answer, int)
                or not isinstance(options, list)
                or answer < 0
                or answer >= len(options)
            ):
                raise ValueError("Each selected answer must be an option index.")

        score = sum(
            selected == question["answer"]
            for selected, question in zip(selected_answers, questions)
        )
        cursor = connection.execute(
            """
            INSERT INTO quiz_attempts
                (lesson_id, score, total, selected_answers_json)
            VALUES (?, ?, ?, ?)
            """,
            (
                lesson_id,
                score,
                len(questions),
                json.dumps(selected_answers),
            ),
        )
        return {
            "attempt_id": int(cursor.lastrowid),
            "lesson_id": lesson_id,
            "score": score,
            "total": len(questions),
        }


def save_curriculum_plan(
    database_path: str | Path, plan: dict[str, Any]
) -> int:
    with _connection(database_path) as connection:
        cursor = connection.execute(
            """
            INSERT INTO curriculum_builder_plans
                (subject, strand, grade, duration, plan_json)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                plan["subject"],
                plan["strand"],
                plan["grade"],
                plan["duration"],
                json.dumps(plan, ensure_ascii=False),
            ),
        )
        return int(cursor.lastrowid)


def list_curriculum_plans(database_path: str | Path) -> list[dict[str, Any]]:
    with _connection(database_path) as connection:
        rows = connection.execute(
            """
            SELECT id, subject, strand, grade, duration, plan_json, created_at
            FROM curriculum_builder_plans
            ORDER BY id DESC
            """
        ).fetchall()
    plans = []
    for row in rows:
        plan = json.loads(row["plan_json"])
        plan.update(
            {
                "id": row["id"],
                "created_at": row["created_at"],
            }
        )
        plans.append(plan)
    return plans


def delete_curriculum_plan(database_path: str | Path, plan_id: int) -> bool:
    with _connection(database_path) as connection:
        cursor = connection.execute(
            "DELETE FROM curriculum_builder_plans WHERE id = ?", (plan_id,)
        )
        return cursor.rowcount > 0


def save_daymark_course(
    database_path: str | Path,
    title: str,
    category: str,
    teacher: str,
    level: str = "Beginner",
    description: str = "",
) -> int:
    with _connection(database_path) as connection:
        cursor = connection.execute(
            """
            INSERT INTO daymark_courses (title, category, teacher, level, description)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                title.strip(),
                category.strip() or "General",
                teacher.strip() or "Instructor",
                level.strip() or "Beginner",
                description.strip(),
            ),
        )
        return int(cursor.lastrowid)


def list_daymark_courses(database_path: str | Path) -> list[dict[str, Any]]:
    with _connection(database_path) as connection:
        rows = connection.execute(
            """
            SELECT id, title, category, teacher, level, description, created_at
            FROM daymark_courses
            ORDER BY id ASC
            """
        ).fetchall()
    return [dict(row) for row in rows]


def save_daymark_assignment(
    database_path: str | Path,
    course_id: int,
    title: str,
    due_date: str,
    teacher: str,
    description: str = "",
    pass_mark: int = 50,
) -> int:
    with _connection(database_path) as connection:
        cursor = connection.execute(
            """
            INSERT INTO daymark_assignments
                (course_id, title, due_date, description, pass_mark, status, attempts, teacher)
            VALUES (?, ?, ?, ?, ?, 'pending', 1, ?)
            """,
            (
                course_id,
                title.strip(),
                due_date,
                description.strip(),
                pass_mark,
                teacher.strip() or "Instructor",
            ),
        )
        return int(cursor.lastrowid)


def list_daymark_assignments(database_path: str | Path) -> list[dict[str, Any]]:
    with _connection(database_path) as connection:
        rows = connection.execute(
            """
            SELECT a.id, a.course_id, a.title, a.due_date, a.description, a.score, a.pass_mark,
                   a.status, a.attempts, a.teacher, c.title AS course_title,
                   c.category AS course_category
            FROM daymark_assignments AS a
            JOIN daymark_courses AS c ON c.id = a.course_id
            ORDER BY a.due_date ASC, a.id DESC
            """
        ).fetchall()
    return [dict(row) for row in rows]


def update_daymark_assignment_result(
    database_path: str | Path,
    assignment_id: int,
    result: str,
    score: int | None = None,
) -> dict[str, Any]:
    with _connection(database_path) as connection:
        row = connection.execute(
            "SELECT id, pass_mark, attempts, status, score FROM daymark_assignments WHERE id = ?",
            (assignment_id,),
        ).fetchone()
        if row is None:
            raise LookupError("Assignment not found.")

        attempts = int(row["attempts"]) + 1
        final_status = result.strip().lower()
        final_score = int(score) if score is not None else int(row["score"] or 0)
        if final_status not in {"passed", "failed", "pending", "retake"}:
            raise ValueError("Result must be passed, failed, pending, or retake.")

        if final_status == "retake":
            final_status = "failed"

        connection.execute(
            """
            UPDATE daymark_assignments
            SET status = ?, score = ?, attempts = ?
            WHERE id = ?
            """,
            (final_status, final_score, attempts, assignment_id),
        )
        return {
            "id": int(assignment_id),
            "status": final_status,
            "score": final_score,
            "attempts": attempts,
        }