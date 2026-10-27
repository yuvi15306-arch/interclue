from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.endpoints.auth import get_current_user
from app.models.user import User
from app.schemas.analytics import DashboardResponse
from app.services.analytics_service import analytics_service

router = APIRouter()


@router.get("/", response_model=DashboardResponse)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    data = analytics_service.get_dashboard_data(db, current_user)
    return data
