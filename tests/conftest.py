import sys
import os
import uuid
import pytest
from fastapi.testclient import TestClient

# Ensure backend directory is in sys.path regardless of execution directory
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)



from app.core.database import engine, Base, SessionLocal
from app.models.user import User, Profile
from app.models.subscription import Subscription
from app.core.security import get_password_hash
from main import app, init_db_seeds


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Ensure database schema and default seeds exist for all test runs."""
    Base.metadata.create_all(bind=engine)
    init_db_seeds()
    yield


@pytest.fixture(scope="session")
def client():
    """Shared FastAPI TestClient instance."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def auth_headers(client):
    """Provides valid JWT Bearer authentication headers for a test user."""
    email = f"user_{uuid.uuid4().hex[:8]}@interclue.ai"
    reg_res = client.post("/auth/register", json={
        "email": email,
        "password": "TestPassword123!",
        "full_name": "Test Candidate",
        "target_role": "Full Stack Developer",
        "experience_level": "Junior"
    })
    token = reg_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(client):
    """Provides valid JWT Bearer authentication headers for the seeded admin."""
    login_res = client.post("/auth/login", json={
        "email": "admin@interclue.ai",
        "password": "admin123"
    })
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
