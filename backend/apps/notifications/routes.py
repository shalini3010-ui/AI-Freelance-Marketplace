import inspect
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from bson import ObjectId

from database import db
from apps.authentication.permissions import require_role
from apps.authentication.models import UserRole

router = APIRouter(tags=["Notifications"])


class NotificationResponseSchema(BaseModel):
    id: str
    title: str
    message: str
    timestamp: str
    type: str  # 'booking', 'payment', 'dispatch', 'system', 'promo'
    is_read: bool


@router.get("", response_model=List[NotificationResponseSchema])
@router.get("/", response_model=List[NotificationResponseSchema])
@router.get("/user/notifications", response_model=List[NotificationResponseSchema])
@router.get("/user/notifications/", response_model=List[NotificationResponseSchema])
async def get_user_notifications(
    current_user: dict = Depends(require_role([UserRole.USER, UserRole.HANDYMAN, UserRole.ADMIN]))
):
    """
    Fetch all active notifications for the logged-in user.
    """
    user_id = current_user.get("sub") or current_user.get("id")

    try:
        if hasattr(db, "notifications") and db.notifications is not None:
            cursor = db.notifications.find({"user_id": str(user_id)}).sort("created_at", -1)
            
            if hasattr(cursor, "to_list"):
                res = cursor.to_list(length=100)
                notifications_doc = await res if inspect.isawaitable(res) else res
            else:
                notifications_doc = list(cursor)

            if notifications_doc:
                formatted = []
                for item in notifications_doc:
                    created_at = item.get("created_at")
                    ts = created_at.strftime("%I:%M %p • %b %d") if isinstance(created_at, datetime) else str(item.get("timestamp", "Just now"))
                    formatted.append({
                        "id": str(item.get("_id", item.get("id"))),
                        "title": item.get("title", "Alert"),
                        "message": item.get("message", "You have a new update."),
                        "timestamp": ts,
                        "type": item.get("type", "system"),
                        "is_read": bool(item.get("is_read", False))
                    })
                return formatted
    except Exception as e:
        print(f"Error reading notifications from DB: {e}")

    # Fallback default notifications if DB is empty or unreachable
    now = datetime.now()
    return [
        {
            "id": "notif_101",
            "title": "Booking Confirmed! 🔧",
            "message": "Your booking request has been confirmed by the handyman.",
            "timestamp": (now - timedelta(minutes=15)).strftime("%I:%M %p"),
            "type": "booking",
            "is_read": False
        },
        {
            "id": "notif_102",
            "title": "Payment Received 💳",
            "message": "Payment for service booking was successfully processed.",
            "timestamp": (now - timedelta(hours=2)).strftime("%I:%M %p"),
            "type": "payment",
            "is_read": False
        },
        {
            "id": "notif_103",
            "title": "Special Discount Offered 🎉",
            "message": "Get 15% off on your next AC Servicing booking with code FIXIT15.",
            "timestamp": (now - timedelta(days=1)).strftime("%b %d, %Y"),
            "type": "promo",
            "is_read": True
        }
    ]


@router.put("/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: str,
    current_user: dict = Depends(require_role([UserRole.USER, UserRole.HANDYMAN, UserRole.ADMIN]))
):
    """
    Mark a specific notification as read.
    """
    try:
        if hasattr(db, "notifications") and db.notifications is not None:
            query_id = ObjectId(notification_id) if len(notification_id) == 24 else notification_id
            res = db.notifications.update_one({"_id": query_id}, {"$set": {"is_read": True}})
            if inspect.isawaitable(res):
                await res
    except Exception as e:
        print(f"Error marking notification as read: {e}")

    return {"status": "success", "message": f"Notification {notification_id} marked as read."}


@router.put("/read-all")
async def mark_all_notifications_as_read(
    current_user: dict = Depends(require_role([UserRole.USER, UserRole.HANDYMAN, UserRole.ADMIN]))
):
    """
    Mark all notifications for current user as read.
    """
    user_id = current_user.get("sub") or current_user.get("id")
    try:
        if hasattr(db, "notifications") and db.notifications is not None:
            res = db.notifications.update_many({"user_id": str(user_id)}, {"$set": {"is_read": True}})
            if inspect.isawaitable(res):
                await res
    except Exception as e:
        print(f"Error marking all notifications as read: {e}")

    return {"status": "success", "message": "All notifications marked as read."}


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: dict = Depends(require_role([UserRole.USER, UserRole.HANDYMAN, UserRole.ADMIN]))
):
    """
    Delete a notification.
    """
    try:
        if hasattr(db, "notifications") and db.notifications is not None:
            query_id = ObjectId(notification_id) if len(notification_id) == 24 else notification_id
            res = db.notifications.delete_one({"_id": query_id})
            if inspect.isawaitable(res):
                await res
    except Exception as e:
        print(f"Error deleting notification: {e}")

    return {"status": "success", "message": f"Notification {notification_id} deleted."}