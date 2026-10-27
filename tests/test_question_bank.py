import pytest


def test_question_bank_listing(client, auth_headers):
    # Fetch questions for current role
    res = client.get("/question-bank/?role=Frontend+Developer", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "questions" in data
    assert data["total_count"] > 0
    assert len(data["questions"]) > 0


def test_question_bank_category_filter(client, auth_headers):
    # Filter by category
    res = client.get("/question-bank/?role=Backend+Developer&category=Technical", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    for q in data["questions"]:
        assert q["category"] == "Technical"


def test_generate_personalized_question(client, auth_headers):
    # Generate on-demand question
    res = client.post("/question-bank/generate-personalized?category=Technical", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "question_text" in data
    assert "expected_key_points" in data
    assert len(data["question_text"]) > 10
