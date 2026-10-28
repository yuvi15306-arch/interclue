from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.api.endpoints.auth import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.subscription import Subscription
from app.services.gemini_service import gemini_service, resolve_question_category
from app.core.question_repository import (
    QUESTION_BANK,
    CATEGORIES,
    get_questions,
    get_category_counts,
    get_question_by_id
)

router = APIRouter()

BANK_CATEGORIES = [
    "Programming Fundamentals",
    "DBMS and SQL",
    "DSA",
    "Web Development and APIs",
    "OS and Networks",
    "Project",
    "HR",
    "Behavioral"
]

CATEGORY_MAP = {
    "programming": "Programming Fundamentals",
    "programming fundamental": "Programming Fundamentals",
    "programming fundamentals": "Programming Fundamentals",
    "fundamentals": "Programming Fundamentals",
    "dbms": "DBMS and SQL",
    "sql": "DBMS and SQL",
    "dbms and sql": "DBMS and SQL",
    "database": "DBMS and SQL",
    "dsa": "DSA",
    "data structures": "DSA",
    "algorithms": "DSA",
    "web development": "Web Development and APIs",
    "web development and apis": "Web Development and APIs",
    "apis": "Web Development and APIs",
    "api": "Web Development and APIs",
    "web": "Web Development and APIs",
    "os": "OS and Networks",
    "networks": "OS and Networks",
    "os and networks": "OS and Networks",
    "operating systems": "OS and Networks",
    "project": "Project",
    "projects": "Project",
    "system architecture": "Project",
    "hr": "HR",
    "behavioral": "Behavioral",
    "situational": "Behavioral",
    "technical": "Programming Fundamentals"
}


def _plan_tier(db: Session, user: User) -> str:
    sub = db.query(Subscription).filter(Subscription.user_id == user.id, Subscription.status == "active").first()
    return sub.plan_tier if sub else "free"


@router.get("/")
def get_question_bank_items(
    category: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve questions from the curated 800-question repository across 8 categories:
    Programming Fundamentals, DBMS and SQL, DSA, Web Development and APIs,
    OS and Networks, Project, HR, and Behavioral.
    """
    user_role = current_user.profile.target_role if current_user.profile else "Full Stack Developer"
    user_diff = difficulty or (current_user.profile.experience_level if current_user.profile else "Junior")
    plan_tier = _plan_tier(db, current_user)
    is_pro = plan_tier != "free"
    free_limit = getattr(settings, "FREE_QUESTION_BANK_PER_CATEGORY", 10)

    # Map category to canonical name
    normalized_category = None
    if category and category.lower() != "all":
        key = category.lower().strip()
        normalized_category = CATEGORY_MAP.get(key, category)

    result = get_questions(
        category=normalized_category,
        difficulty=difficulty,
        search=search,
        limit=limit,
        offset=offset
    )

    formatted_questions = []
    for idx, q in enumerate(result["questions"]):
        unlocked = is_pro or idx < free_limit
        formatted_questions.append({
            "id": q["id"],
            "question_text": q["question_text"] if unlocked else "Upgrade to InterClue Pro to unlock this question.",
            "full_question_text": q["question_text"] if unlocked else None,
            "category": q["category"],
            "role": q.get("role", user_role),
            "difficulty": q.get("difficulty", user_diff),
            "expected_key_points": q.get("expected_key_points", []) if unlocked else [],
            "source": "Curated Bank (100 per category)",
            "is_bookmarked": q["id"] in [1, 101, 201, 301],
            "is_locked": not unlocked
        })

    # Include resume questions if available and user is looking at all/project
    if offset == 0 and (not category or category.lower() in ["all", "project", "technical"]):
        latest_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
        if latest_resume and latest_resume.generated_questions:
            for idx, rq in enumerate(latest_resume.generated_questions[:3]):
                formatted_questions.insert(0, {
                    "id": 9000 + idx,
                    "question_text": rq,
                    "full_question_text": rq,
                    "category": "Project",
                    "role": user_role,
                    "difficulty": user_diff,
                    "expected_key_points": ["Personal project architecture", "Engineering decisions", "Measurable impact"],
                    "source": "Generated from Resume",
                    "is_bookmarked": True,
                    "is_locked": False
                })

    return {
        "role": user_role,
        "difficulty": user_diff,
        "total_count": result["total_count"],
        "limit": limit,
        "offset": offset,
        "category": normalized_category or "All",
        "is_pro": is_pro,
        "gemini_enabled": gemini_service.client_available,
        "questions": formatted_questions
    }


@router.get("/categories")
def get_categories_overview():
    """Returns all 8 categories and the count of questions available in each category (100 each)."""
    counts = get_category_counts()
    return {
        "total_questions": len(QUESTION_BANK),
        "questions_per_category": 100,
        "categories": [
            {
                "name": cat,
                "count": counts.get(cat, 0),
                "description": f"Curated collection of {counts.get(cat, 0)} {cat} interview questions"
            }
            for cat in CATEGORIES
        ]
    }


@router.post("/generate-personalized")
def generate_personalized_question(
    category: str = "Programming Fundamentals",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_role = current_user.profile.target_role if current_user.profile else "Full Stack Developer"
    difficulty = current_user.profile.experience_level if current_user.profile else "Junior"

    # Normalize category
    norm_cat = CATEGORY_MAP.get(category.lower().strip(), category)
    locked_category = resolve_question_category("Mixed", requested=norm_cat)

    q_data = gemini_service.generate_question(
        role=target_role,
        difficulty=difficulty,
        category=locked_category,
        interview_type="Mixed"
    )

    return {
        "question_text": q_data["question_text"],
        "category": q_data.get("category", locked_category),
        "role": target_role,
        "difficulty": difficulty,
        "expected_key_points": q_data.get("expected_key_points", []),
        "gemini_enabled": gemini_service.client_available
    }
