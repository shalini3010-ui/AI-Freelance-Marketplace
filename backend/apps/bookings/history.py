from database import db
from bson import ObjectId

def get_user_booking_history(user_id: str, role: str) -> list[dict]:
    """
    Fetches full booking logs for a user, handyman, or system administrator.
    """
    if role == "Admin":
        query = {}
    elif role == "Handyman":
        query = {"handyman_id": user_id}
    else:
        query = {"user_id": user_id}

    cursor = db.bookings.find(query).sort("created_at", -1)
    
    history = []
    for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        
        # Ensure user_id and handyman_id string representation
        if "created_at" in doc and hasattr(doc["created_at"], "isoformat"):
            doc["created_at"] = doc["created_at"].isoformat()
            
        history.append(doc)
        
    return history