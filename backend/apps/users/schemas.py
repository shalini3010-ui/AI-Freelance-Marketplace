from typing import Optional
from pydantic import BaseModel, EmailStr

class UserProfileUpdateSchema(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None

class UserDashboardResponseSchema(BaseModel):
    user_info: dict
    active_bookings_count: int
    completed_bookings_count: int
    recent_bookings: list[dict]