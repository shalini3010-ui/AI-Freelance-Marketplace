from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class UserRole(str, Enum):
    USER = "User"
    HANDYMAN = "Handyman"
    ADMIN = "Admin"

class LocationSchema(BaseModel):
    type: str = "Point"
    coordinates: list[float]  # [longitude, latitude]

class HandymanProfileSchema(BaseModel):
    skills: list[str] = []
    hourly_rate: float = 0.0
    is_available: bool = True
    bio: Optional[str] = None
    location: Optional[LocationSchema] = None

class UserInDB(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    full_name: str
    email: EmailStr
    password_hash: str
    role: UserRole = UserRole.USER
    phone: Optional[str] = None
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    handyman_profile: Optional[HandymanProfileSchema] = None