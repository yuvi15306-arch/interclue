from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(100), nullable=False)
    difficulty = Column(String(50), default="Junior")  # Beginner, Junior, Mid-Level, Senior
    duration_minutes = Column(Integer, default=15)
    interview_type = Column(String(50), default="Mixed")  # Technical, Behavioral, HR, Aptitude, Situational, Mixed
    status = Column(String(30), default="in_progress")  # in_progress, completed, abandoned
    is_voice_mode = Column(Boolean, default=False)
    total_questions = Column(Integer, default=5)
    current_question_index = Column(Integer, default=0)
    overall_score = Column(Float, nullable=True)
    feedback_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="interviews")
    questions = relationship("Question", back_populates="interview", cascade="all, delete-orphan", order_by="Question.question_order")
    responses = relationship("Response", back_populates="interview", cascade="all, delete-orphan")
    scores = relationship("Score", back_populates="interview", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False, index=True)
    question_order = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    category = Column(String(50), default="Technical")  # Technical, Behavioral, HR, Aptitude, Situational
    role = Column(String(100), nullable=False)
    difficulty = Column(String(50), default="Junior")
    expected_key_points = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    interview = relationship("Interview", back_populates="questions")
    response = relationship("Response", back_populates="question", uselist=False, cascade="all, delete-orphan")


class Response(Base):
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, unique=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    answer_text = Column(Text, nullable=False)
    audio_url = Column(String(500), nullable=True)
    duration_seconds = Column(Integer, default=0)
    transcription_provider = Column(String(50), nullable=True)  # Deepgram, Whisper, AssemblyAI
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    interview = relationship("Interview", back_populates="responses")
    question = relationship("Question", back_populates="response")
    score = relationship("Score", back_populates="response", uselist=False, cascade="all, delete-orphan")


class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True)
    response_id = Column(Integer, ForeignKey("responses.id", ondelete="CASCADE"), nullable=False, unique=True)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False, index=True)
    technical_score = Column(Float, nullable=False)   # 0 to 10
    communication_score = Column(Float, nullable=False) # 0 to 10
    confidence_score = Column(Float, nullable=False)    # 0 to 10
    clarity_score = Column(Float, nullable=False)       # 0 to 10
    overall_score = Column(Float, nullable=False)       # 0 to 10
    strengths = Column(JSON, nullable=False)            # list of strings
    weaknesses = Column(JSON, nullable=False)           # list of strings
    suggestions = Column(JSON, nullable=False)          # list of strings
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    response = relationship("Response", back_populates="score")
    interview = relationship("Interview", back_populates="scores")
