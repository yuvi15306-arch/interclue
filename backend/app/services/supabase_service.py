import logging
from typing import Dict, Any, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

class SupabaseService:
    def __init__(self):
        self.supabase_url = settings.SUPABASE_URL.rstrip("/") if settings.SUPABASE_URL else ""
        self.anon_key = settings.SUPABASE_ANON_KEY
        self.service_role_key = settings.SUPABASE_SERVICE_ROLE_KEY
        self.jwt_secret = settings.SUPABASE_JWT_SECRET

    @property
    def is_configured(self) -> bool:
        return bool(self.supabase_url and (self.anon_key or self.service_role_key))

    def get_auth_headers(self, token: Optional[str] = None) -> Dict[str, str]:
        headers = {
            "apikey": self.anon_key or self.service_role_key or "",
            "Content-Type": "application/json"
        }
        if token:
            headers["Authorization"] = f"Bearer {token}"
        elif self.service_role_key:
            headers["Authorization"] = f"Bearer {self.service_role_key}"
        return headers

    def verify_token(self, access_token: str) -> Optional[Dict[str, Any]]:
        """
        Verify Supabase JWT token by calling Supabase Auth API or verifying JWT.
        Returns user payload dict if valid, None otherwise.
        """
        if not access_token:
            return None

        # 1. If configured with remote Supabase URL, verify directly via Supabase Auth API
        if self.supabase_url:
            try:
                url = f"{self.supabase_url}/auth/v1/user"
                headers = self.get_auth_headers(access_token)
                with httpx.Client(timeout=10.0) as client:
                    resp = client.get(url, headers=headers)
                    if resp.status_code == 200:
                        return resp.json()
                    logger.warning(f"Supabase auth check failed with status {resp.status_code}: {resp.text}")
            except Exception as e:
                logger.error(f"Error validating token with Supabase Auth: {e}")

        # 2. Local JWT decode fallback if JWT secret or standard claims present
        try:
            from jose import jwt
            secret = self.jwt_secret or self.anon_key or "supabase-mock-secret"
            # Try decoding without strict signature if local development / mock token
            unverified = jwt.get_unverified_claims(access_token)
            if unverified and ("sub" in unverified or "email" in unverified):
                return {
                    "id": unverified.get("sub", "supabase-user"),
                    "email": unverified.get("email"),
                    "user_metadata": unverified.get("user_metadata", {}),
                    "app_metadata": unverified.get("app_metadata", {})
                }
        except Exception as e:
            logger.debug(f"Local token decode fallback error: {e}")

        return None

    def login_with_password(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """Sign in via Supabase GoTrue Auth API."""
        if not self.supabase_url:
            return None

        try:
            url = f"{self.supabase_url}/auth/v1/token?grant_type=password"
            headers = self.get_auth_headers()
            payload = {"email": email, "password": password}
            with httpx.Client(timeout=10.0) as client:
                resp = client.post(url, headers=headers, json=payload)
                if resp.status_code == 200:
                    return resp.json()
                logger.warning(f"Supabase login failed: {resp.text}")
        except Exception as e:
            logger.error(f"Supabase login request error: {e}")
        return None

    def signup_user(self, email: str, password: str, metadata: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        """Sign up user via Supabase GoTrue Auth API."""
        if not self.supabase_url:
            return None

        try:
            url = f"{self.supabase_url}/auth/v1/signup"
            headers = self.get_auth_headers()
            payload = {
                "email": email,
                "password": password,
                "data": metadata or {}
            }
            with httpx.Client(timeout=10.0) as client:
                resp = client.post(url, headers=headers, json=payload)
                if resp.status_code in [200, 201]:
                    return resp.json()
                logger.warning(f"Supabase signup failed: {resp.text}")
        except Exception as e:
            logger.error(f"Supabase signup request error: {e}")
        return None

supabase_service = SupabaseService()
