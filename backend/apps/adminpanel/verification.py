from datetime import datetime
from bson import ObjectId
from database import db
from fastapi import HTTPException

def verify_handyman_documents(handyman_id: str, is_verified: bool, reason: str = None) -> dict:
    """
    Approves or rejects handyman identity and professional documents.
    """
    user = db.users.find_one({"_id": ObjectId(handyman_id), "role": "Handyman"})
    if not user:
        raise HTTPException(status_code=404, detail="Handyman record not found")

    update_payload = {
        "is_verified": is_verified,
        "handyman_profile.verification_status": "Approved" if is_verified else "Rejected",
        "handyman_profile.verified_at": datetime.utcnow()
    }
    if reason:
        update_payload["handyman_profile.rejection_reason"] = reason

    db.users.update_one({"_id": ObjectId(handyman_id)}, {"$set": update_payload})
    return {"status": "success", "handyman_id": handyman_id, "is_verified": is_verified}