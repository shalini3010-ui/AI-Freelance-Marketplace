from typing import Optional, Dict
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum

class BookingStatusEnum(str, Enum):
    PENDING = "Pending"
    CONFIRMED = "Confirmed"
    ACCEPTED = "Accepted"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"

class BookingCreateSchema(BaseModel):
    serviceId: str
    serviceTitle: Optional[str] = None
    date: str
    time: str
    address: str
    notes: Optional[str] = None
    estimatedHours: int = Field(default=1, ge=1)
    expressPriority: bool = False
    includeMaterials: bool = False
    totalAmount: float

class BookingStatusUpdateSchema(BaseModel):
    status: BookingStatusEnum

# --- Rating & Review Schemas ---

class CategoryRatingsSchema(BaseModel):
    punctuality: int = Field(default=5, ge=1, le=5)
    quality: int = Field(default=5, ge=1, le=5)
    communication: int = Field(default=5, ge=1, le=5)

class RatingCreateSchema(BaseModel):
    bookingId: str
    rating: int = Field(ge=1, le=5)
    categories: Optional[CategoryRatingsSchema] = None

class ReviewCreateSchema(BaseModel):
    handymanId: Optional[str] = None
    userName: Optional[str] = "Anonymous User"
    comment: str
    rating: int = Field(default=5, ge=1, le=5)