from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.endpoints.auth import get_current_admin
from app.models.user import User
from app.models.interview import Interview
from app.models.resume import Resume
from app.models.subscription import Subscription, Payment
from app.schemas.admin import AdminMetricsResponse, AdminUserItem

router = APIRouter()


@router.get("/metrics", response_model=AdminMetricsResponse)
def get_admin_metrics(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    active_subs = db.query(Subscription).filter(Subscription.status == "active", Subscription.plan_tier != "free").count()
    total_interviews = db.query(Interview).count()
    total_resumes = db.query(Resume).count()
    mrr = active_subs * 19.99

    metrics = [
        {"title": "Total Users", "value": str(total_users), "change": "+18.2%", "trend": "up"},
        {"title": "Active Pro Subscriptions", "value": str(active_subs), "change": "+24.5%", "trend": "up"},
        {"title": "Interviews Conducted", "value": str(total_interviews), "change": "+32.0%", "trend": "up"},
        {"title": "Resumes Parsed", "value": str(total_resumes), "change": "+14.8%", "trend": "up"},
        {"title": "Estimated MRR", "value": f"${mrr:,.2f}", "change": "+21.4%", "trend": "up"}
    ]

    return {
        "total_users": total_users,
        "active_subscriptions": active_subs,
        "total_interviews_conducted": total_interviews,
        "total_resumes_analyzed": total_resumes,
        "mrr_usd": round(mrr, 2),
        "system_metrics": metrics
    }


@router.get("/users")
def get_all_users(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).all()
    results = []
    for u in users:
        sub = db.query(Subscription).filter(Subscription.user_id == u.id, Subscription.status == "active").first()
        interviews = db.query(Interview).filter(Interview.user_id == u.id).all()
        completed = [i for i in interviews if i.overall_score is not None]
        avg = round(sum(i.overall_score for i in completed) / len(completed), 1) if completed else 0.0

        results.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "target_role": u.profile.target_role if u.profile else "General",
            "subscription_tier": sub.plan_tier if sub else "free",
            "total_interviews": len(interviews),
            "avg_score": avg,
            "is_active": u.is_active,
            "created_at": u.created_at
        })
    return results


@router.get("/subscriptions")
def get_all_subscriptions(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    subs = db.query(Subscription).all()
    results = []
    for s in subs:
        results.append({
            "id": s.id,
            "user_id": s.user_id,
            "user_email": s.user.email if s.user else "unknown",
            "plan_tier": s.plan_tier,
            "status": s.status,
            "provider": s.provider,
            "start_date": s.start_date,
            "end_date": s.end_date
        })
    return results


@router.put("/users/{user_id}/toggle-status")
def toggle_user_status(
    user_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User active status set to {user.is_active}"}
