from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.endpoints.auth import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.interview import Question
from app.services.gemini_service import gemini_service, FALLBACK_QUESTIONS

router = APIRouter()


@router.get("/")
def get_question_bank(
    role: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_role = role or (current_user.profile.target_role if current_user.profile else "Full Stack Developer")
    user_diff = difficulty or (current_user.profile.experience_level if current_user.profile else "Junior")

    # Get base questions for role
    base_questions = FALLBACK_QUESTIONS.get(user_role, FALLBACK_QUESTIONS["Full Stack Developer"])

    # Collect questions from user's uploaded resume if any
    latest_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
    resume_questions = latest_resume.generated_questions if latest_resume and latest_resume.generated_questions else []

    results = []
    id_counter = 100

    categories = ["Technical", "Behavioral", "HR", "Aptitude", "Situational"]
    for idx, text in enumerate(base_questions):
        cat = categories[idx % len(categories)]
        if category and category.lower() != cat.lower():
            continue
        if search and search.lower() not in text.lower():
            continue
        results.append({
            "id": id_counter,
            "question_text": text,
            "category": cat,
            "role": user_role,
            "difficulty": user_diff,
            "source": "Curated Bank",
            "is_bookmarked": idx == 0
        })
        id_counter += 1

    for idx, text in enumerate(resume_questions):
        if category and category.lower() != "technical":
            continue
        if search and search.lower() not in text.lower():
            continue
        results.append({
            "id": id_counter,
            "question_text": text,
            "category": "Technical",
            "role": user_role,
            "difficulty": user_diff,
            "source": "Generated from Resume",
            "is_bookmarked": False
        })
        id_counter += 1

    return {
        "role": user_role,
        "difficulty": user_diff,
        "total_count": len(results),
        "questions": results
    }


@router.post("/generate-personalized")
def generate_personalized_question(
    category: str = "Technical",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_role = current_user.profile.target_role if current_user.profile else "Full Stack Developer"
    difficulty = current_user.profile.experience_level if current_user.profile else "Junior"

    q_data = gemini_service.generate_question(
        role=target_role,
        difficulty=difficulty,
        category=category,
        interview_type="Mixed"
    )

    return {
        "question_text": q_data["question_text"],
        "category": q_data.get("category", category),
        "role": target_role,
        "difficulty": difficulty,
        "expected_key_points": q_data.get("expected_key_points", [])
    }
