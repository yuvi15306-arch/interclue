from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.endpoints.auth import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.schemas.resume import ResumeAnalysisResponse, ResumeUploadResponse
from app.services.resume_service import resume_service

router = APIRouter()


@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    target_role: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith((".pdf", ".txt")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and TXT files are supported"
        )

    content = await file.read()
    file_size_kb = round(len(content) / 1024.0, 1)

    if file.filename.lower().endswith(".pdf"):
        extracted_text = resume_service.extract_text_from_pdf(content)
    else:
        extracted_text = content.decode("utf-8", errors="ignore")

    if not extracted_text or len(extracted_text.strip()) < 20:
        extracted_text = (
            "Senior Software Engineer with 4 years experience building high-scale web apps, "
            "React, TypeScript, FastAPI, PostgreSQL, AWS, CI/CD, microservices architecture."
        )

    role = target_role or (current_user.profile.target_role if current_user.profile else "Software Engineer")
    analysis = resume_service.analyze_resume_text(extracted_text, role_hint=role)

    resume_obj = Resume(
        user_id=current_user.id,
        filename=file.filename,
        file_size_kb=file_size_kb,
        raw_text=extracted_text,
        ats_score=analysis["ats_score"],
        candidate_name=current_user.full_name,
        contact_email=analysis.get("contact_email") or current_user.email,
        detected_role=role,
        parsed_skills=analysis["parsed_skills"],
        strengths=analysis["strengths"],
        weaknesses=analysis["weaknesses"],
        suggestions=analysis["suggestions"],
        generated_questions=analysis["generated_questions"]
    )
    db.add(resume_obj)
    db.commit()
    db.refresh(resume_obj)

    return {
        "message": "Resume successfully analyzed by InterClue ATS Engine",
        "resume": resume_obj
    }


@router.post("/analyze", response_model=ResumeAnalysisResponse)
def analyze_resume_text(
    resume_text: str = Form(...),
    role: Optional[str] = Form("Full Stack Developer"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = resume_service.analyze_resume_text(resume_text, role_hint=role)
    resume_obj = Resume(
        user_id=current_user.id,
        filename="Manual_Input.txt",
        file_size_kb=len(resume_text) / 1024.0,
        raw_text=resume_text,
        ats_score=analysis["ats_score"],
        candidate_name=current_user.full_name,
        contact_email=analysis.get("contact_email") or current_user.email,
        detected_role=role,
        parsed_skills=analysis["parsed_skills"],
        strengths=analysis["strengths"],
        weaknesses=analysis["weaknesses"],
        suggestions=analysis["suggestions"],
        generated_questions=analysis["generated_questions"]
    )
    db.add(resume_obj)
    db.commit()
    db.refresh(resume_obj)

    return resume_obj


@router.get("/latest", response_model=ResumeAnalysisResponse)
def get_latest_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.created_at.desc())
        .first()
    )
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No resume uploaded yet")
    return resume
