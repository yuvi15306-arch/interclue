# InterClue - AI-Powered Interview Coach 🚀

> **"Practice Smarter. Interview Better."**

InterClue is a production-ready SaaS mobile application engineered to empower students and job seekers to practice interviews, master communication skills, analyze resumes with ATS intelligence, and track interview performance trends.

---

## 🎨 Brand Identity

| Element | Specification |
|---|---|
| **App Name** | **InterClue** |
| **Tagline** | *"Practice Smarter. Interview Better."* |
| **Primary Color** | `#2563EB` (Royal Blue) |
| **Secondary Color** | `#0F172A` (Deep Slate) |
| **Accent Color** | `#38BDF8` (Sky Blue) |
| **Design Language** | Clean modern SaaS, mobile-first, student-focused, sleek dark mode |

---

## 🏗️ Technology Stack

### Frontend
- **Framework**: React Native with Expo SDK 52+
- **Language**: TypeScript throughout (strict mode, zero errors)
- **State Management**: Zustand stores (`useAuthStore`, `useInterviewStore`, `useResumeStore`)
- **Navigation**: Modern multi-tab & modal stack navigation
- **Components & Styling**: Mobile-first responsive layout with tokens, glassmorphic cards, and animated audio waveforms
- **Icons**: `@expo/vector-icons`

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **ORM & Database**: SQLAlchemy 2.0 with Neon PostgreSQL / SQLite zero-config fallback
- **Authentication**: JWT access & refresh tokens with bcrypt password hashing + Google Sign-In
- **AI Core**: Google Gemini 1.5 Pro & Flash with heuristic evaluation fallback
- **Speech-to-Text Architecture**: API-ready adapters for **Deepgram**, **Whisper**, and **AssemblyAI**
- **Caching**: Redis client wrapper with in-memory TTL cache fallback
- **Document Intelligence**: `pypdf` ATS resume scoring and keyword extraction engine
- **Billing**: Google Play Billing architecture & server webhook processor

---

## 📂 Project Structure

```
interclue/
├── backend/                      # Self-Contained FastAPI Backend & Microservices
│   ├── app/
│   │   ├── api/                  # RESTful API endpoints (Auth, Interviews, Resume, etc.)
│   │   ├── core/                 # Config, Database sessions, JWT Security, Cache
│   │   ├── models/               # SQLAlchemy DB Models (Users, Profiles, Interviews, etc.)
│   │   ├── schemas/              # Pydantic v2 validation models
│   │   └── services/             # Gemini AI, STT (Deepgram/Whisper), Resume ATS
│   ├── database/                 # Production Database DDL & Seeds
│   │   ├── schema.sql            # PostgreSQL DDL for Neon / RDS / Supabase
│   │   └── seeds.sql             # Demonstration seeds & realistic mock questions
│   ├── tests/                    # Pytest Backend Unit & Integration Tests
│   │   ├── conftest.py           # Database fixtures & TestClient
│   │   ├── test_admin.py         # Admin management tests
│   │   ├── test_auth.py          # User auth & token refresh tests
│   │   ├── test_dashboard.py     # Metrics & analytics tests
│   │   ├── test_interviews.py    # AI question generation & answer scoring tests
│   │   ├── test_question_bank.py # Question bank tests
│   │   ├── test_resume_analyzer.py # ATS parsing tests
│   │   └── test_subscriptions.py # Subscription & billing tests
│   ├── .env.example              # Environment variable template
│   ├── .gitignore                # Backend-specific ignore rules
│   ├── Dockerfile                # Standalone container definition
│   ├── main.py                   # Application entrypoint & auto-seeding
│   ├── Procfile                  # Process definition for Render / PaaS
│   ├── pytest.ini                # Backend pytest configuration
│   ├── render.yaml               # Render Blueprint service definition
│   ├── requirements.txt          # Python dependencies
│   └── runtime.txt               # Python runtime version (3.11.9)
│
├── frontend/                     # Self-Contained React Native Web & Mobile App (Expo)
│   ├── assets/                   # App icons, splash screens, and web icons
│   ├── src/
│   │   ├── components/           # Reusable UI (Header, MetricCard, RadarChart, AudioVisualizer)
│   │   ├── navigation/           # AppNavigator (Tabs + Interview Stack)
│   │   ├── screens/              # Onboarding, Dashboard, Interview Room, Resume Analyzer, etc.
│   │   ├── services/             # Axios API client & mock datasets
│   │   ├── store/                # Zustand reactive state stores
│   │   ├── theme/                # Brand tokens (#2563EB, #0F172A, #38BDF8)
│   │   └── types/                # TypeScript interfaces
│   ├── .env.example              # Frontend environment template (EXPO_PUBLIC_API_URL)
│   ├── .gitignore                # Frontend-specific ignore rules
│   ├── App.tsx                   # Main entrypoint component
│   ├── app.json                  # Expo app configuration
│   ├── index.ts                  # App registry entrypoint
│   ├── package.json              # Dependencies & scripts (start, web, build)
│   ├── tsconfig.json             # TypeScript configuration
│   └── vercel.json               # Vercel deployment configuration & static routing
│
├── docs/                         # Architectural Documentation & Deployment
│   ├── ARCHITECTURE.md           # High-level architecture & data flows
│   ├── API_DOCUMENTATION.md      # Detailed OpenAPI endpoint specs
│   ├── DEPLOYMENT_GUIDE.md       # Complete Vercel & Render deployment guide
│   └── MOBILE_SETUP_GUIDE.md     # EAS build & Google Play setup
│
├── .gitignore                    # Master root gitignore
├── docker-compose.yml            # Multi-container orchestration (FastAPI + PostgreSQL + Redis)
├── pytest.ini                    # Root pytest runner configuration
├── render.yaml                   # 1-Click Render Blueprint configuration
└── vercel.json                   # Root Vercel monorepo fallback configuration
```

