from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from bson import ObjectId
from database import db
from apps.authentication.permissions import get_current_handyman

router = APIRouter(prefix="/maps", tags=["Maps & Tracking"])

class LocationUpdatePayload(BaseModel):
    latitude: float
    longitude: float

def update_handyman_location(handyman_id: str, longitude: float, latitude: float) -> dict:
    """
    Updates live GPS location for a handyman in MongoDB.
    Requires a 2dsphere index on `handyman_profile.location`.
    """
    location_point = {
        "type": "Point",
        "coordinates": [longitude, latitude]
    }

    db.users.update_one(
        {"_id": ObjectId(handyman_id)},
        {
            "$set": {
                "handyman_profile.location": location_point,
                "handyman_profile.last_location_update": datetime.utcnow()
            }
        }
    )
    return {"status": "success", "handyman_id": handyman_id, "location": location_point}

@router.put("/update-location")
async def update_my_location(
    payload: LocationUpdatePayload,
    current_user: dict = Depends(get_current_handyman)
):
    """
    Handyman live tracking endpoint to stream real-time GPS coordinates.
    """
    handyman_id = current_user.get("sub") or current_user.get("id")
    try:
        res = update_handyman_location(
            handyman_id=handyman_id,
            longitude=payload.longitude,
            latitude=payload.latitude
        )
        return res
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to update GPS location: {str(e)}"
        )