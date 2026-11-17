from database import db

def get_recommended_handymen(category: str, limit: int = 5) -> list[dict]:
    """Ranks handymen using composite score: highest average rating & total reviews."""
    cursor = db.users.find({
        "role": "Handyman",
        "handyman_profile.is_available": True
    }).sort([
        ("handyman_profile.average_rating", -1),
        ("handyman_profile.total_reviews", -1)
    ]).limit(limit)

    recommendations = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        doc.pop("password_hash", None)
        recommendations.append(doc)

    return recommendations