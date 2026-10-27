# InterClue API Documentation

FastAPI provides interactive Swagger documentation automatically at `http://localhost:8000/docs`.

---

## 1. Authentication Endpoints

### `POST /auth/register`
Creates a candidate account and initial target profile.
- **Request Body**:
  ```json
  {
    "email": "student@example.com",
    "password": "SecurePassword123!",
    "full_name": "Jordan Smith",
    "target_role": "Full Stack Developer",
    "experience_level": "Junior",
    "interview_type": "Mixed"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": { ... }
  }
  ```

### `POST /auth/login`
- **Request Body**:
  ```json
  {
    "email": "student@example.com",
    "password": "SecurePassword123!"
  }
  ```

### `POST /auth/google`
- **Request Body**:
  ```json
  {
    "id_token": "google_token_here",
    "email": "student@gmail.com",
    "full_name": "Jordan Smith"
  }
  ```

### `POST /auth/refresh`
- **Request Body**: `{"refresh_token": "..."}`

### `GET /auth/me`
Requires `Authorization: Bearer <access_token>`. Returns user details and subscription status.

---

## 2. Mock Interview Engine Endpoints

### `POST /interview/start`
Starts a tailored mock interview.
- **Request Body**:
  ```json
  {
    "role": "Frontend Developer",
    "difficulty": "Junior",
    "duration_minutes": 15,
    "interview_type": "Technical",
    "is_voice_mode": false,
    "total_questions": 5
  }
  ```
- **Response**: `201 Created`
  Returns interview session and the first generated question.

### `POST /interview/evaluate`
Submits candidate answer and returns multi-dimensional AI scores.
- **Request Body**:
  ```json
  {
    "interview_id": 1,
    "question_id": 1,
    "answer_text": "Virtual DOM minimizes writes through batch reconciliation...",
    "duration_seconds": 45
  }
  ```
- **Response**:
  ```json
  {
    "technical_score": 8.5,
    "communication_score": 8.0,
    "confidence_score": 7.5,
    "clarity_score": 8.0,
    "overall_score": 8.0,
    "strengths": ["Clear technical explanation", "Accurate diffing description"],
    "weaknesses": ["Could mention key props impact"],
    "suggestions": ["Mention Fiber concurrent mode"],
    "response_id": 1,
    "next_question": { ... },
    "is_completed": false
  }
  ```

### `GET /interview/{id}`
Retrieves complete interview details, past answers, and evaluations.

---

## 3. Resume Analyzer Endpoints

### `POST /resume/upload`
Uploads PDF resume and produces full ATS score and tailored questions.
- **Form Data**: `file: resume.pdf`, `target_role: Frontend Developer`
- **Response**:
  ```json
  {
    "message": "Resume successfully analyzed by InterClue ATS Engine",
    "resume": {
      "ats_score": 84.5,
      "parsed_skills": ["React", "TypeScript", "FastAPI"],
      "strengths": ["Contains strong technical keywords"],
      "weaknesses": ["Needs more quantifiable business impact metrics"],
      "suggestions": ["Add percentage improvements to projects"],
      "generated_questions": [
        "How did you architect the state management for your React project?"
      ]
    }
  }
  ```

---

## 4. Analytics & Dashboard Endpoints

### `GET /dashboard`
Returns total completed interviews, average score, streak, weekly progress chart, recent interviews, and daily limits.

### `GET /analytics`
Returns spider/radar metrics breakdown, topic mastery, and score trends.

---

## 5. Subscriptions Endpoints

### `GET /subscriptions/plans`
Returns available Free & Pro tiers.

### `POST /subscriptions/upgrade`
Verifies Google Play token and upgrades user to Pro.
