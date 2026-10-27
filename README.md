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
├── backend/                  # FastAPI Enterprise Backend
│   ├── app/
│   │   ├── api/              # RESTful API endpoints
│   │   │   ├── endpoints/    # Auth, Interview, Resume, Question Bank, Analytics, Dashboard, Subscriptions, Admin
│   │   │   └── api_v1.py     # Master v1 router
│   │   ├── core/             # Config, Database sessions, JWT Security, Cache
│   │   ├── models/           # SQLAlchemy DB Models (Users, Profiles, Interviews, Questions, etc.)
│   │   ├── schemas/          # Pydantic v2 validation models
│   │   └── services/         # Gemini AI, STT (Deepgram/Whisper), Resume ATS, Analytics
│   ├── .env.example          # Environment variable template
│   ├── Dockerfile            # Container definition
│   ├── main.py               # Application entrypoint & auto-seeding
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # React Native Mobile App (Expo + TypeScript)
│   ├── src/
│   │   ├── components/       # Reusable UI: Header, MetricCard, RadarChart, WeeklyProgressChart, AudioVisualizer, Modals
│   │   ├── navigation/       # AppNavigator (Tabs + Interview Stack)
│   │   ├── screens/          # Onboarding, Dashboard, Interview Room, Evaluation Report, Resume Analyzer, Question Bank, Analytics, Subscriptions, Admin
│   │   ├── services/         # Axios API client & mock datasets
│   │   ├── store/            # Zustand reactive state stores
│   │   ├── theme/            # Brand tokens (#2563EB, #0F172A, #38BDF8)
│   │   └── types/            # TypeScript interfaces
│   ├── App.tsx               # Main mobile entrypoint
│   └── package.json          # Dependencies & scripts
│
├── database/                 # Production Database Scripts
│   ├── schema.sql            # PostgreSQL DDL for Neon / RDS / Supabase
│   └── seeds.sql             # Demonstration seeds & realistic mock questions
│
├── docs/                     # Architectural Documentation & Deployment
│   ├── ARCHITECTURE.md       # High-level architecture & data flows
│   ├── API_DOCUMENTATION.md  # Detailed OpenAPI endpoint specs
│   ├── DEPLOYMENT_GUIDE.md   # Deployment on Render, Railway, Neon, Cloudinary
│   └── MOBILE_SETUP_GUIDE.md # EAS build & Google Play setup
│
├── tests/                    # Backend Pytest Test Suite
│   ├── conftest.py           # Database fixtures
│   ├── test_auth.py          # User auth & token refresh tests
│   ├── test_interviews.py    # AI question generation & answer scoring tests
│   ├── test_resume_analyzer.py # ATS parsing tests
│   └── test_dashboard.py     # Metrics & analytics tests
│
├── docker-compose.yml        # Multi-container orchestration (FastAPI + PostgreSQL + Redis)
└── README.md                 # Complete documentation
```

---

## ⚡ Quick Start Guide

### 1. Run the Backend API

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate   # Windows
# source venv/bin/activate # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Start FastAPI development server
uvicorn main:app --reload --port 8000
```
- API is available at: `http://localhost:8000`
- Interactive Swagger documentation at: `http://localhost:8000/docs`
- Default demo credentials:
  - Student: `demo@interclue.ai` / `interclue123`
  - Admin: `admin@interclue.ai` / `admin123`

### 2. Run the Mobile App

```bash
# Navigate to frontend directory
cd frontend

# Install packages
npm install

# Start Expo development server
npm run start
```
- **Physical Phone**: Scan the QR code using the Expo Go mobile app.
- **Web Browser**: Press `w` in the terminal to open the web view at `http://localhost:8081`.
- **Android Emulator**: Press `a`.

### 3. Run Backend Automated Tests

```bash
# From repository root:
.\backend\venv\Scripts\pytest tests
```
*All 5 unit & integration test suites validate authentication, interview flows, ATS parsing, and dashboard metrics.*

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
