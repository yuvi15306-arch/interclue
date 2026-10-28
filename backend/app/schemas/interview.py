from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class InterviewStartRequest(BaseModel):
    role: str = Field(..., json_schema_extra={"example": "Frontend Developer"})
    difficulty: str = Field(default="Junior", json_schema_extra={"example": "Junior"})
    duration_minutes: int = Field(default=15, json_schema_extra={"example": 15})
    interview_type: str = Field(default="Mixed", json_schema_extra={"example": "Technical"})
    is_voice_mode: bool = Field(default=False)
    total_questions: int = Field(default=5, ge=1, le=10)


class QuestionResponse(BaseModel):
    id: int
    interview_id: int
    question_order: int
    question_text: str
    category: str
    role: str
    difficulty: str

    model_config = ConfigDict(from_attributes=True)


class AnswerSubmitRequest(BaseModel):
    interview_id: int
    question_id: int
    answer_text: str
    audio_url: Optional[str] = None
    duration_seconds: Optional[int] = 0
    transcription_provider: Optional[str] = None


class EvaluationResponse(BaseModel):
    technical_score: float = Field(..., ge=0, le=10)
    communication_score: float = Field(..., ge=0, le=10)
    confidence_score: float = Field(..., ge=0, le=10)
    clarity_score: float = Field(..., ge=0, le=10)
    overall_score: float = Field(..., ge=0, le=10)
    is_correct: Optional[bool] = None
    accuracy_level: Optional[str] = None
    feedback_summary: Optional[str] = None
    strengths: List[str]
    weaknesses: List[str]
    corrections_and_misconceptions: Optional[List[str]] = []
    ideal_answer: Optional[str] = None
    suggestions: List[str]
    response_id: Optional[int] = None
    next_question: Optional[QuestionResponse] = None
    is_completed: bool = False


class InterviewDetailResponse(BaseModel):
    id: int
    role: str
    difficulty: str
    duration_minutes: int
    interview_type: str
    status: str
    is_voice_mode: bool
    total_questions: int
    current_question_index: int
    overall_score: Optional[float] = None
    feedback_summary: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    questions: List[QuestionResponse] = []

    model_config = ConfigDict(from_attributes=True)


class InterviewSummaryItem(BaseModel):
    id: int
    role: str
    difficulty: str
    interview_type: str
    status: str
    overall_score: Optional[float] = None
    total_questions: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TranscriptionResponse(BaseModel):
    text: str
    confidence: float = 0.95
    provider: str
    duration_seconds: Optional[float] = None

