import unittest
from unittest.mock import patch

import app as app_module


class SomaSmartApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app_module.app.config.update(TESTING=True)
        cls.client = app_module.app.test_client()

    def setUp(self):
        app_module._learn_requests.clear()

    def test_health_and_local_platform_frontend(self):
        health = self.client.get("/api/health")
        self.assertEqual(health.status_code, 200)
        self.assertEqual(health.get_json()["status"], "ok")

        page = self.client.get("/")
        self.assertEqual(page.status_code, 200)
        self.assertIn(b"SomaSmart", page.data)

        javascript = self.client.get("/static/app.js")
        stylesheet = self.client.get("/static/style.css")
        self.assertEqual(javascript.status_code, 200)
        self.assertIn(b"/api/curriculum-topics", javascript.data)
        self.assertEqual(stylesheet.status_code, 200)
        javascript.close()
        stylesheet.close()

    def test_curriculum_builder_is_mounted_with_local_assets(self):
        redirect = self.client.get("/curriculum-builder")
        self.assertEqual(redirect.status_code, 302)
        self.assertEqual(redirect.headers["Location"], "/curriculum-builder/")

        builder = self.client.get("/curriculum-builder/")
        self.assertEqual(builder.status_code, 200)
        self.assertIn(b"Curriculum Guide", builder.data)
        self.assertIn("unsafe-inline", builder.headers["Content-Security-Policy"])
        builder.close()

        builder_script = self.client.get("/curriculum-builder/app.js")
        self.assertEqual(builder_script.status_code, 200)
        self.assertIn(b"window.location.origin", builder_script.data)
        self.assertIn(b'link.href = "/"', builder_script.data)
        builder_script.close()

        for asset in (
            "styles.css",
            "app.js",
            "data/part1.js",
            "data/part4.js",
        ):
            with self.subTest(asset=asset):
                response = self.client.get(f"/curriculum-builder/{asset}")
                self.assertEqual(response.status_code, 200)
                response.close()

        home = self.client.get("/")
        self.assertIn(b"/curriculum-builder/", home.data)
        self.assertNotIn("unsafe-inline", home.headers["Content-Security-Policy"])
        home.close()

    def test_all_curriculum_endpoints_load_local_data(self):
        legacy = self.client.get("/api/curriculum")
        self.assertEqual(legacy.status_code, 200)
        self.assertTrue(legacy.get_json()["groups"])

        topics = self.client.get("/api/curriculum-topics")
        self.assertEqual(topics.status_code, 200)
        self.assertIn("Mathematics", topics.get_json()["subjects"])

        curriculum_routes = {
            "/api/curriculum/mathematics": "Mathematics",
            "/api/curriculum/chemistry": "Chemistry",
            "/api/curriculum/physics": "Physics",
            "/api/curriculum/business-studies": "Business Studies",
        }
        for route, expected_subject in curriculum_routes.items():
            with self.subTest(route=route):
                response = self.client.get(route)
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.get_json()["subject"], expected_subject)

    def test_local_lesson_fallback_uses_subject_curriculum_data(self):
        with patch.object(app_module, "call_openai_api", side_effect=RuntimeError("offline")):
            response = self.client.post(
                "/api/learn",
                json={"subject": "Mathematics", "topic": "Quadratic expressions"},
            )

        self.assertEqual(response.status_code, 200)
        lesson = response.get_json()
        self.assertEqual(lesson["source"], "demo")
        self.assertEqual(lesson["subject"], "Mathematics")
        self.assertEqual(len(lesson["questions"]), 5)
        self.assertTrue(lesson["worked_answers"])
        self.assertTrue(lesson["curriculum_notes"])

    def test_local_lesson_fallback_supports_multiple_subjects(self):
        with patch.object(app_module, "call_openai_api", side_effect=RuntimeError("offline")):
            subjects = app_module.load_curriculum_topics()["subjects"]
            for subject in subjects:
                with self.subTest(subject=subject):
                    response = self.client.post(
                        "/api/learn",
                        json={"subject": subject, "topic": "A local study topic"},
                    )
                    self.assertEqual(response.status_code, 200)
                    lesson = response.get_json()
                    self.assertEqual(lesson["subject"], subject)
                    self.assertEqual(lesson["source"], "demo")
                    self.assertEqual(len(lesson["questions"]), 5)

    def test_learn_rejects_invalid_values_without_server_errors(self):
        invalid_requests = [
            {},
            {"subject": ["History"], "topic": "A topic"},
            {"subject": "Not a subject", "topic": "A topic"},
            {"subject": "History", "topic": "x" * 201},
        ]
        for payload in invalid_requests:
            with self.subTest(payload=str(payload)[:40]):
                response = self.client.post("/api/learn", json=payload)
                self.assertEqual(response.status_code, 400)
                self.assertIn("error", response.get_json())

    def test_learn_rate_limit_and_request_size_limit(self):
        too_large = self.client.post(
            "/api/learn",
            data='{"topic":"' + ("x" * 20_000) + '"}',
            content_type="application/json",
        )
        self.assertEqual(too_large.status_code, 413)
        self.assertIn("error", too_large.get_json())
        too_large.close()

        responses = [
            self.client.post("/api/learn", json={"subject": "", "topic": ""})
            for _ in range(app_module.RATE_LIMIT_MAX_REQUESTS + 1)
        ]
        self.assertEqual(responses[-1].status_code, 429)
        self.assertEqual(responses[-1].headers["Retry-After"], "60")
        for response in responses:
            response.close()


if __name__ == "__main__":
    unittest.main()
