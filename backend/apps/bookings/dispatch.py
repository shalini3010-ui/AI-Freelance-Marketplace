from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from database import db
from apps.authentication.permissions import get_current_handyman
from apps.bookings.schemas import BookingStatusEnum, BookingStatusUpdateSchema

router = APIRouter(prefix="/handyman", tags=["Handyman Dispatches"])

@router.get("/dispatches")
async def get_handyman_dispatches(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_handyman)
):
    """Fetch active dispatches assigned to or available for the authenticated handyman."""
    handyman_id = current_user.get("sub")
    
    query = {
        "$or": [
            {"handyman_id": handyman_id},
            {"status": "Pending"}  # Unassigned pending jobs
        ]
    }
    
    if status:
        query["status"] = status

    cursor = db.bookings.find(query).sort("created_at", -1)
    
    dispatches = []
    for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        dispatches.append(doc)
        
    return dispatches


@router.put("/dispatches/{dispatch_id}/status")
async def update_dispatch_status(
    dispatch_id: str, 
    payload: BookingStatusUpdateSchema, 
    current_user: dict = Depends(get_current_handyman)
):
    """
    Update dispatch status: 'Accepted' -> 'En Route' -> 'In Progress' -> 'Completed'.
    Automatically assigns the handyman ID if accepted.
    """
    try:
        booking = db.bookings.find_one({"_id": ObjectId(dispatch_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid dispatch ID format")

    if not booking:
        raise HTTPException(status_code=404, detail="Dispatch order not found")

    update_fields = {
        "status": payload.status.value,
        "updated_at": datetime.utcnow()
    }

    # Assign handyman on initial acceptance
    if payload.status == BookingStatusEnum.ACCEPTED and not booking.get("handyman_id"):
        update_fields["handyman_id"] = current_user["sub"]

    db.bookings.update_one(
        {"_id": ObjectId(dispatch_id)},
        {"$set": update_fields}
    )

    return {
        "status": "success",
        "dispatch_id": dispatch_id,
        "new_status": payload.status.value
    }