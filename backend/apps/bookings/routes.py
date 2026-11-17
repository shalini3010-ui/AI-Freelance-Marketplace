from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from database import db
from apps.bookings.schemas import BookingCreateSchema, BookingStatusUpdateSchema
from apps.bookings.tracking import update_booking_workflow
from apps.bookings.history import get_user_booking_history
from apps.authentication.permissions import require_role
from apps.authentication.models import UserRole

router = APIRouter(tags=["Bookings"])

@router.post("/", status_code=status.HTTP_201_CREATED)
@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/user/bookings", status_code=status.HTTP_201_CREATED)
@router.post("/user/bookings/", status_code=status.HTTP_201_CREATED)
def create_booking(
    payload: BookingCreateSchema,
    current_user: dict = Depends(require_role([UserRole.USER, UserRole.ADMIN]))
):
    """Creates a new service booking request with add-ons and cost calculation."""
    booking_doc = payload.model_dump()
    user_id = str(current_user.get("sub") or current_user.get("id") or current_user.get("_id"))
    booking_doc["user_id"] = user_id
    booking_doc["status"] = "Pending"
    booking_doc["rated"] = False
    booking_doc["created_at"] = datetime.utcnow()

    res = db.bookings.insert_one(booking_doc)
    return {
        "status": "success",
        "booking_id": str(res.inserted_id),
        "totalAmount": payload.totalAmount
    }

@router.get("/history")
@router.get("/history/")
@router.get("/user/bookings/history")
def booking_history(current_user: dict = Depends(require_role([UserRole.USER, UserRole.HANDYMAN, UserRole.ADMIN]))):
    user_id = str(current_user.get("sub") or current_user.get("id") or current_user.get("_id"))
    role = str(current_user.get("role", "User"))
    return get_user_booking_history(user_id, role)

@router.put("/{booking_id}/status")
def change_booking_status(
    booking_id: str,
    payload: BookingStatusUpdateSchema,
    current_user: dict = Depends(require_role([UserRole.USER, UserRole.HANDYMAN, UserRole.ADMIN]))
):
    return update_booking_workflow(booking_id, payload.status.value, current_user["sub"])