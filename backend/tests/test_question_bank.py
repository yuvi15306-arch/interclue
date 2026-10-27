def test_question_bank_listing(client, auth_headers):
    res = client.get("/question-bank/?role=Frontend+Developer", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "questions" in data
    assert data["questions_per_category"] == 55
    assert data["free_tier_limit"] == 5
    assert data["total_count"] == 55 * 5
    assert len(data["questions"]) == 275


def test_question_bank_category_filter(client, auth_headers):
    res = client.get("/question-bank/?role=Backend+Developer&category=Technical", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data["questions"]) == 55
    unlocked = [q for q in data["questions"] if not q.get("is_locked")]
    locked = [q for q in data["questions"] if q.get("is_locked")]
    assert len(unlocked) == 5
    assert len(locked) == 50
    for q in data["questions"]:
        assert q["category"] == "Technical"


def test_generate_personalized_question(client, auth_headers):
    res = client.post("/question-bank/generate-personalized?category=Technical", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "question_text" in data
    assert "expected_key_points" in data
    assert len(data["question_text"]) > 10
    assert data.get("category") == "Technical"
