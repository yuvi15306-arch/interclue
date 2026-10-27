-- InterClue Production PostgreSQL Database Schema
-- Compatible with Neon PostgreSQL, Supabase, and AWS RDS

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    google_id VARCHAR(255) UNIQUE,
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    target_role VARCHAR(100) DEFAULT 'Full Stack Developer',
    experience_level VARCHAR(50) DEFAULT 'Junior',
    interview_type_preference VARCHAR(50) DEFAULT 'Mixed',
    bio TEXT,
    target_company VARCHAR(150),
    weekly_interview_goal INTEGER DEFAULT 5,
    current_streak INTEGER DEFAULT 1,
    longest_streak INTEGER DEFAULT 1,
    last_interview_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS interviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'Junior',
    duration_minutes INTEGER DEFAULT 15,
    interview_type VARCHAR(50) DEFAULT 'Mixed',
    status VARCHAR(30) DEFAULT 'in_progress',
    is_voice_mode BOOLEAN DEFAULT FALSE,
    total_questions INTEGER DEFAULT 5,
    current_question_index INTEGER DEFAULT 0,
    overall_score FLOAT,
    feedback_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_interviews_user ON interviews(user_id);

CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER REFERENCES interviews(id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'Technical',
    role VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'Junior',
    expected_key_points JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_questions_interview ON questions(interview_id);

CREATE TABLE IF NOT EXISTS responses (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER REFERENCES interviews(id) ON DELETE CASCADE,
    question_id INTEGER UNIQUE REFERENCES questions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    audio_url VARCHAR(500),
    duration_seconds INTEGER DEFAULT 0,
    transcription_provider VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_responses_interview ON responses(interview_id);

CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    response_id INTEGER UNIQUE REFERENCES responses(id) ON DELETE CASCADE,
    interview_id INTEGER REFERENCES interviews(id) ON DELETE CASCADE,
    technical_score FLOAT NOT NULL,
    communication_score FLOAT NOT NULL,
    confidence_score FLOAT NOT NULL,
    clarity_score FLOAT NOT NULL,
    overall_score FLOAT NOT NULL,
    strengths JSONB NOT NULL,
    weaknesses JSONB NOT NULL,
    suggestions JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scores_interview ON scores(interview_id);

CREATE TABLE IF NOT EXISTS resumes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_url VARCHAR(500),
    file_size_kb FLOAT DEFAULT 0.0,
    raw_text TEXT,
    ats_score FLOAT DEFAULT 0.0,
    candidate_name VARCHAR(150),
    contact_email VARCHAR(150),
    detected_role VARCHAR(100),
    parsed_skills JSONB,
    strengths JSONB,
    weaknesses JSONB,
    suggestions JSONB,
    generated_questions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resumes_user ON resumes(user_id);

CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_tier VARCHAR(50) DEFAULT 'free',
    status VARCHAR(50) DEFAULT 'active',
    provider VARCHAR(50) DEFAULT 'google_play',
    provider_subscription_id VARCHAR(255),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount FLOAT NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'succeeded',
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    provider VARCHAR(50) DEFAULT 'google_play',
    receipt_data TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
