from fastapi import APIRouter
from app.api.endpoints import (
    auth,
    interview,
    resume,
    question_bank,
    analytics,
    dashboard,
    subscriptions,
    admin
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(interview.router, prefix="/interview", tags=["Mock Interview Engine"])
api_router.include_router(resume.router, prefix="/resume", tags=["Resume Analyzer"])
api_router.include_router(question_bank.router, prefix="/question-bank", tags=["Personalized Question Bank"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics & Insights"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Student Dashboard"])
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["Subscriptions & Billing"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Portal"])
