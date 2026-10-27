from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel


class PlanFeature(BaseModel):
    name: str
    included_in_free: bool
    included_in_pro: bool


class SubscriptionPlan(BaseModel):
    id: str
    name: str
    price: float
    currency: str
    billing_period: str
    features: List[str]
    is_popular: bool = False
    play_store_product_id: str


class UpgradeRequest(BaseModel):
    plan_tier: str  # "pro_monthly", "pro_annual"
    provider: str = "google_play"
    purchase_token: Optional[str] = None
    package_name: Optional[str] = "com.interclue.app"
    product_id: Optional[str] = "interclue_pro_monthly"


class SubscriptionStatusResponse(BaseModel):
    plan_tier: str
    status: str
    is_active: bool
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    daily_interviews_used: int
    daily_interviews_limit: int
    can_use_voice: bool
    can_use_resume: bool
