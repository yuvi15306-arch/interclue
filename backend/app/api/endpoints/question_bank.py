from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.api.endpoints.auth import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.subscription import Subscription
from app.services.gemini_service import gemini_service, resolve_question_category
from app.data.question_bank_data import CATEGORY_QUESTION_BANK, QUESTIONS_PER_CATEGORY, list_category_questions

router = APIRouter()

BANK_CATEGORIES = ["Technical", "Behavioral", "HR", "Aptitude", "Situational"]


def _plan_tier(db: Session, user: User) -> str:
    sub = db.query(Subscription).filter(Subscription.user_id == user.id, Subscription.status == "active").first()
    return sub.plan_tier if sub else "free"


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
    plan_tier = _plan_tier(db, current_user)
    is_pro = plan_tier != "free"
    free_limit = settings.FREE_QUESTION_BANK_PER_CATEGORY

    cats = [category] if category and category in CATEGORY_QUESTION_BANK else BANK_CATEGORIES

    latest_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
    resume_questions = latest_resume.generated_questions if latest_resume and latest_resume.generated_questions else []

    results = []
    id_counter = 100

    for cat in cats:
        visible_index = 0
        for text in list_category_questions(cat, user_role):
            if search and search.lower() not in text.lower():
                continue
            unlocked = is_pro or visible_index < free_limit
            results.append({
                "id": id_counter,
                "question_text": text if unlocked else "Upgrade to InterClue Pro to unlock this question.",
                "full_question_text": text if unlocked else None,
                "category": cat,
                "role": user_role,
                "difficulty": user_diff,
                "source": "Curated Bank (55 per category)",
                "is_bookmarked": visible_index == 0,
                "is_locked": not unlocked,
            })
            id_counter += 1
            visible_index += 1

    if is_pro:
        for idx, text in enumerate(resume_questions):
            if category and category.lower() != "technical":
                continue
            if search and search.lower() not in text.lower():
                continue
            results.append({
                "id": id_counter,
                "question_text": text,
                "full_question_text": text,
                "category": "Technical",
                "role": user_role,
                "difficulty": user_diff,
                "source": "Generated from Resume (Gemini)",
                "is_bookmarked": False,
                "is_locked": False,
            })
            id_counter += 1

    return {
        "role": user_role,
        "difficulty": user_diff,
        "total_count": len(results),
        "questions_per_category": QUESTIONS_PER_CATEGORY,
        "free_tier_limit": free_limit,
        "is_pro": is_pro,
        "gemini_enabled": gemini_service.client_available,
        "questions": results,
    }


@router.post("/generate-personalized")
def generate_personalized_question(
    category: str = "Technical",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_role = current_user.profile.target_role if current_user.profile else "Full Stack Developer"
    difficulty = current_user.profile.experience_level if current_user.profile else "Junior"
    requested = category if category in BANK_CATEGORIES else "Technical"
    locked_category = resolve_question_category(requested, requested=requested)

    q_data = gemini_service.generate_question(
        role=target_role,
        difficulty=difficulty,
        category=locked_category,
        interview_type=locked_category
    )

    return {
        "question_text": q_data["question_text"],
        "category": q_data.get("category", locked_category),
        "role": target_role,
        "difficulty": difficulty,
        "expected_key_points": q_data.get("expected_key_points", []),
        "gemini_enabled": gemini_service.client_available,
    }
