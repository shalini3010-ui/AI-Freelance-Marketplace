from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from bson import ObjectId
from pydantic import BaseModel, Field

# Internal imports (Adjust database & auth paths according to your app imports)
from database import db
from apps.authentication.permissions import get_current_handyman

router = APIRouter(prefix="/dispatches", tags=["Handyman Dispatches"])


# ==========================================
# Pydantic Schemas
# ==========================================

class LocationGeoJSON(BaseModel):
    type: str = "Point"
    coordinates: List[float] = Field(..., description="[longitude, latitude]")


class DispatchResponse(BaseModel):
    id: str = Field(..., alias="_id")
    booking_id: str
    customer_name: str
    customer_phone: str
    service_title: str
    urgency: str = "Standard"
    status: str
    price: float
    location_address: str
    location_geo: Optional[LocationGeoJSON] = None
    created_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class StatusUpdateSchema(BaseModel):
    status: str = Field(..., description="Target status: Accepted, En Route, In Progress, Completed, Cancelled")


# ==========================================
# Dispatch Helper Logic
# ==========================================

def auto_create_payment_record(booking: dict, handyman_id: str):
    """
    Creates a payment ledger entry automatically when a job status transitions to 'Completed'.
    """
    payment_doc = {
        "booking_id": str(booking["_id"]),
        "handyman_id": handyman_id,
        "customer_id": str(booking.get("customer_id", "")),
        "amount": booking.get("price", 0.0),
        "payment_method": booking.get("payment_method", "UPI"),
        "status": "Completed",
        "created_at": datetime.utcnow()
    }
    db.payments.insert_one(payment_doc)


# ==========================================
# Dispatch Endpoints
# ==========================================

@router.get("", response_model=List[DispatchResponse])
def get_nearby_or_assigned_dispatches(
    longitude: Optional[float] = Query(None, description="Handyman current longitude"),
    latitude: Optional[float] = Query(None, description="Handyman current latitude"),
    max_distance_meters: int = Query(10000, description="Max radial distance in meters (default 10km)"),
    current_user: dict = Depends(get_current_handyman)
):
    """
    Fetch active dispatches assigned to the authenticated handyman OR unassigned 
    requests within spatial proximity (MongoDB $near 2dsphere query).
    """
    handyman_id = str(current_user.get("_id") or current_user.get("sub") or current_user.get("id") or "")
    query_conditions = []

    # 1. Condition: Already assigned to this handyman
    if handyman_id:
        query_conditions.append({"handyman_id": handyman_id})

    # 2. Condition: Unassigned/Pending requests matching handyman category & nearby location
    unassigned_query = {
        "status": "Pending",
        "handyman_id": None
    }

    # Add category filter if present on handyman profile
    category = current_user.get("category")
    if category:
        unassigned_query["category"] = category

    # Spatial 2dsphere Query
    if longitude is not None and latitude is not None:
        unassigned_query["location_geo"] = {
            "$near": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": [longitude, latitude]
                },
                "$maxDistance": max_distance_meters
            }
        }

    query_conditions.append(unassigned_query)

    # Search bookings/dispatches collection
    cursor = db.bookings.find({"$or": query_conditions}).sort("created_at", -1)
    dispatches = list(cursor.limit(50))

    # Format Mongo ObjectIDs to string
    results = []
    for d in dispatches:
        d["_id"] = str(d["_id"])
        d["booking_id"] = str(d.get("booking_id", d["_id"]))
        results.append(d)

    return results


@router.post("/{dispatch_id}/accept", response_model=DispatchResponse)
async def accept_dispatch(
    dispatch_id: str,
    current_user: dict = Depends(get_current_handyman)
):
    """
    Accept an unassigned dispatch request. Locks the request to the handyman.
    """
    if not ObjectId.is_valid(dispatch_id):
        raise HTTPException(status_code=400, detail="Invalid Dispatch ID")

    handyman_id = str(current_user.get("_id") or current_user.get("sub") or current_user.get("id") or "")

    # Atomic update to avoid race conditions between multiple handymen
    updated_dispatch = db.bookings.find_one_and_update(
        {
            "_id": ObjectId(dispatch_id),
            "status": "Pending",
            "$or": [{"handyman_id": None}, {"handyman_id": handyman_id}]
        },
        {
            "$set": {
                "handyman_id": handyman_id,
                "status": "Accepted",
                "accepted_at": datetime.utcnow()
            }
        },
        return_document=True
    )

    if not updated_dispatch:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Dispatch is no longer available or already accepted by another provider."
        )

    updated_dispatch["_id"] = str(updated_dispatch["_id"])
    updated_dispatch["booking_id"] = str(updated_dispatch.get("booking_id", updated_dispatch["_id"]))
    return updated_dispatch


@router.put("/{dispatch_id}/status")
def update_dispatch_status(
    dispatch_id: str,
    payload: StatusUpdateSchema,
    current_user: dict = Depends(get_current_handyman)
):
    """
    Update dispatch state transition: 'Accepted' -> 'En Route' -> 'In Progress' -> 'Completed'.
    Automatically triggers a payment ledger record when status is 'Completed'.
    """
    if not ObjectId.is_valid(dispatch_id):
        raise HTTPException(status_code=400, detail="Invalid Dispatch ID")

    valid_statuses = ["Accepted", "En Route", "In Progress", "Completed", "Cancelled"]
    if payload.status not in valid_statuses:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )

    handyman_id = str(current_user.get("_id") or current_user.get("sub") or current_user.get("id") or "")

    # Locate existing dispatch assigned to this handyman
    dispatch = db.bookings.find_one({
        "_id": ObjectId(dispatch_id),
        "handyman_id": handyman_id
    })

    if not dispatch:
        raise HTTPException(
            status_code=404, 
            detail="Dispatch record not found or not assigned to you."
        )

    # Perform status update
    update_data = {
        "status": payload.status,
        "updated_at": datetime.utcnow()
    }

    if payload.status == "Completed":
        update_data["completed_at"] = datetime.utcnow()

    db.bookings.update_one(
        {"_id": ObjectId(dispatch_id)},
        {"$set": update_data}
    )

    # Auto-trigger payment processing upon job completion
    if payload.status == "Completed":
        auto_create_payment_record(dispatch, handyman_id)

    return {
        "status": "success",
        "dispatch_id": dispatch_id,
        "new_status": payload.status,
        "message": f"Dispatch status successfully updated to {payload.status}."
    }