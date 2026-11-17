from database import db
from bson import ObjectId

def update_handyman_availability(user_id: str, is_available: bool, schedules: list = None):
    """
    Updates a handyman's active status and weekly working schedule.
    """
    update_fields = {
        "handyman_profile.is_available": is_available
    }
    if schedules is not None:
        update_fields["handyman_profile.schedules"] = schedules

    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_fields}
    )