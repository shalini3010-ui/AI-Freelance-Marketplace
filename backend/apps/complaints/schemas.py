from typing import Optional
from pydantic import BaseModel
from enum import Enum

class ComplaintStatusEnum(str, Enum):
    OPEN = "Open"
    UNDER_REVIEW = "Under Review"
    RESOLVED = "Resolved"
    REJECTED = "Rejected"

class ComplaintCreateSchema(BaseModel):
    booking_id: Optional[str] = None
    against_user_id: Optional[str] = None
    subject: str
    description: str

class ComplaintStatusUpdateSchema(BaseModel):
    status: ComplaintStatusEnum
    resolution_notes: Optional[str] = None