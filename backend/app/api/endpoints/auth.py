from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
    oauth2_scheme
)
from app.models.user import User, Profile
from app.models.subscription import Subscription
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    Token,
    UserResponse,
    TokenRefreshRequest,
    GoogleLoginRequest,
    ProfileUpdate,
    ProfileResponse,
    SupabaseSyncRequest,
    SupabaseLoginRequest,
    SupabaseRegisterRequest
)
from app.services.supabase_service import supabase_service

router = APIRouter()


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user account")
    return user


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    return current_user


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        is_active=True,
        is_admin=False
    )
    db.add(user)
    db.flush()

    # Create user profile with chosen target role & experience
    profile = Profile(
        user_id=user.id,
        target_role=user_in.target_role or "Full Stack Developer",
        experience_level=user_in.experience_level or "Junior",
        interview_type_preference=user_in.interview_type or "Mixed"
    )
    db.add(profile)

    # Initialize free subscription
    sub = Subscription(
        user_id=user.id,
        plan_tier="free",
        status="active"
    )
    db.add(sub)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token(data={"sub": str(user.id), "email": user.email})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower()).first()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Account is disabled")

    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token(data={"sub": str(user.id), "email": user.email})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/google", response_model=Token)
def google_sign_in(req: GoogleLoginRequest, db: Session = Depends(get_db)):
    """Handles Google One-Tap / Firebase token or mock token exchange for seamless mobile sign-in."""
    email = req.email or f"user_{req.id_token[:8]}@gmail.com"
    user = db.query(User).filter(User.email == email.lower()).first()

    if not user:
        user = User(
            email=email.lower(),
            full_name=req.full_name or "Google Candidate",
            avatar_url=req.avatar_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            google_id=req.id_token[:40],
            is_active=True
        )
        db.add(user)
        db.flush()

        profile = Profile(
            user_id=user.id,
            target_role="Full Stack Developer",
            experience_level="Junior",
            interview_type_preference="Mixed"
        )
        db.add(profile)
        sub = Subscription(user_id=user.id, plan_tier="free", status="active")
        db.add(sub)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token(data={"sub": str(user.id), "email": user.email})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/refresh", response_model=dict)
def refresh_token_endpoint(req: TokenRefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(req.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token type")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer active")

    new_access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return {"access_token": new_access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sub = db.query(Subscription).filter(Subscription.user_id == user.id, Subscription.status == "active").first()
    user_dict = {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "avatar_url": user.avatar_url,
        "is_active": user.is_active,
        "is_admin": user.is_admin,
        "created_at": user.created_at,
        "profile": user.profile,
        "subscription_tier": sub.plan_tier if sub else "free"
    }
    return user_dict


@router.put("/profile", response_model=ProfileResponse)
def update_profile(
    profile_data: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = user.profile
    if not profile:
        profile = Profile(user_id=user.id)
        db.add(profile)

    for key, value in profile_data.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return profile


@router.post("/supabase/sync", response_model=Token)
def sync_supabase_user(req: SupabaseSyncRequest, db: Session = Depends(get_db)):
    """
    Sync an authenticated Supabase user into the local InterClue database.
    Verifies the Supabase access token, creates or updates the user account,
    ensures profile and subscription are provisioned, and returns InterClue JWT.
    """
    verified = supabase_service.verify_token(req.access_token)
    email = req.email
    full_name = req.full_name
    avatar_url = req.avatar_url

    if verified:
        email = verified.get("email") or email
        user_meta = verified.get("user_metadata", {})
        full_name = full_name or user_meta.get("full_name") or user_meta.get("name") or (email.split("@")[0] if email else "Candidate")
        avatar_url = avatar_url or user_meta.get("avatar_url") or user_meta.get("picture")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to verify valid email address from Supabase authentication payload."
        )

    user = db.query(User).filter(User.email == email.lower()).first()
    if not user:
        user = User(
            email=email.lower(),
            full_name=full_name or "Supabase Candidate",
            avatar_url=avatar_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            hashed_password=None,
            is_active=True,
            is_admin=False
        )
        db.add(user)
        db.flush()

        profile = Profile(
            user_id=user.id,
            target_role=req.target_role or "Full Stack Developer",
            experience_level=req.experience_level or "Junior",
            interview_type_preference=req.interview_type or "Mixed"
        )
        db.add(profile)

        sub = Subscription(user_id=user.id, plan_tier="free", status="active")
        db.add(sub)
        db.commit()
        db.refresh(user)
    else:
        # Update profile if provided
        if req.target_role and user.profile:
            user.profile.target_role = req.target_role
        if req.experience_level and user.profile:
            user.profile.experience_level = req.experience_level
        if full_name and not user.full_name:
            user.full_name = full_name
        db.commit()
        db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token(data={"sub": str(user.id), "email": user.email})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/supabase/login", response_model=Token)
def supabase_login_endpoint(req: SupabaseLoginRequest, db: Session = Depends(get_db)):
    """Authenticate via Supabase GoTrue Auth and return InterClue session."""
    supa_resp = supabase_service.login_with_password(req.email, req.password)
    if supa_resp and "access_token" in supa_resp:
        return sync_supabase_user(
            SupabaseSyncRequest(
                access_token=supa_resp["access_token"],
                email=req.email
            ),
            db=db
        )

    # Fallback to local DB verification if Supabase remote credentials aren't configured
    return login(UserLogin(email=req.email, password=req.password), db=db)


@router.post("/supabase/signup", response_model=Token)
def supabase_signup_endpoint(req: SupabaseRegisterRequest, db: Session = Depends(get_db)):
    """Sign up a new candidate via Supabase Auth and initialize profile."""
    meta = {
        "full_name": req.full_name,
        "target_role": req.target_role,
        "experience_level": req.experience_level
    }
    supa_resp = supabase_service.signup_user(req.email, req.password, meta)
    if supa_resp and "access_token" in supa_resp:
        return sync_supabase_user(
            SupabaseSyncRequest(
                access_token=supa_resp["access_token"],
                email=req.email,
                full_name=req.full_name,
                target_role=req.target_role,
                experience_level=req.experience_level,
                interview_type=req.interview_type
            ),
            db=db
        )

    # Fallback to local registration if Supabase remote credentials are not set
    return register(
        UserRegister(
            email=req.email,
            password=req.password,
            full_name=req.full_name,
            target_role=req.target_role,
            experience_level=req.experience_level,
            interview_type=req.interview_type
        ),
        db=db
    )

