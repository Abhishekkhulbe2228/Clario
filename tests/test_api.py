import os
import unittest

os.environ.setdefault("DATABASE_URL", "sqlite:///data/test_clario.db")
os.environ.setdefault("JWT_SECRET", "test-secret-only")
os.environ.setdefault("BOOTSTRAP_ADMIN_EMAIL", "admin@example.com")
os.environ.setdefault("BOOTSTRAP_ADMIN_PASSWORD", "correct-horse-battery-staple")
os.environ.setdefault("BOOTSTRAP_EMPLOYEE_EMAIL", "employee@company.com")
os.environ.setdefault("BOOTSTRAP_EMPLOYEE_PASSWORD", "Employee1234!")

from fastapi.testclient import TestClient
from app.main import app


import datetime
from unittest.mock import patch

from app.core.security import create_access_token
from app.models import User


class ApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        # Login as system admin
        response = cls.client.post("/api/v1/auth/login", json={
            "email": "admin@example.com",
            "password": "correct-horse-battery-staple",
        })
        assert response.status_code == 200, response.text
        cls.admin_token = response.json()["access_token"]
        cls.headers = {"Authorization": f"Bearer {cls.admin_token}"}

        # Login as employee
        emp_response = cls.client.post("/api/v1/auth/login", json={
            "email": "employee@company.com",
            "password": "Employee1234!",
        })
        assert emp_response.status_code == 200, emp_response.text
        cls.emp_token = emp_response.json()["access_token"]
        cls.emp_headers = {"Authorization": f"Bearer {cls.emp_token}"}

    def test_health(self):
        response = self.client.get("/api/v1/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")
        self.assertEqual(response.headers["x-content-type-options"], "nosniff")

    def test_chat_without_token_returns_401(self):
        response = self.client.post("/api/v1/chat", json={"question": "What is the vacation policy?"})
        self.assertEqual(response.status_code, 401)
        self.assertIn("Authentication required", response.json()["detail"])

    def test_chat_with_invalid_token_returns_401(self):
        response = self.client.post(
            "/api/v1/chat",
            json={"question": "What is the vacation policy?"},
            headers={"Authorization": "Bearer bad.token.here"},
        )
        self.assertEqual(response.status_code, 401)
        self.assertIn("Invalid or expired", response.json()["detail"])

    def test_chat_with_expired_token_returns_401(self):
        # Create an expired token for admin
        dummy_user = User(id=1, email="admin@example.com", role="system_admin", is_active=True)
        expired_token = create_access_token(dummy_user, expires_delta=datetime.timedelta(seconds=-10))
        response = self.client.post(
            "/api/v1/chat",
            json={"question": "What is the vacation policy?"},
            headers={"Authorization": f"Bearer {expired_token}"},
        )
        self.assertEqual(response.status_code, 401)
        self.assertIn("Invalid or expired", response.json()["detail"])

    def test_chat_with_valid_authenticated_user(self):
        with patch("app.api.routes.ask") as mock_ask:
            mock_ask.return_value = {
                "answer": "Employees receive 20 days of paid vacation annually.",
                "source_used": "private_kb",
                "trace": ["Route -> KB", "Grade -> GOOD"],
                "citations": [{"title": "Leave_Policy.pdf", "url": "", "type": "private_kb"}],
                "current_query": "What is the vacation policy?",
            }
            response = self.client.post(
                "/api/v1/chat",
                json={"question": "What is the vacation policy?"},
                headers=self.headers,
            )
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data["answer"], "Employees receive 20 days of paid vacation annually.")
            self.assertEqual(data["source_used"], "private_kb")
            self.assertEqual(len(data["citations"]), 1)

    def test_employee_can_chat_and_submit_feedback(self):
        with patch("app.api.routes.ask") as mock_ask:
            mock_ask.return_value = {
                "answer": "Standard probation is 3 months.",
                "source_used": "direct",
                "trace": ["Direct"],
                "citations": [],
                "current_query": "Probation period?",
            }
            # Employee can chat
            chat_res = self.client.post(
                "/api/v1/chat",
                json={"question": "Probation period?"},
                headers=self.emp_headers,
            )
            self.assertEqual(chat_res.status_code, 200)

            # Employee can submit feedback
            fb_res = self.client.post(
                "/api/v1/feedback",
                headers=self.emp_headers,
                json={"message_id": "msg-123", "helpful": True, "comment": "Great answer!"},
            )
            self.assertEqual(fb_res.status_code, 201)

    def test_role_permissions_employee_cannot_access_admin_endpoints(self):
        # Employee cannot list documents or ingest
        self.assertEqual(self.client.get("/api/v1/documents", headers=self.emp_headers).status_code, 403)
        self.assertEqual(self.client.get("/api/v1/audit", headers=self.emp_headers).status_code, 403)

        # Admin CAN access documents and audit
        self.assertEqual(self.client.get("/api/v1/documents", headers=self.headers).status_code, 200)
        self.assertEqual(self.client.get("/api/v1/audit", headers=self.headers).status_code, 200)

    def test_auth_me_endpoint(self):
        # Unauthenticated returns 401
        self.assertEqual(self.client.get("/api/v1/auth/me").status_code, 401)

        # Admin returns admin info
        res_admin = self.client.get("/api/v1/auth/me", headers=self.headers)
        self.assertEqual(res_admin.status_code, 200)
        self.assertEqual(res_admin.json()["email"], "admin@example.com")
        self.assertEqual(res_admin.json()["role"], "system_admin")

        # Employee returns employee info
        res_emp = self.client.get("/api/v1/auth/me", headers=self.emp_headers)
        self.assertEqual(res_emp.status_code, 200)
        self.assertEqual(res_emp.json()["email"], "employee@company.com")
        self.assertEqual(res_emp.json()["role"], "employee")

    def test_auth_refresh_endpoint(self):
        # Unauthenticated returns 401
        self.assertEqual(self.client.post("/api/v1/auth/refresh").status_code, 401)

        # Authenticated returns fresh token
        refresh_res = self.client.post("/api/v1/auth/refresh", headers=self.headers)
        self.assertEqual(refresh_res.status_code, 200)
        new_token = refresh_res.json()["access_token"]
        self.assertTrue(bool(new_token))

        # New token works for protected calls
        new_headers = {"Authorization": f"Bearer {new_token}"}
        me_res = self.client.get("/api/v1/auth/me", headers=new_headers)
        self.assertEqual(me_res.status_code, 200)


