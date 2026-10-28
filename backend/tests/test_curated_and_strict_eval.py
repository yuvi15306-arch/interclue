import pytest
from app.core.question_repository import QUESTION_BANK, CATEGORIES, get_category_counts
from app.services.gemini_service import gemini_service


def test_eight_categories_100_questions_each():
    counts = get_category_counts()
    expected_categories = [
        "Programming Fundamentals",
        "DBMS and SQL",
        "DSA",
        "Web Development and APIs",
        "OS and Networks",
        "Project",
        "HR",
        "Behavioral"
    ]
    assert len(CATEGORIES) == 8
    for cat in expected_categories:
        assert cat in counts, f"Category {cat} missing from counts"
        assert counts[cat] == 100, f"Category {cat} has {counts[cat]} questions, expected 100"
    assert len(QUESTION_BANK) == 800


def test_strict_evaluation_for_wrong_and_evasive_answers():
    # Test evasive answer
    evasive_res = gemini_service.evaluate_response(
        question_text="What is a deadlock and what are the Coffman conditions required for it to occur?",
        answer_text="I don't know, I haven't studied this topic yet.",
        role="Backend Developer",
        category="OS and Networks"
    )
    assert evasive_res["is_correct"] is False
    assert evasive_res["overall_score"] <= 3.5
    assert len(evasive_res["corrections_and_misconceptions"]) >= 1
    assert evasive_res["ideal_answer"] is not None

    # Test incorrect answer
    wrong_res = gemini_service.evaluate_response(
        question_text="Explain the difference between clustered and non-clustered indexes in SQL databases.",
        answer_text="A clustered index makes the computer run faster by deleting old records from disk, and non clustered index sends an email to the administrator.",
        role="Backend Developer",
        category="DBMS and SQL"
    )
    assert wrong_res["is_correct"] is False
    assert wrong_res["overall_score"] <= 4.0
    assert len(wrong_res["corrections_and_misconceptions"]) >= 1

    # Test competent answer
    good_res = gemini_service.evaluate_response(
        question_text="Explain the difference between clustered and non-clustered indexes in SQL databases.",
        answer_text="A clustered index dictates the physical sorting and storage order of table data on disk, meaning a table can have only one clustered index (typically on the primary key). Non-clustered indexes maintain a separate B-tree structure where leaf nodes contain row pointers or clustering keys pointing back to the data rows. Multiple non-clustered indexes can exist on a table.",
        role="Backend Developer",
        category="DBMS and SQL"
    )
    assert good_res["is_correct"] is True
    assert good_res["overall_score"] >= 7.0


def test_question_bank_categories_endpoint(client):
    res = client.get("/question-bank/categories")
    assert res.status_code == 200
    data = res.json()
    assert data["total_questions"] == 800
    assert data["questions_per_category"] == 100
    assert len(data["categories"]) == 8


def test_supabase_auth_sync(client):
    # Test syncing a user authenticated via Supabase
    sync_payload = {
        "access_token": "test-sb-uuid-12345-access-token",
        "email": "supabase_user@interclue.ai",
        "full_name": "Supabase Candidate",
        "target_role": "Full Stack Developer",
        "experience_level": "Junior"
    }
    res = client.post("/auth/supabase/sync", json=sync_payload)
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "supabase_user@interclue.ai"
