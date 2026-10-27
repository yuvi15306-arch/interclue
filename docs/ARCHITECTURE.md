# InterClue System Architecture

> **"Practice Smarter. Interview Better."**

InterClue is an enterprise-grade AI-powered Interview Coach platform designed for students, job seekers, and career switchers.

---

## 1. High-Level Architecture Diagram

```
+---------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                    |
|   React Native Mobile App (Expo / TypeScript)                                   |
|   - Onboarding & Role Selection                                                 |
|   - Real-time Mock Interview Engine (Voice & Text)                              |
|   - ATS Resume Analyzer & Score Breakdown                                       |
|   - Performance Trends & Radar Analytics                                        |
|   - Google Play Billing & Paywall                                               |
+---------------------------------------+-----------------------------------------+
                                        |  HTTPS / JWT Bearer Tokens
                                        v
+---------------------------------------------------------------------------------+
|                                 BACKEND LAYER                                   |
|   FastAPI REST Service (Python 3.10+)                                           |
|   - /auth (Registration, Login, Refresh, Google One-Tap)                         |
|   - /interview (Adaptive Question Gen, Timer, Scoring Engine)                   |
|   - /resume (PDF Parsing, ATS Scoring, Question Extraction)                     |
|   - /analytics & /dashboard (Radar scores, streaks, weekly progress)            |
|   - /subscriptions (Google Play Billing verification & webhooks)                |
|   - /admin (User management, subscription MRR, system metrics)                  |
+-------------------+-------------------+-------------------+---------------------+
                    |                   |                   |
                    v                   v                   v
+-----------------------+ +-----------------------+ +-----------------------------+
|    AI & VOICE LAYER   | |    DATABASE LAYER     | |        CACHE LAYER          |
| - Google Gemini 1.5   | | - Neon PostgreSQL     | | - Redis (Managed)           |
|   (Pro / Flash)       | |   (or local SQLite)   | | - In-memory TTL Fallback    |
| - STT Engine          | | - SQLAlchemy ORM      | | - Rate limiting & tokens    |
|   (Deepgram / Whisper | | - Connection Pooling  | |                             |
|    / AssemblyAI)      | |                       | |                             |
+-----------------------+ +-----------------------+ +-----------------------------+
```

---

## 2. Core Modules & Data Flow

### 2.1 Mock Interview & Evaluation Flow
1. **Candidate Setup**: Candidate picks target role (e.g. *Frontend Developer*), difficulty (*Junior, Mid, Senior*), and category (*Technical, Behavioral, HR, Situational*).
2. **AI Question Generation**: Gemini crafts tailored scenario questions aligned with the candidate's chosen seniority and historical interview questions.
3. **Response Submission**:
   - In **Text Mode**: Answer is submitted via structured JSON.
   - In **Voice Mode**: Audio is streamed or uploaded, transcribed through Deepgram / Whisper / AssemblyAI, and presented in real time.
4. **Structured Multi-Dimensional Evaluation**:
   Gemini evaluates the answer across five dimensions (0 to 10):
   - `technical_score`
   - `communication_score`
   - `confidence_score`
   - `clarity_score`
   - `overall_score`
   Along with actionable `strengths`, `weaknesses`, and `suggestions`.
5. **State Progression**: Updates student streak, recalculates radar averages, and yields either the subsequent question or the final summary report.

### 2.2 Resume ATS Analyzer Flow
1. Candidate uploads a PDF resume.
2. `pypdf` extracts raw text and contact details.
3. ATS analyzer verifies section headers (Experience, Education, Skills, Projects), extracts high-demand keywords, and checks for quantifiable metrics.
4. Gemini inspects the experience bullets and derives 5 custom technical interview questions tailored specifically to the candidate's resume history.

---

## 3. Brand Identity & Design System

- **Primary Color**: `#2563EB` (Royal Blue - trust, capability, focus)
- **Secondary Color**: `#0F172A` (Deep Slate - modern dark surface)
- **Accent Color**: `#38BDF8` (Vibrant Sky Blue - highlights, active badges)
- **Neutral Backgrounds**: `#0B0F19` (Dark App Canvas), `#1E293B` (Cards), `#334155` (Borders)
- **Success & Rating**: `#10B981` (High Score), `#F59E0B` (Average), `#EF4444` (Needs Improvement)
