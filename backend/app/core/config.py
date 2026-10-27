import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "InterClue"
    APP_TAGLINE: str = "Practice Smarter. Interview Better."
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "interclue-super-secret-key-production-ready-2026-secure-jwt")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for mobile session stability
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Database: Supports SQLite out-of-the-box or Neon/PostgreSQL in cloud
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./interclue.db")

    # Redis (Optional: falls back gracefully to in-memory TTL cache)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # Gemini API
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

    # Cloudinary for file storage (Resumes & Audio recordings)
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")

    # Speech to Text Providers
    DEEPGRAM_API_KEY: str = os.getenv("DEEPGRAM_API_KEY", "")
    WHISPER_API_KEY: str = os.getenv("WHISPER_API_KEY", "")
    ASSEMBLYAI_API_KEY: str = os.getenv("ASSEMBLYAI_API_KEY", "")

    # Subscription Limits
    FREE_INTERVIEWS_PER_DAY: int = 3
    FREE_QUESTION_BANK_PER_CATEGORY: int = 5
    QUESTIONS_PER_CATEGORY: int = 55

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8081",
        "http://localhost:19006",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8081",
        "http://127.0.0.1:19006",
        "https://interclue-frontend.vercel.app",
    ]

    _backend_env: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
    model_config = SettingsConfigDict(
        env_file=(_backend_env, ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow"
    )

    @property
    def sync_database_url(self) -> str:
        """Fix postgres:// protocol to postgresql:// for SQLAlchemy compatibility with Neon/Render."""
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url


settings = Settings()
