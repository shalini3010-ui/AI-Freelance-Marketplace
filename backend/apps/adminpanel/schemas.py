from typing import Optional
from pydantic import BaseModel, Field

class UserStatusUpdateSchema(BaseModel):
    user_id: Optional[str] = None
    is_active: bool

class HandymanVerificationSchema(BaseModel):
    handyman_id: Optional[str] = None
    is_verified: Optional[bool] = None
    status: Optional[str] = None
    rejection_reason: Optional[str] = None

class WorkerStatusUpdateSchema(BaseModel):
    status: str = Field(..., description="Approved, Pending, or Rejected")
    reason: Optional[str] = None

class ServiceCreateAdminSchema(BaseModel):
    title: str = Field(..., min_length=2)
    category: str = Field(..., min_length=2)
    price: float = Field(..., gt=0)
    description: Optional[str] = "Professional home service"
    icon: Optional[str] = "🛠️"
    handyman_name: Optional[str] = "FixIt Specialist"

class BroadcastNotificationSchema(BaseModel):
    title: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1)
    priority: Optional[str] = "Normal"
    color: Optional[str] = "#4f46e5"

class ComplaintStatusAdminSchema(BaseModel):
    status: str = Field(..., description="Open, In Progress, or Resolved")
    resolution_notes: Optional[str] = None