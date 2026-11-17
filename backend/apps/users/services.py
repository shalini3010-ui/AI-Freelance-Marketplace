from database import db
from bson import ObjectId

def get_user_dashboard_data(user_id: str) -> dict:
    """
    Aggregates booking statistics and profile details for the customer dashboard.
    """
    # Fetch User Profile
    user = db.users.find_one({"_id": ObjectId(user_id)}, {"password_hash": 0})
    if not user:
        return {}

    user["_id"] = str(user["_id"])

    # Aggregate Booking Stats
    active_count = db.bookings.count_documents({
        "user_id": user_id, 
        "status": {"$in": ["Pending", "Accepted", "In Progress"]}
    })
    
    completed_count = db.bookings.count_documents({
        "user_id": user_id, 
        "status": "Completed"
    })

    # Fetch Recent 5 Bookings
    recent_cursor = db.bookings.find({"user_id": user_id}).sort("created_at", -1).limit(5)
    recent_bookings = []
    for b in recent_cursor:
        b["_id"] = str(b["_id"])
        recent_bookings.append(b)

    return {
        "user_info": user,
        "active_bookings_count": active_count,
        "completed_bookings_count": completed_count,
        "recent_bookings": recent_bookings
    }