import pytest
import uuid


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "InterClue"
    assert data["status"] == "online"
    assert data["branding"]["primary"] == "#2563EB"


def test_user_registration_and_login(client):
    unique_email = f"student_{uuid.uuid4().hex[:8]}@example.com"
    reg_payload = {
        "email": unique_email,
        "password": "Password123!",
        "full_name": "Test Candidate",
        "target_role": "Frontend Developer",
        "experience_level": "Junior",
        "interview_type": "Technical"
    }

    # Register
    res = client.post("/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == unique_email
    assert data["user"]["profile"]["target_role"] == "Frontend Developer"

    # Duplicate registration rejected
    dup_res = client.post("/auth/register", json=reg_payload)
    assert dup_res.status_code == 400
    assert "already registered" in dup_res.json()["detail"].lower()

    # Login with valid credentials
    login_res = client.post("/auth/login", json={
        "email": unique_email,
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    login_data = login_res.json()
    token = login_data["access_token"]
    refresh_token = login_data["refresh_token"]
    assert token

    # Login with invalid credentials rejected
    bad_login = client.post("/auth/login", json={
        "email": unique_email,
        "password": "WrongPassword!"
    })
    assert bad_login.status_code == 401

    # Check /auth/me
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == unique_email

    # Refresh token
    refresh_res = client.post("/auth/refresh", json={"refresh_token": refresh_token})
    assert refresh_res.status_code == 200
    assert "access_token" in refresh_res.json()
