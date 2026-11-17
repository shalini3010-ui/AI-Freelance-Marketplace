from datetime import datetime
from bson import ObjectId
from database import db
from fastapi import HTTPException

def update_complaint_status(complaint_id: str, new_status: str, notes: str = None) -> dict:
    complaint = db.complaints.find_one({"_id": ObjectId(complaint_id)})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint ticket not found")

    update_payload = {
        "status": new_status,
        "updated_at": datetime.utcnow()
    }
    if notes:
        update_payload["resolution_notes"] = notes

    db.complaints.update_one(
        {"_id": ObjectId(complaint_id)},
        {"$set": update_payload}
    )
    return {"complaint_id": complaint_id, "previous_status": complaint["status"], "new_status": new_status}