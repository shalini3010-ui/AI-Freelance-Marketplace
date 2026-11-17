from typing import Optional, List
from fastapi import APIRouter, Query
from database import db

router = APIRouter(prefix="/maps", tags=["Maps & Nearby Workers"])

def find_nearby_handymen(
    longitude: float, 
    latitude: float, 
    max_distance_meters: int = 10000,
    category: Optional[str] = None,
    max_rate: Optional[float] = None
) -> list[dict]:
    """
    Executes a 2dsphere `$near` geospatial query to find available handymen within radius.
    """
    query = {
        "role": "Handyman",
        "handyman_profile.is_available": True,
        "handyman_profile.location": {
            "$near": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": [longitude, latitude]
                },
                "$maxDistance": max_distance_meters
            }
        }
    }

    if category and category != "All":
        query["handyman_profile.category"] = category

    if max_rate is not None:
        query["handyman_profile.hourly_rate"] = {"$lte": max_rate}

    cursor = db.users.find(query, {"password_hash": 0})
    nearby_workers = []
    
    for doc in cursor:
        nearby_workers.append({
            "id": str(doc["_id"]),
            "name": doc.get("name", "Handyman"),
            "category": doc.get("handyman_profile", {}).get("category", "General"),
            "hourlyRate": doc.get("handyman_profile", {}).get("hourly_rate", 40),
            "averageRating": doc.get("handyman_profile", {}).get("average_rating", 5.0),
            "totalReviews": doc.get("handyman_profile", {}).get("total_reviews", 0),
            "coordinates": doc.get("handyman_profile", {}).get("location", {}).get("coordinates", [longitude, latitude])
        })

    return nearby_workers

@router.get("/nearby-workers")
async def get_nearby_workers_endpoint(
    longitude: float = Query(...),
    latitude: float = Query(...),
    radius_km: float = Query(10.0),
    category: Optional[str] = Query(None),
    maxRate: Optional[float] = Query(None)
):
    """
    API endpoint to list active handymen near given coordinates.
    """
    max_distance_meters = int(radius_km * 1000)
    workers = find_nearby_handymen(
        longitude=longitude,
        latitude=latitude,
        max_distance_meters=max_distance_meters,
        category=category,
        max_rate=maxRate
    )
    return {"status": "success", "count": len(workers), "workers": workers}