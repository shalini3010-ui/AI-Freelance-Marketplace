import math
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/maps", tags=["Maps & Navigation"])

class NavigationRoutePayload(BaseModel):
    origin: list[float]       # [longitude, latitude]
    destination: list[float]  # [longitude, latitude]

def calculate_distance_and_eta(origin: list[float], destination: list[float]) -> dict:
    """
    Calculates Haversine distance and estimates travel time between two [lon, lat] points.
    """
    lon1, lat1 = origin
    lon2, lat2 = destination

    # Haversine formula
    R = 6371.0  # Radius of Earth in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance_km = R * c

    # Assume average city driving speed of 30 km/h
    eta_minutes = round((distance_km / 30) * 60)

    return {
        "distance_km": round(distance_km, 2),
        "estimated_time_minutes": eta_minutes if eta_minutes > 1 else 1
    }

@router.post("/calculate-eta")
async def get_route_eta(payload: NavigationRoutePayload):
    """
    Returns travel distance and estimated time of arrival between two GPS points.
    """
    if len(payload.origin) != 2 or len(payload.destination) != 2:
        raise HTTPException(status_code=400, detail="Coordinates must be [longitude, latitude] arrays.")

    route_info = calculate_distance_and_eta(payload.origin, payload.destination)
    return {"status": "success", **route_info}