from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from database import db
from apps.complaints.schemas import ComplaintCreateSchema, ComplaintStatusUpdateSchema
from apps.complaints.status import update_complaint_status
from apps.authentication.permissions import require_role
from apps.authentication.models import UserRole

router = APIRouter()

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_complaint(
    payload: ComplaintCreateSchema,
    current_user: dict = Depends(require_role([UserRole.USER, UserRole.HANDYMAN]))
):
    ticket_doc = payload.model_dump()
    ticket_doc["raised_by_id"] = current_user["sub"]
    ticket_doc["status"] = "Open"
    ticket_doc["created_at"] = datetime.utcnow()

    res = db.complaints.insert_one(ticket_doc)
    return {"status": "success", "complaint_id": str(res.inserted_id)}

@router.get("/my-tickets")
def get_user_complaints(current_user: dict = Depends(require_role([UserRole.USER, UserRole.HANDYMAN]))):
    cursor = db.complaints.find({"raised_by_id": current_user["sub"]}).sort("created_at", -1)
    tickets = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        tickets.append(doc)
    return tickets

@router.put("/{complaint_id}/status")
def update_status(
    complaint_id: str,
    payload: ComplaintStatusUpdateSchema,
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    return update_complaint_status(complaint_id, payload.status.value, payload.resolution_notes)