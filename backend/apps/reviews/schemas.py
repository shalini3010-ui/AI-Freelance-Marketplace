from datetime import datetime
from typing import Optional, Dict
from pydantic import BaseModel, Field

class CategoryRatingsSchema(BaseModel):
    punctuality: int = Field(default=5, ge=1, le=5)
    quality: int = Field(default=5, ge=1, le=5)
    pricing: int = Field(default=5, ge=1, le=5)
    communication: int = Field(default=5, ge=1, le=5)

class ReviewCreateSchema(BaseModel):
    handyman_id: Optional[str] = Field(None, alias="handymanId")
    handyman_name: Optional[str] = Field(None, alias="handymanName")
    service_title: Optional[str] = Field(None, alias="serviceTitle")
    booking_id: Optional[str] = Field(None, alias="bookingId")
    user_name: Optional[str] = Field("Anonymous User", alias="userName")
    rating: float = Field(default=5.0, ge=1.0, le=5.0)
    comment: Optional[str] = None
    category: Optional[str] = "Service Quality"
    would_recommend: Optional[bool] = True
    categories: Optional[CategoryRatingsSchema] = None

    class Config:
        populate_by_name = True

class FeedbackReplySchema(BaseModel):
    reply_text: Optional[str] = Field(None, alias="replyText")
    reply: Optional[str] = None

    class Config:
        populate_by_name = True

    def get_text(self) -> str:
        text = self.reply_text or self.reply or ""
        return text.strip()

class FeedbackStatusUpdateSchema(BaseModel):
    status: str = Field(..., description="Approved, Flagged, Under Review, or Archived")

class RatingCreateSchema(BaseModel):
    booking_id: str = Field(..., alias="bookingId")
    handyman_id: Optional[str] = Field(None, alias="handymanId")
    rating: int = Field(..., ge=1, le=5)
    categories: Optional[CategoryRatingsSchema] = None

    class Config:
        populate_by_name = True