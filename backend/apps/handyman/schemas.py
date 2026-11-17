from typing import Optional, List
from pydantic import BaseModel

class WorkDayScheduleSchema(BaseModel):
    day: str  # e.g., "Monday"
    start_time: str  # "09:00"
    end_time: str    # "17:00"
    is_active: bool = True

class AvailabilityUpdateSchema(BaseModel):
    is_available: bool
    schedules: Optional[List[WorkDayScheduleSchema]] = None
    working_hours: Optional[dict] = None
    service_radius: Optional[int] = None
    emergency_callouts: Optional[bool] = None

class PortfolioItemSchema(BaseModel):
    title: str
    description: str
    image_url: Optional[str] = None
    category: Optional[str] = None
    date: Optional[str] = None

class HandymanDashboardSchema(BaseModel):
    total_earnings: float
    completed_jobs_count: int
    pending_jobs_count: int
    is_available: bool
    category: Optional[str] = None  # Handyman job category
    full_name: Optional[str] = None
    recent_jobs: List[dict]

class BookingStatusUpdateSchema(BaseModel):
    status: str

class HandymanProfileUpdateSchema(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    category: Optional[str] = None
    area: Optional[str] = None
    experience: Optional[str] = None
    bio: Optional[str] = None
    hourly_rate: Optional[float] = None
    service_radius: Optional[int] = None
