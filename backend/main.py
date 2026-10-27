import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api.api_v1 import api_router
from app.models.user import User, Profile
from app.models.subscription import Subscription
from app.core.security import get_password_hash

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def init_db_seeds():
    """Ensure database tables and initial demonstration seeds exist."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if demo candidate exists
        demo_user = db.query(User).filter(User.email == "demo@interclue.ai").first()
        if not demo_user:
            logger.info("Seeding initial demo student and admin users...")
            demo_user = User(
                email="demo@interclue.ai",
                hashed_password=get_password_hash("interclue123"),
                full_name="Alex Rivera",
                is_active=True,
                is_admin=False
            )
            db.add(demo_user)
            db.flush()

            demo_profile = Profile(
                user_id=demo_user.id,
                target_role="Full Stack Developer",
                experience_level="Junior",
                interview_type_preference="Mixed",
                current_streak=4,
                longest_streak=7,
                weekly_interview_goal=5
            )
            db.add(demo_profile)

            # Pro subscription for demo
            demo_sub = Subscription(
                user_id=demo_user.id,
                plan_tier="pro_monthly",
                status="active"
            )
            db.add(demo_sub)

            # Create an admin account
            admin_user = User(
                email="admin@interclue.ai",
                hashed_password=get_password_hash("admin123"),
                full_name="InterClue Admin",
                is_active=True,
                is_admin=True
            )
            db.add(admin_user)
            db.flush()

            admin_profile = Profile(
                user_id=admin_user.id,
                target_role="Product Manager",
                experience_level="Senior"
            )
            db.add(admin_profile)

            db.commit()
            logger.info("Default seed users created: demo@interclue.ai (interclue123) and admin@interclue.ai (admin123)")
    except Exception as e:
        logger.error(f"Error during database initialization: {e}")
        db.rollback()
    finally:
        db.close()

# Auto-create tables on import
Base.metadata.create_all(bind=engine)



@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME} Backend Engine...")
    init_db_seeds()
    yield
    logger.info(f"Shutting down {settings.APP_NAME}...")


app = FastAPI(
    title=settings.APP_NAME,
    description=f"{settings.APP_TAGLINE} - Production-Ready AI Interview Coach Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers under both /api/v1 and root prefixes for prompt exact compliance
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(api_router, prefix="")


@app.get("/", tags=["Health"])
def root_info():
    return {
        "app": settings.APP_NAME,
        "tagline": settings.APP_TAGLINE,
        "status": "online",
        "docs_url": "/docs",
        "branding": {
            "primary": "#2563EB",
            "secondary": "#0F172A",
            "accent": "#38BDF8"
        }
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "interclue-backend"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