---

## ⚡ Quick Start & Deployment Guide

### 1. Deploy Frontend to Vercel (1-Click)
- On [Vercel](https://vercel.com): **New Project** -> Select `interclue`.
- **Root Directory**: Select `frontend` (or leave at root; `vercel.json` handles both).
- **Environment Variable**: `EXPO_PUBLIC_API_URL=https://<your-backend>.onrender.com`.
- Deploy!

### 2. Deploy Backend to Render (1-Click)
- On [Render](https://render.com): **New + -> Blueprint** -> Connect `interclue` (reads root `render.yaml`).
- Alternatively, create a **Web Service** with **Root Directory** `backend` and command `uvicorn main:app --host 0.0.0.0 --port $PORT`.

### 3. Run Locally

```bash
# Backend
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run start       # Mobile / Expo Go
npm run web         # Local Web preview
npm run build       # Production static export to dist/

# Run Tests
pytest              # From root or inside backend/
```

---

## 🎯 10 Core Application Features

1. **User Onboarding**: Multi-role onboarding supporting 9 industry tracks (*Frontend, Backend, Full Stack, Java, Python, Data Analyst, Data Scientist, Product Manager, UI/UX Designer*) and experience tiers (*Beginner, Junior, Mid-Level, Senior*).
2. **Student Dashboard**: Live streak tracking, weekly activity column chart, average score KPI, strength areas, and target improvement recommendations.
3. **Mock Interview Engine**: Adaptive AI interviewer questioning flow. Generates scenario-driven questions across *Technical, Behavioral, HR, Aptitude,* and *Situational* categories.
4. **Answer Evaluation Engine**: Multi-dimensional grading returning:
   - Overall Score (out of 10)
   - Technical Knowledge Score
   - Communication Score
   - Confidence Score
   - Clarity Score
   - Specific strengths, weaknesses, and actionable suggestions.
5. **Voice Interview**: Real-time voice mode with animated audio waveform visualizer and speech-to-text adapters for **Deepgram**, **Whisper**, and **AssemblyAI**.
6. **Resume Analyzer**: ATS score calculator (0-100), keyword detection, weakness identification, and **5 tailored interview questions derived directly from the candidate's resume history**.
7. **Personalized Question Bank**: Searchable question directory with category filtering, bookmarking, and dynamic on-demand AI question generation.
8. **Competency Analytics**: Competency radar bars, topic mastery (strongest topics vs target weak topics), and 6-session score progression trends.
9. **Subscription System**: Free Starter (3 interviews/day) vs InterClue Pro ($19.99/mo) with Google Play Billing architecture and entitlement unlocks.
10. **Admin Panel**: Platform control dashboard with user directory, account status toggles, MRR metrics, and subscription management.

---

## 🔒 Environment Variables

See `backend/.env.example` for all configurable environment variables:
```env
APP_NAME=InterClue
SECRET_KEY=your-secret-key-for-jwt
DATABASE_URL=postgresql://user:password@ep-neon.us-east-2.aws.neon.tech/neondb?sslmode=require
REDIS_URL=redis://localhost:6379/0
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash
DEEPGRAM_API_KEY=your-deepgram-key
WHISPER_API_KEY=your-whisper-key
```

---

## 📄 License
MIT License. Built for students, career accelerators, and engineering candidates worldwide.
