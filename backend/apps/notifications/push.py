from datetime import datetime
from database import db
from bson import ObjectId

def create_push_notification(
    user_id: str, 
    title: str, 
    message: str, 
    notif_type: str = "system",
    metadata: dict = None
) -> str:
    """Stores an in-app notification in MongoDB."""
    doc = {
        "user_id": str(user_id),
        "title": title,
        "message": message,
        "type": notif_type,  # 'booking', 'payment', 'dispatch', 'system', 'promo'
        "metadata": metadata or {},
        "is_read": False,
        "created_at": datetime.utcnow()
    }
    res = db.notifications.insert_one(doc)
    return str(res.inserted_id)

def create_booking_notification(user_id: str, booking_id: str, title: str, message: str) -> str:
    """Shortcut helper for booking and dispatch state changes."""
    return create_push_notification(
        user_id=user_id,
        title=title,
        message=message,
        notif_type="booking",
        metadata={"booking_id": booking_id}
    )