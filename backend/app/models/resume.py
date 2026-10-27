from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=True)
    file_size_kb = Column(Float, default=0.0)
    raw_text = Column(Text, nullable=True)
    ats_score = Column(Float, default=0.0)  # 0 to 100
    candidate_name = Column(String(150), nullable=True)
    contact_email = Column(String(150), nullable=True)
    detected_role = Column(String(100), nullable=True)
    parsed_skills = Column(JSON, nullable=True)         # list of detected skills
    strengths = Column(JSON, nullable=True)             # list of strong ATS factors
    weaknesses = Column(JSON, nullable=True)            # missing sections/keywords
    suggestions = Column(JSON, nullable=True)           # actionable tips
    generated_questions = Column(JSON, nullable=True)   # tailored interview questions based on resume
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="resumes")
