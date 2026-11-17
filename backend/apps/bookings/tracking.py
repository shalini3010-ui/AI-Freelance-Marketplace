from datetime import datetime
from database import db
from bson import ObjectId
from fastapi import HTTPException, status

VALID_TRANSITIONS = {
    "Pending": ["Confirmed", "Cancelled"],
    "Confirmed": ["Accepted", "Cancelled"],
    "Accepted": ["In Progress", "Cancelled"],
    "In Progress": ["Completed", "Cancelled"],
    "Completed": [],
    "Cancelled": []
}

def update_booking_workflow(booking_id: str, new_status: str, user_id: str) -> dict:
    """
    Validates and processes state transitions for a booking order.
    """
    try:
        booking = db.bookings.find_one({"_id": ObjectId(booking_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid booking ID format"
        )

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Booking order not found"
        )

    current_status = booking.get("status", "Pending")

    # Enforce workflow state transition rules
    allowed_next_states = VALID_TRANSITIONS.get(current_status, [])
    if new_status not in allowed_next_states and new_status != current_status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition status from '{current_status}' to '{new_status}'."
        )

    update_payload = {
        "status": new_status,
        "updated_at": datetime.utcnow()
    }

    if new_status == "Completed":
        update_payload["completed_at"] = datetime.utcnow()

    db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": update_payload}
    )

    return {
        "status": "success",
        "booking_id": booking_id,
        "previous_status": current_status,
        "new_status": new_status
    }