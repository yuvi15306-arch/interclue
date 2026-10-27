from typing import List, Optional, Dict
from datetime import datetime
from pydantic import BaseModel
from app.schemas.interview import InterviewSummaryItem


class WeeklyProgressItem(BaseModel):
    day: str          # "Mon", "Tue", "Wed", etc.
    date: str         # "2026-10-20"
    interviews_count: int
    avg_score: float


class MetricBreakdown(BaseModel):
    technical_avg: float
    communication_avg: float
    confidence_avg: float
    clarity_avg: float


class TopicItem(BaseModel):
    topic: str
    category: str
    score: float
    interviews_count: int


class DashboardResponse(BaseModel):
    total_interviews: int
    average_score: float
    current_streak: int
    target_role: str
    weekly_goal: int
    weekly_completed: int
    strength_areas: List[str]
    improvement_areas: List[str]
    weekly_progress: List[WeeklyProgressItem]
    recent_interviews: List[InterviewSummaryItem]
    metrics_breakdown: MetricBreakdown
    subscription_tier: str
    remaining_daily_interviews: int


class AnalyticsResponse(BaseModel):
    total_interviews: int
    average_score: float
    current_streak: int
    longest_streak: int
    metrics_radar: MetricBreakdown
    strong_topics: List[TopicItem]
    weak_topics: List[TopicItem]
    score_trend: List[Dict[str, float]]
    interview_consistency_percentage: float
