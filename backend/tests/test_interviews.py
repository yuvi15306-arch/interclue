import pytest


def test_interview_lifecycle(client, auth_headers):
    # 1. Start interview
    start_payload = {
        "role": "Backend Developer",
        "difficulty": "Junior",
        "duration_minutes": 15,
        "interview_type": "Technical",
        "total_questions": 2
    }
    start_res = client.post("/interview/start", json=start_payload, headers=auth_headers)
    assert start_res.status_code == 201
    interview_data = start_res.json()
    assert interview_data["role"] == "Backend Developer"
    assert len(interview_data["questions"]) >= 1

    interview_id = interview_data["id"]
    first_question = interview_data["questions"][0]
    question_id = first_question["id"]

    # 2. Submit Answer and evaluate
    eval_payload = {
        "interview_id": interview_id,
        "question_id": question_id,
        "answer_text": "I design idempotent endpoints by assigning a unique idempotency key header in client requests. In Redis or PostgreSQL, we check if the key was processed within 24 hours to prevent duplicate transactions.",
        "duration_seconds": 45
    }
    eval_res = client.post("/interview/evaluate", json=eval_payload, headers=auth_headers)
    assert eval_res.status_code == 200
    eval_data = eval_res.json()

    # Validate exact prompt schema
    assert "technical_score" in eval_data
    assert "communication_score" in eval_data
    assert "confidence_score" in eval_data
    assert "clarity_score" in eval_data
    assert "overall_score" in eval_data
    assert "strengths" in eval_data
    assert "weaknesses" in eval_data
    assert "suggestions" in eval_data
    assert isinstance(eval_data["strengths"], list)
    assert isinstance(eval_data["weaknesses"], list)
    assert isinstance(eval_data["suggestions"], list)
    assert eval_data["overall_score"] >= 0.0

    # 3. Submit 2nd answer to complete interview
    if eval_data.get("next_question"):
        q2 = eval_data["next_question"]
        eval2_res = client.post("/interview/evaluate", json={
            "interview_id": interview_id,
            "question_id": q2["id"],
            "answer_text": "I use connection pooling with SQLAlchemy to manage database sessions efficiently under high load.",
            "duration_seconds": 30
        }, headers=auth_headers)
        assert eval2_res.status_code == 200
        assert eval2_res.json()["is_completed"] is True


def test_interview_history(client, auth_headers):
    # Fetch user history
    res = client.get("/interview/history", headers=auth_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)
