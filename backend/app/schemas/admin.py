from typing import List
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.auth import UserResponse


class SystemMetric(BaseModel):
    title: str
    value: str
    change: str
    trend: str


class AdminMetricsResponse(BaseModel):
    total_users: int
    active_subscriptions: int
    total_interviews_conducted: int
    total_resumes_analyzed: int
    mrr_usd: float
    system_metrics: List[SystemMetric]


class AdminUserItem(BaseModel):
    id: int
    email: str
    full_name: str
    target_role: str
    subscription_tier: str
    total_interviews: int
    avg_score: float
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminSubscriptionItem(BaseModel):
    id: int
    user_email: str
    plan_tier: str
    status: str
    provider: str
    start_date: datetime
    end_date: datetime
