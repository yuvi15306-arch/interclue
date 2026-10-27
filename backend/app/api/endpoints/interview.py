from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.api.endpoints.auth import get_current_user
from app.models.user import User, Profile
from app.models.interview import Interview, Question, Response, Score
from app.models.subscription import Subscription
from app.schemas.interview import (
    InterviewStartRequest,
    InterviewDetailResponse,
    InterviewSummaryItem,
    QuestionResponse,
    AnswerSubmitRequest,
    EvaluationResponse,
    TranscriptionResponse
)
from app.services.gemini_service import gemini_service, resolve_question_category
from app.services.stt_service import stt_service

router = APIRouter()


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio_answer(
    audio: UploadFile = File(...),
    provider: str = Form("auto"),
):
    """
    Transcribe spoken candidate interview response using speech-to-text engines
    (Google Gemini, Deepgram, Whisper, AssemblyAI, or intelligent voice emulation).
    """
    audio_data = await audio.read()
    if not audio_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No audio data provided in request"
        )

    content_type = audio.content_type or "audio/webm"
    result = await stt_service.transcribe(
        audio_data=audio_data,
        provider=provider,
        audio_format=content_type
    )
    return result


@router.post("/start", response_model=InterviewDetailResponse, status_code=status.HTTP_201_CREATED)
def start_interview(
    req: InterviewStartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check subscription daily limits for free tier
    sub = db.query(Subscription).filter(Subscription.user_id == current_user.id, Subscription.status == "active").first()
    plan_tier = sub.plan_tier if sub else "free"

    if plan_tier == "free":
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        today_interviews = (
            db.query(Interview)
            .filter(Interview.user_id == current_user.id, Interview.created_at >= today_start)
            .count()
        )
        if today_interviews >= settings.FREE_INTERVIEWS_PER_DAY:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Daily free interview limit ({settings.FREE_INTERVIEWS_PER_DAY}) reached. Upgrade to Pro for unlimited interviews."
            )

    # Create interview session
    interview = Interview(
        user_id=current_user.id,
        role=req.role,
        difficulty=req.difficulty,
        duration_minutes=req.duration_minutes,
        interview_type=req.interview_type,
        status="in_progress",
        is_voice_mode=req.is_voice_mode,
        total_questions=req.total_questions,
        current_question_index=0
    )
    db.add(interview)
    db.flush()

    first_category = resolve_question_category(req.interview_type, index=0)
    first_q_data = gemini_service.generate_question(
        role=req.role,
        difficulty=req.difficulty,
        category=first_category,
        interview_type=req.interview_type,
        previous_questions=[]
    )

    first_question = Question(
        interview_id=interview.id,
        question_order=1,
        question_text=first_q_data.get("question_text"),
        category=first_q_data.get("category", "Technical"),
        role=req.role,
        difficulty=req.difficulty,
        expected_key_points=first_q_data.get("expected_key_points", [])
    )
    db.add(first_question)
    db.commit()
    db.refresh(interview)

    return interview


