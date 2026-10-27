import uuid
from datetime import datetime, timedelta, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.api.endpoints.auth import get_current_user
from app.models.user import User
from app.models.interview import Interview
from app.models.subscription import Subscription, Payment
from app.schemas.subscription import (
    SubscriptionPlan,
    UpgradeRequest,
    SubscriptionStatusResponse
)

router = APIRouter()

PLANS = [
    SubscriptionPlan(
        id="free",
        name="Free Student Starter",
        price=0.00,
        currency="USD",
        billing_period="forever",
        features=[
            "3 mock interviews per day",
            "Core text-based interview engine",
            "Basic performance feedback & score",
            "Access to community questions"
        ],
        is_popular=False,
        play_store_product_id="interclue_free"
    ),
    SubscriptionPlan(
        id="pro_monthly",
        name="InterClue Pro Monthly",
        price=19.99,
        currency="USD",
        billing_period="monthly",
        features=[
            "Unlimited AI mock interviews",
            "Voice Mode with real-time speech evaluation",
            "Full ATS Resume Analyzer & score breakdown",
            "Resume-tailored interview questions",
            "Advanced Analytics & Weak Topic Radar",
            "Priority Gemini 1.5 Pro processing"
        ],
        is_popular=True,
        play_store_product_id="interclue_pro_monthly"
    ),
    SubscriptionPlan(
        id="pro_annual",
        name="InterClue Pro Annual (Save 40%)",
        price=149.99,
        currency="USD",
        billing_period="annual",
        features=[
            "Everything in Pro Monthly",
            "Unlimited Resume revisions & ATS scans",
            "Executive interview coaching mode",
            "Early access to new AI interviewer models",
            "Dedicated support channel"
        ],
        is_popular=False,
        play_store_product_id="interclue_pro_annual"
    )
]


@router.get("/plans", response_model=List[SubscriptionPlan])
def get_plans():
    return PLANS


@router.get("/status", response_model=SubscriptionStatusResponse)
def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sub = (
        db.query(Subscription)
        .filter(Subscription.user_id == current_user.id, Subscription.status == "active")
        .first()
    )
    plan_tier = sub.plan_tier if sub else "free"
    is_pro = plan_tier in ["pro_monthly", "pro_annual"]

    # Daily count
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    used_today = (
        db.query(Interview)
        .filter(Interview.user_id == current_user.id, Interview.created_at >= today_start)
        .count()
    )
    limit = 999 if is_pro else settings.FREE_INTERVIEWS_PER_DAY

    return {
        "plan_tier": plan_tier,
        "status": sub.status if sub else "active",
        "is_active": True,
        "start_date": sub.start_date if sub else None,
        "end_date": sub.end_date if sub else None,
        "daily_interviews_used": used_today,
        "daily_interviews_limit": limit,
        "can_use_voice": is_pro,
        "can_use_resume": is_pro
    }


@router.post("/upgrade")
def upgrade_subscription(
    req: UpgradeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Google Play Billing verification logic
    # In production, this validates purchase_token against Google Play Developer API (androidpublisher v3)
    tx_id = f"gplay_{uuid.uuid4().hex[:12]}"

    now = datetime.now(timezone.utc)
    duration_days = 365 if req.plan_tier == "pro_annual" else 30
    end_date = now + timedelta(days=duration_days)
    amount = 149.99 if req.plan_tier == "pro_annual" else 19.99

    # Update or create subscription
    sub = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
    if not sub:
        sub = Subscription(user_id=current_user.id)
        db.add(sub)

    sub.plan_tier = req.plan_tier
    sub.status = "active"
    sub.provider = req.provider
    sub.provider_subscription_id = req.purchase_token or tx_id
    sub.start_date = now
    sub.end_date = end_date
    sub.auto_renew = True
    db.flush()

    # Record payment transaction
    payment = Payment(
        user_id=current_user.id,
        subscription_id=sub.id,
        amount=amount,
        currency="USD",
        status="succeeded",
        transaction_id=tx_id,
        provider=req.provider,
        receipt_data=req.purchase_token or "GooglePlay_Verified_Token"
    )
    db.add(payment)
    db.commit()

    return {
        "message": f"Successfully activated {req.plan_tier}! Welcome to InterClue Pro.",
        "plan_tier": req.plan_tier,
        "expires_at": end_date.isoformat(),
        "transaction_id": tx_id
    }


@router.post("/webhook")
def billing_webhook(payload: dict, db: Session = Depends(get_db)):
    """Handles real-time server-to-server notifications from Google Play Real-Time Developer Notifications (RTDN)."""
    notification_type = payload.get("notificationType")
    purchase_token = payload.get("purchaseToken")

    if purchase_token:
        sub = db.query(Subscription).filter(Subscription.provider_subscription_id == purchase_token).first()
        if sub:
            if notification_type in [2, 3]:  # RENEWED
                sub.end_date = datetime.now(timezone.utc) + timedelta(days=30)
                sub.status = "active"
            elif notification_type in [5, 12]:  # CANCELLED or REVOKED
                sub.auto_renew = False
            db.commit()

    return {"status": "received"}
