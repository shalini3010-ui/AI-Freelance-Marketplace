from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from apps.ai.chatbot import get_smart_chat_reply, process_chatbot_query
from apps.ai.recommendation import get_recommended_handymen
from apps.ai.price_prediction import predict_job_price
from apps.ai.demand_prediction import predict_service_demand
from apps.ai.smart_search import semantic_smart_search

router = APIRouter()


class ChatQueryRequest(BaseModel):
    message: str = Field(..., description="User question or statement")
    location: Optional[str] = Field(None, description="User current city or locality")
    user_name: Optional[str] = Field(None, description="Optional customer display name")


class ChatQueryResponse(BaseModel):
    reply: str
    suggestions: List[str] = []
    category: Optional[str] = None
    action: Optional[str] = None
    workers: Optional[List[Dict[str, Any]]] = None


@router.post("/chat", response_model=ChatQueryResponse)
@router.post("/chat/", response_model=ChatQueryResponse)
@router.post("/", response_model=ChatQueryResponse)
async def chat_with_ai(query: ChatQueryRequest):
    """
    Primary AI endpoint for intelligent, dynamic conversational assistance.
    Answers queries about plumbers, electricians, emergency dispatch, live tracking,
    pricing, and handyman recommendations.
    """
    if not query.message or not query.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be blank"
        )

    res = get_smart_chat_reply(
        user_query=query.message,
        location=query.location,
        user_name=query.user_name
    )
    return res


@router.get("/recommendations")
@router.get("/recommendations/")
async def list_ai_recommendations(category: Optional[str] = Query(None)):
    """
    Returns AI personalized recommendations for services and handymen.
    """
    try:
        recs = get_recommended_handymen(category or "General", limit=6)
        if recs:
            return recs
    except Exception as e:
        print(f"Error fetching dynamic recommendations: {e}")

    # Fallback recommendations matching UI expectation
    return [
        {
            "id": "rec_1",
            "serviceTitle": "AC Deep Cleaning & Service",
            "category": "Appliance",
            "reason": "Seasonal maintenance recommended for hot weather ahead.",
            "estimatedPrice": 399
        },
        {
            "id": "rec_2",
            "serviceTitle": "Plumbing Leakage & Pipe Check",
            "category": "Plumbing",
            "reason": "Top rated service in your registered location.",
            "estimatedPrice": 249
        },
        {
            "id": "rec_3",
            "serviceTitle": "Electrical Wiring & Circuit Check",
            "category": "Electrical",
            "reason": "Safety audit recommended to prevent voltage fluctuations.",
            "estimatedPrice": 299
        }
    ]


@router.get("/search")
async def ai_search(q: str = Query(..., min_length=1)):
    """Semantic smart search across catalog and skills."""
    return semantic_smart_search(q)


@router.get("/price-prediction")
async def get_price_prediction(category: str = Query(...), hours: float = Query(1.0)):
    return predict_job_price(category, hours)


@router.get("/demand-prediction")
async def get_demand_prediction(category: str = Query(...)):
    return predict_service_demand(category)
