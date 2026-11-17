from typing import Optional
from pydantic import BaseModel, Field

class CategorySchema(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None

class ServiceCreateSchema(BaseModel):
    title: str
    category: str
    description: str
    base_price: float
    handyman_name: Optional[str] = "John Doe"
    estimated_hours: Optional[float] = 1.0
    tags: list[str] = []

class ServiceResponseSchema(BaseModel):
    id: str
    title: str
    category: str
    price: float
    amount: float
    handyman_name: str
    rating: float = 4.8
    reviews_count: int = 15
    icon: Optional[str] = "🛠️"