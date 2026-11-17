from database import db
from bson import ObjectId

def add_portfolio_item(user_id: str, item: dict):
    """
    Appends a new completed work photo/item to the handyman's portfolio list.
    """
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$push": {"handyman_profile.portfolio": item}}
    )

def remove_portfolio_item(user_id: str, image_url: str):
    """
    Removes a portfolio item by image URL.
    """
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$pull": {"handyman_profile.portfolio": {"image_url": image_url}}}
    )