class RegistrationTests(unittest.TestCase):
    PASSWORD = "a-long-test-passphrase"

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def setUp(self):
        from app.core.rate_limit import rate_limiter
        rate_limiter._events.clear()

    def _email(self):
        import uuid
        return f"new.employee+{uuid.uuid4().hex[:10]}@example.com"

    def _register(self, **overrides):
        body = {"name": "Jamie Rivera", "email": self._email(), "password": self.PASSWORD}
        body.update(overrides)
        return self.client.post("/api/v1/auth/register", json=body), body

    def test_valid_signup_creates_employee_and_returns_token(self):
        res, body = self._register(email="  " + self._email().upper() + " ")
        self.assertEqual(res.status_code, 201, res.text)
        data = res.json()
        self.assertEqual(data["role"], "employee")
        self.assertEqual(data["email"], body["email"].strip().lower())
        self.assertEqual(data["full_name"], "Jamie Rivera")
        self.assertNotIn("password", data)
        self.assertNotIn("password_hash", data)

        me = self.client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {data['access_token']}"})
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.json()["role"], "employee")
        self.assertEqual(me.json()["full_name"], "Jamie Rivera")

    def test_password_is_hashed_not_plaintext(self):
        from sqlalchemy import select
        from app.core.database import SessionLocal

        res, body = self._register()
        self.assertEqual(res.status_code, 201)
        with SessionLocal() as db:
            user = db.scalar(select(User).where(User.email == body["email"]))
            self.assertNotEqual(user.password_hash, self.PASSWORD)
            self.assertTrue(user.password_hash.startswith("scrypt$"))

    def test_signup_cannot_escalate_role(self):
        for role in ("system_admin", "hr_admin", "admin"):
            res, _ = self._register(role=role)
            self.assertEqual(res.status_code, 201, res.text)
            self.assertEqual(res.json()["role"], "employee")

    def test_duplicate_email_returns_409(self):
        email = self._email()
        first, _ = self._register(email=email)
        self.assertEqual(first.status_code, 201)
        second, _ = self._register(email=email.upper())
        self.assertEqual(second.status_code, 409)
        self.assertEqual(second.json()["detail"], "An account with this email already exists.")

    def test_bootstrap_admin_email_cannot_be_reregistered(self):
        res, _ = self._register(email="admin@example.com")
        self.assertEqual(res.status_code, 409)

    def test_invalid_inputs_return_422(self):
        cases = [
            {"email": "not-an-email"},
            {"password": "short"},
            {"password": " " * 14},
            {"name": " "},
            {"name": ""},
        ]
        for override in cases:
            res, _ = self._register(**override)
            self.assertEqual(res.status_code, 422, f"{override} -> {res.status_code}")
        self.setUp()  # reset rate limiter
        missing = self.client.post("/api/v1/auth/register", json={})
        self.assertEqual(missing.status_code, 422)

    def test_register_is_rate_limited(self):
        statuses = [self._register(email="bad")[0].status_code for _ in range(6)]
        self.assertEqual(statuses[:5], [422] * 5)
        self.assertEqual(statuses[5], 429)

    def test_new_employee_can_login_and_is_blocked_from_admin(self):
        res, body = self._register()
        self.assertEqual(res.status_code, 201)

        login = self.client.post("/api/v1/auth/login", json={"email": body["email"], "password": self.PASSWORD})
        self.assertEqual(login.status_code, 200)
        headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
        self.assertEqual(self.client.get("/api/v1/documents", headers=headers).status_code, 403)
        self.assertEqual(self.client.get("/api/v1/audit", headers=headers).status_code, 403)

    def test_login_wrong_password_and_unknown_email_return_401(self):
        res, body = self._register()
        self.assertEqual(res.status_code, 201)
        wrong = self.client.post("/api/v1/auth/login", json={"email": body["email"], "password": "wrong-password-123"})
        self.assertEqual(wrong.status_code, 401)
        unknown = self.client.post("/api/v1/auth/login", json={"email": self._email(), "password": self.PASSWORD})
        self.assertEqual(unknown.status_code, 401)
        self.assertEqual(wrong.json()["detail"], unknown.json()["detail"])


if __name__ == "__main__":
    unittest.main()


