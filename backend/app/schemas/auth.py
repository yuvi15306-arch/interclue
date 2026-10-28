from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class ProfileBase(BaseModel):
    target_role: str = "Full Stack Developer"
    experience_level: str = "Junior"
    interview_type_preference: str = "Mixed"
    bio: Optional[str] = None
    target_company: Optional[str] = None
    weekly_interview_goal: int = 5


class ProfileUpdate(ProfileBase):
    pass


class ProfileResponse(ProfileBase):
    id: int
    current_streak: int
    longest_streak: int
    last_interview_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    target_role: Optional[str] = "Full Stack Developer"
    experience_level: Optional[str] = "Junior"
    interview_type: Optional[str] = "Mixed"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    id_token: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    avatar_url: Optional[str] = None
    is_active: bool
    is_admin: bool
    created_at: datetime
    profile: Optional[ProfileResponse] = None
    subscription_tier: str = "free"

    model_config = ConfigDict(from_attributes=True)



class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenRefreshRequest(BaseModel):
    refresh_token: str


class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None


class SupabaseSyncRequest(BaseModel):
    access_token: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    target_role: Optional[str] = "Full Stack Developer"
    experience_level: Optional[str] = "Junior"
    interview_type: Optional[str] = "Mixed"


class SupabaseLoginRequest(BaseModel):
    email: EmailStr
    password: str


class SupabaseRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    target_role: Optional[str] = "Full Stack Developer"
    experience_level: Optional[str] = "Junior"
    interview_type: Optional[str] = "Mixed"

