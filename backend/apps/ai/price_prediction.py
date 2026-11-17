from database import db

def predict_job_price(service_category: str, estimated_hours: float) -> dict:
    """Calculates estimated price range using historical average hourly rates."""
    pipeline = [
        {"$match": {"category": service_category}},
        {"$group": {"_id": None, "avg_price": {"$avg": "$base_price"}}}
    ]
    res = list(db.services.aggregate(pipeline))
    base_rate = res[0]["avg_price"] if res else 50.0  # Fallback default $50/hr

    estimated_total = round(base_rate * estimated_hours, 2)
    return {
        "category": service_category,
        "estimated_hours": estimated_hours,
        "suggested_price": estimated_total,
        "price_range": {
            "min": round(estimated_total * 0.85, 2),
            "max": round(estimated_total * 1.15, 2)
        }
    }