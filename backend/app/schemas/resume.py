from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class ResumeAnalysisResponse(BaseModel):
    id: int
    filename: str
    ats_score: float = Field(..., ge=0, le=100)
    candidate_name: Optional[str] = None
    contact_email: Optional[str] = None
    detected_role: Optional[str] = None
    parsed_skills: List[str] = []
    strengths: List[str] = []
    weaknesses: List[str] = []
    suggestions: List[str] = []
    generated_questions: List[str] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResumeUploadResponse(BaseModel):
    message: str
    resume: ResumeAnalysisResponse