@router.post("/question", response_model=QuestionResponse)
def generate_next_question(
    interview_id: int,
    category: str = "Technical",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(Interview.id == interview_id, Interview.user_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")

    existing_questions = db.query(Question).filter(Question.interview_id == interview.id).all()
    prev_texts = [q.question_text for q in existing_questions]
    order = len(existing_questions) + 1

    locked_category = resolve_question_category(interview.interview_type, index=order - 1, requested=category)
    q_data = gemini_service.generate_question(
        role=interview.role,
        difficulty=interview.difficulty,
        category=locked_category,
        interview_type=interview.interview_type,
        previous_questions=prev_texts
    )

    new_q = Question(
        interview_id=interview.id,
        question_order=order,
        question_text=q_data["question_text"],
        category=q_data.get("category", locked_category),
        role=interview.role,
        difficulty=interview.difficulty,
        expected_key_points=q_data.get("expected_key_points", [])
    )
    db.add(new_q)
    db.commit()
    db.refresh(new_q)

    return new_q


@router.post("/evaluate", response_model=EvaluationResponse)
def evaluate_candidate_answer(
    req: AnswerSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(Interview.id == req.interview_id, Interview.user_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")

    question = db.query(Question).filter(Question.id == req.question_id, Question.interview_id == interview.id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    # Save or update candidate response
    existing_resp = db.query(Response).filter(Response.question_id == question.id).first()
    if existing_resp:
        existing_resp.answer_text = req.answer_text
        existing_resp.audio_url = req.audio_url
        existing_resp.duration_seconds = req.duration_seconds or 0
        existing_resp.transcription_provider = req.transcription_provider
        response_obj = existing_resp
    else:
        response_obj = Response(
            interview_id=interview.id,
            question_id=question.id,
            user_id=current_user.id,
            answer_text=req.answer_text,
            audio_url=req.audio_url,
            duration_seconds=req.duration_seconds or 0,
            transcription_provider=req.transcription_provider
        )
        db.add(response_obj)
        db.flush()

    # AI Evaluation using Gemini prompt
    eval_result = gemini_service.evaluate_response(
        question_text=question.question_text,
        answer_text=req.answer_text,
        role=interview.role,
        difficulty=interview.difficulty,
        category=question.category
    )

    # Save Score
    score_obj = db.query(Score).filter(Score.response_id == response_obj.id).first()
    if not score_obj:
        score_obj = Score(
            response_id=response_obj.id,
            interview_id=interview.id,
            technical_score=eval_result["technical_score"],
            communication_score=eval_result["communication_score"],
            confidence_score=eval_result["confidence_score"],
            clarity_score=eval_result["clarity_score"],
            overall_score=eval_result["overall_score"],
            strengths=eval_result["strengths"],
            weaknesses=eval_result["weaknesses"],
            suggestions=eval_result["suggestions"]
        )
        db.add(score_obj)
    else:
        score_obj.technical_score = eval_result["technical_score"]
        score_obj.communication_score = eval_result["communication_score"]
        score_obj.confidence_score = eval_result["confidence_score"]
        score_obj.clarity_score = eval_result["clarity_score"]
        score_obj.overall_score = eval_result["overall_score"]
        score_obj.strengths = eval_result["strengths"]
        score_obj.weaknesses = eval_result["weaknesses"]
        score_obj.suggestions = eval_result["suggestions"]

    # Increment interview progress
    interview.current_question_index += 1
    next_question = None
    is_completed = False

    if interview.current_question_index >= interview.total_questions:
        # Complete the interview
        interview.status = "completed"
        interview.completed_at = datetime.now(timezone.utc)
        is_completed = True

        # Calculate average overall score
        all_scores = db.query(Score).filter(Score.interview_id == interview.id).all()
        if all_scores:
            interview.overall_score = round(sum(s.overall_score for s in all_scores) / len(all_scores), 1)

        # Update user streak
        if current_user.profile:
            current_user.profile.current_streak = (current_user.profile.current_streak or 0) + 1
            if current_user.profile.current_streak > (current_user.profile.longest_streak or 0):
                current_user.profile.longest_streak = current_user.profile.current_streak
            current_user.profile.last_interview_at = datetime.now(timezone.utc)
    else:
        cat = resolve_question_category(interview.interview_type, index=interview.current_question_index)
        all_q = db.query(Question).filter(Question.interview_id == interview.id).all()
        q_texts = [q.question_text for q in all_q]

        next_q_data = gemini_service.generate_question(
            role=interview.role,
            difficulty=interview.difficulty,
            category=cat,
            interview_type=interview.interview_type,
            previous_questions=q_texts
        )

        next_question_obj = Question(
            interview_id=interview.id,
            question_order=interview.current_question_index + 1,
            question_text=next_q_data["question_text"],
            category=next_q_data.get("category", cat),
            role=interview.role,
            difficulty=interview.difficulty,
            expected_key_points=next_q_data.get("expected_key_points", [])
        )
        db.add(next_question_obj)
        db.flush()
        next_question = next_question_obj

    db.commit()

    return {
        "technical_score": eval_result["technical_score"],
        "communication_score": eval_result["communication_score"],
        "confidence_score": eval_result["confidence_score"],
        "clarity_score": eval_result["clarity_score"],
        "overall_score": eval_result["overall_score"],
        "strengths": eval_result["strengths"],
        "weaknesses": eval_result["weaknesses"],
        "suggestions": eval_result["suggestions"],
        "response_id": response_obj.id,
        "next_question": next_question,
        "is_completed": is_completed
    }


@router.post("/refresh-question", response_model=QuestionResponse)
def refresh_current_question(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Replace the current unanswered question with a new Gemini question of the same interview type."""
    interview = db.query(Interview).filter(Interview.id == interview_id, Interview.user_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    if interview.status != "in_progress":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Interview is not in progress")

    current_q = (
        db.query(Question)
        .filter(Question.interview_id == interview.id)
        .order_by(Question.question_order.desc())
        .first()
    )
    if not current_q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No question to refresh")

    existing_resp = db.query(Response).filter(Response.question_id == current_q.id).first()
    if existing_resp:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current question already answered")

    all_q = db.query(Question).filter(Question.interview_id == interview.id).all()
    q_texts = [q.question_text for q in all_q]
    cat = resolve_question_category(interview.interview_type, index=interview.current_question_index)

    q_data = gemini_service.generate_question(
        role=interview.role,
        difficulty=interview.difficulty,
        category=cat,
        interview_type=interview.interview_type,
        previous_questions=q_texts
    )
    current_q.question_text = q_data["question_text"]
    current_q.category = q_data.get("category", cat)
    current_q.expected_key_points = q_data.get("expected_key_points", [])
    db.commit()
    db.refresh(current_q)
    return current_q


@router.get("/history", response_model=List[InterviewSummaryItem])
def get_user_interviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interviews = (
        db.query(Interview)
        .filter(Interview.user_id == current_user.id)
        .order_by(Interview.created_at.desc())
        .all()
    )
    return interviews


@router.get("/{interview_id}", response_model=InterviewDetailResponse)
def get_interview_detail(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = (
        db.query(Interview)
        .filter(Interview.id == interview_id, Interview.user_id == current_user.id)
        .first()
    )
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    return interview
